import React, { useEffect, useRef, useState } from 'react';
import {
  Camera,
  Mic,
  ShieldCheck,
  CheckCircle2,
  Eye,
  Volume2,
  Lock,
  Sparkles,
} from 'lucide-react';
import { ProctoringConsentState, ProctoringStatus } from '../types/proctoring';

interface ProctoringConsentModalProps {
  isOpen: boolean;
  stream: MediaStream | null;
  consentState: ProctoringConsentState;
  status: ProctoringStatus;
  onRequestPermissions: () => Promise<boolean>;
  onConsentChange: (agreed: boolean) => void;
  onProceedToExam: () => void;
}

export const ProctoringConsentModal: React.FC<ProctoringConsentModalProps> = ({
  isOpen,
  stream,
  consentState,
  status,
  onRequestPermissions,
  onConsentChange,
  onProceedToExam,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isRequesting, setIsRequesting] = useState(false);

  // Attach stream to video element when available
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream]);

  if (!isOpen) return null;

  const handleRequestClick = async () => {
    setIsRequesting(true);
    try {
      await onRequestPermissions();
    } finally {
      setIsRequesting(false);
    }
  };

  const hasMediaGranted = consentState.cameraGranted && consentState.micGranted;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn select-none">
      <div className="max-w-xl w-full bg-white rounded-2xl p-6 sm:p-8 border border-slate-200 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top saffron-blue-emerald tricolor accent */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-blue-600 to-emerald-600" />

        {/* Header */}
        <div className="flex items-start gap-3.5">
          <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center flex-shrink-0 text-blue-600 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700 border border-blue-200 mb-1">
              <Sparkles className="w-3 h-3" />
              Pre-Assessment Proctoring Setup
            </div>
            <h2 className="text-xl font-bold font-heading text-slate-900 tracking-tight">
              Hardware & Integrity Check
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Please grant camera and microphone access and verify your preview to start the test.
            </p>
          </div>
        </div>

        {/* Live Camera Preview & Diagnostic Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
          {/* Video Preview Box */}
          <div className="sm:col-span-7 aspect-video rounded-xl bg-slate-900 border border-slate-800 relative overflow-hidden flex items-center justify-center shadow-inner">
            {stream && consentState.cameraGranted ? (
              <>
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                {/* Face positioning guide overlay */}
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <div
                    className={`w-32 h-40 border-2 rounded-2xl transition-colors duration-300 ${
                      status.faceDetected
                        ? 'border-emerald-400 bg-emerald-500/10'
                        : 'border-amber-400/80 border-dashed bg-amber-500/5'
                    }`}
                  />
                </div>
                {/* Status chip over video */}
                <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-black/60 backdrop-blur-xs text-[10px] font-mono text-white flex items-center gap-1.5">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      status.faceDetected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                    }`}
                  />
                  <span>{status.faceDetected ? 'Face Aligned' : 'Align Face'}</span>
                </div>
              </>
            ) : (
              <div className="text-center p-4 space-y-2">
                <Camera className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                <p className="text-xs text-slate-400">Camera preview will appear here</p>
              </div>
            )}
          </div>

          {/* Device Checklist & Live Indicators */}
          <div className="sm:col-span-5 space-y-2.5">
            {/* Camera Check */}
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Camera className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-800">Camera Feed</span>
              </div>
              {consentState.cameraGranted ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Ready
                </span>
              ) : (
                <span className="text-[11px] font-medium text-slate-400">Required</span>
              )}
            </div>

            {/* Microphone Check & Live VU */}
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mic className="w-4 h-4 text-slate-600" />
                  <span className="font-medium text-slate-800">Microphone</span>
                </div>
                {consentState.micGranted ? (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                    <CheckCircle2 className="w-3 h-3" /> Ready
                  </span>
                ) : (
                  <span className="text-[11px] font-medium text-slate-400">Required</span>
                )}
              </div>
              {/* Responsive Audio Volume Bar */}
              {consentState.micGranted && (
                <div className="space-y-1 pt-1">
                  <div className="flex items-center justify-between text-[10px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Input level
                    </span>
                    <span className="font-mono">{status.audioLevel}%</span>
                  </div>
                  <div className="w-full h-1.5 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 transition-all duration-100"
                      style={{ width: `${Math.min(100, Math.max(4, status.audioLevel))}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Face & Attention Check */}
            <div className="p-2.5 rounded-xl border border-slate-200 bg-slate-50/70 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-slate-600" />
                <span className="font-medium text-slate-800">Gaze & Attention</span>
              </div>
              {status.faceDetected ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  <CheckCircle2 className="w-3 h-3" /> Verified
                </span>
              ) : (
                <span className="text-[11px] font-medium text-amber-600">Position face</span>
              )}
            </div>
          </div>
        </div>

        {/* Privacy Notice Card */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-xs text-slate-600">
          <Lock className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
          <div className="leading-relaxed text-[11px]">
            <span className="font-semibold text-slate-800 block mb-0.5">
              Privacy & Local Processing Guarantee:
            </span>
            Audio and video feeds are processed locally on your device for attention and presence validation. No continuous raw footage is stored or transmitted. Only timestamped integrity telemetry is preserved for review.
          </div>
        </div>

        {/* User Agreement Checkbox */}
        <label className="flex items-start gap-2.5 cursor-pointer text-xs text-slate-700 select-none">
          <input
            type="checkbox"
            checked={consentState.consentAgreed}
            onChange={(e) => onConsentChange(e.target.checked)}
            disabled={!hasMediaGranted}
            className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer disabled:opacity-50"
          />
          <span className={`leading-snug text-[11px] ${!hasMediaGranted ? 'text-slate-400' : 'text-slate-700 font-medium'}`}>
            I consent to automated assessment monitoring and agree to remain visible within the camera view throughout the examination.
          </span>
        </label>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          {!hasMediaGranted ? (
            <button
              onClick={handleRequestClick}
              disabled={isRequesting}
              className="w-full py-3 px-5 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              <Camera className="w-4 h-4" />
              <span>{isRequesting ? 'Requesting Access...' : 'Allow Camera & Microphone Access'}</span>
            </button>
          ) : (
            <button
              onClick={onProceedToExam}
              disabled={!consentState.consentAgreed}
              className={`w-full py-3 px-5 rounded-xl text-xs font-bold shadow-sm flex items-center justify-center gap-2 transition-colors cursor-pointer ${
                consentState.consentAgreed
                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                  : 'bg-slate-200 text-slate-400 cursor-not-allowed'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Continue to Fullscreen Assessment</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
