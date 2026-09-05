import { VisionDetectionResult } from '../types/proctoring';

// Helper declaration for optional native Shape Detection API
declare global {
  interface Window {
    FaceDetector?: any;
  }
}

export class VisionDetector {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D | null;
  private previousLuminance: number = -1;
  private width: number;
  private height: number;
  private nativeFaceDetector: any = null;

  constructor(width = 160, height = 120) {
    this.width = width;
    this.height = height;
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true });

    // Initialize native Shape Detection API if available
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        this.nativeFaceDetector = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 4 });
      } catch {
        this.nativeFaceDetector = null;
      }
    }
  }

  /**
   * Analyzes the current frame of the video element.
   * Runs in ~1-2ms on a 160x120 canvas.
   */
  public async analyzeFrame(video: HTMLVideoElement): Promise<VisionDetectionResult> {
    if (!this.ctx || video.readyState < 2 || video.videoWidth === 0) {
      return {
        faceDetected: false,
        faceCount: 0,
        isLookingAway: false,
        gazeDirection: 'UNKNOWN',
        gazeConfidence: 0,
        lightingScore: 50,
        isSceneChanged: false,
      };
    }

    try {
      this.ctx.drawImage(video, 0, 0, this.width, this.height);
      const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
      const data = imageData.data;

      // 1. Lighting and Average Luminance Analysis
      let totalLuminance = 0;
      const pixelCount = this.width * this.height;

      // 2. Skin tone and face region tracking
      let skinPixelCount = 0;
      let minX = this.width, maxX = 0, minY = this.height, maxY = 0;
      const horizontalProjection = new Int32Array(this.width);

      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        // Standard perceptual luminance formula
        const lum = 0.299 * r + 0.587 * g + 0.114 * b;
        totalLuminance += lum;

        const x = (i / 4) % this.width;
        const y = Math.floor((i / 4) / this.width);

        // Skin-tone detection heuristic (RGB rule suitable for multiple lighting conditions)
        const isSkin =
          r > 55 &&
          g > 40 &&
          b > 20 &&
          r > g &&
          r > b &&
          r - g > 12 &&
          Math.abs(r - g) >= 15;

        if (isSkin) {
          skinPixelCount++;
          horizontalProjection[x]++;
          if (x < minX) minX = x;
          if (x > maxX) maxX = x;
          if (y < minY) minY = y;
          if (y > maxY) maxY = y;
        }
      }

      const avgLuminance = totalLuminance / pixelCount;
      const lightingScore = Math.min(100, Math.max(0, Math.round((avgLuminance / 255) * 100)));

      // Scene anomaly check: significant lighting jump (>40% swing)
      const isSceneChanged =
        this.previousLuminance >= 0 && Math.abs(avgLuminance - this.previousLuminance) > 45;
      this.previousLuminance = avgLuminance;

      // Camera covered or blacked out
      const isBlackout = avgLuminance < 15;

      // 3. Multi-Face Detection via Horizontal Projection Clustering
      let separatedClusters = 0;
      let inCluster = false;
      const clusterThreshold = Math.max(4, Math.floor((maxY - minY) * 0.15));

      for (let x = 0; x < this.width; x++) {
        if (horizontalProjection[x] > clusterThreshold) {
          if (!inCluster) {
            separatedClusters++;
            inCluster = true;
          }
        } else {
          inCluster = false;
        }
      }

      // Native FaceDetector attempt if supported
      let detectedFacesCount = 0;
      let nativeBoundingBox: { x: number; y: number; width: number; height: number } | undefined;

      if (this.nativeFaceDetector) {
        try {
          const detected = await this.nativeFaceDetector.detect(this.canvas);
          if (Array.isArray(detected)) {
            detectedFacesCount = detected.length;
            if (detected.length > 0) {
              const box = detected[0].boundingBox;
              nativeBoundingBox = {
                x: box.x,
                y: box.y,
                width: box.width,
                height: box.height,
              };
            }
          }
        } catch {
          // Native detector fallback
        }
      }

      // Determine face presence from skin ratio and bounding box dimensions
      const skinRatio = skinPixelCount / pixelCount;
      const hasFaceGeometry =
        skinRatio >= 0.05 &&
        skinRatio <= 0.70 &&
        (maxX - minX) >= this.width * 0.18 &&
        (maxY - minY) >= this.height * 0.18 &&
        !isBlackout;

      const faceDetected = detectedFacesCount > 0 || hasFaceGeometry;
      const faceCount = detectedFacesCount > 0
        ? detectedFacesCount
        : (faceDetected ? (separatedClusters > 1 ? separatedClusters : 1) : 0);

      const boundingBox = nativeBoundingBox || (faceDetected ? {
        x: minX,
        y: minY,
        width: Math.max(1, maxX - minX),
        height: Math.max(1, maxY - minY),
      } : undefined);

      // 4. Eye/Gaze Direction Estimation
      // We inspect the eye zone (top 25% to 50% of the detected face bounding box)
      let gazeDirection: 'CENTER' | 'LEFT' | 'RIGHT' | 'DOWN' | 'UNKNOWN' = 'UNKNOWN';
      let isLookingAway = false;
      let gazeConfidence = 0.5;

      if (faceDetected && boundingBox) {
        const eyeZoneYStart = Math.floor(boundingBox.y + boundingBox.height * 0.20);
        const eyeZoneYEnd = Math.floor(boundingBox.y + boundingBox.height * 0.50);
        const eyeZoneXStart = Math.floor(boundingBox.x + boundingBox.width * 0.15);
        const eyeZoneXEnd = Math.floor(boundingBox.x + boundingBox.width * 0.85);

        let darkPixelsLeft = 0;
        let darkPixelsRight = 0;
        let darkPixelsCenter = 0;
        let eyeZoneTotalDark = 0;

        const faceCenterX = boundingBox.x + boundingBox.width / 2;
        const centerMargin = boundingBox.width * 0.12;

        for (let y = eyeZoneYStart; y <= eyeZoneYEnd; y++) {
          if (y < 0 || y >= this.height) continue;
          for (let x = eyeZoneXStart; x <= eyeZoneXEnd; x++) {
            if (x < 0 || x >= this.width) continue;
            const idx = (y * this.width + x) * 4;
            const r = data[idx];
            const g = data[idx + 1];
            const b = data[idx + 2];
            const lum = 0.299 * r + 0.587 * g + 0.114 * b;

            // Eyes / pupils / eyebrows are noticeably darker than surrounding skin
            if (lum < avgLuminance * 0.72) {
              eyeZoneTotalDark++;
              if (x < faceCenterX - centerMargin) {
                darkPixelsLeft++;
              } else if (x > faceCenterX + centerMargin) {
                darkPixelsRight++;
              } else {
                darkPixelsCenter++;
              }
            }
          }
        }

        // Also check if face box is shifted far away from the camera center
        const screenCenterX = this.width / 2;
        const faceOffsetFromCenter = Math.abs(faceCenterX - screenCenterX) / this.width;

        if (faceOffsetFromCenter > 0.32) {
          // Candidate's head is shifted towards the edge of frame
          isLookingAway = true;
          gazeDirection = faceCenterX < screenCenterX ? 'LEFT' : 'RIGHT';
          gazeConfidence = 0.85;
        } else if (eyeZoneTotalDark > 15) {
          const totalSideDark = darkPixelsLeft + darkPixelsRight + darkPixelsCenter;
          const leftRatio = darkPixelsLeft / totalSideDark;
          const rightRatio = darkPixelsRight / totalSideDark;

          if (leftRatio > 0.48) {
            isLookingAway = true;
            gazeDirection = 'LEFT';
            gazeConfidence = Math.min(0.9, 0.6 + leftRatio * 0.3);
          } else if (rightRatio > 0.48) {
            isLookingAway = true;
            gazeDirection = 'RIGHT';
            gazeConfidence = Math.min(0.9, 0.6 + rightRatio * 0.3);
          } else {
            isLookingAway = false;
            gazeDirection = 'CENTER';
            gazeConfidence = 0.85;
          }
        } else {
          // If dark pixel count is very low, head might be tilted downward or closed eyes
          gazeDirection = 'CENTER';
          isLookingAway = false;
          gazeConfidence = 0.6;
        }
      }

      return {
        faceDetected,
        faceCount,
        isLookingAway,
        gazeDirection,
        gazeConfidence,
        lightingScore,
        isSceneChanged,
        boundingBox,
      };
    } catch (err) {
      console.warn('[VisionDetector] Frame processing error:', err);
      return {
        faceDetected: false,
        faceCount: 0,
        isLookingAway: false,
        gazeDirection: 'UNKNOWN',
        gazeConfidence: 0,
        lightingScore: 50,
        isSceneChanged: false,
      };
    }
  }

  public destroy(): void {
    this.ctx = null;
    this.nativeFaceDetector = null;
  }
}
