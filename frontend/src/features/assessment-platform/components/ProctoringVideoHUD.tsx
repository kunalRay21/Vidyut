import React, { useRef, useEffect, useState } from 'react';
import {
  Camera,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Shield,
  FileText,
  X,
} from 'lucide-react';
import { ProctoringStatus, ProctoringEvent } from '../types/proctoring';

interface ProctoringVideoHUDProps {
  stream: MediaStream | null;
  status: ProctoringStatus;
  events: ProctoringEvent[];
  onOpenLogs?: () => void;
  onDismissWarning?: () => void;
}

export const ProctoringVideoHUD: React.FC<ProctoringVideoHUDProps> = ({
  stream,
  status,
  events,
  onOpenLogs,
  onDismissWarning,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {});
    }
  }, [stream, isMinimized]);

  return (
    <>
      {/* 1. Gentle Non-Disruptive Warning Floating Banner */}
      {status.activeWarning && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-lg w-[90%] bg-amber-500 text-slate-950 px-4 py-2.5 rounded-xl shadow-xl border border-amber-300 flex items-center justify-between gap-3 animate-fadeIn select-none">
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            <AlertTriangle className="w-4 h-4 text-slate-950 flex-shrink-0 animate-bounce" />
            <span>{status.activeWarning}</span>
          </div>
          {onDismissWarning && (
            <button
              onClick={onDismissWarning}
              className="p-1 hover:bg-amber-600/30 rounded-lg text-slate-900 transition-colors"
              title="Dismiss notification"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      {/* 2. Floating Proctoring HUD Widget (Bottom-Right) */}
      <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-2 select-none">
        {/* Main Widget Container */}
        <div className="bg-slate-900/95 backdrop-blur-md rounded-2xl border border-slate-700/80 shadow-2xl p-2.5 text-white transition-all duration-300 w-64 overflow-hidden">
          {/* Top Bar: Title, VU level, and Minimize button */}
          <div className="flex items-center justify-between px-1 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-[11px] font-bold tracking-wide uppercase text-slate-200">
                Proctoring Active
              </span>
            </div>
            <div className="flex items-center gap-1">
              {onOpenLogs && (
                <button
                  onClick={onOpenLogs}
                  className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                  title="View Proctoring Event Log"
                >
                  <FileText className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                onClick={() => setIsMinimized((prev) => !prev)}
                className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                title={isMinimized ? 'Expand camera preview' : 'Minimize preview'}
              >
                {isMinimized ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Live Video Preview (Collapsible) */}
          {!isMinimized && (
            <div className="relative aspect-video w-full rounded-xl bg-slate-950 overflow-hidden border border-slate-800 mb-2.5">
              {stream ? (
                <>
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover transform -scale-x-100"
                  />
                  {/* Subtle face target box */}
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div
                      className={`w-20 h-24 border rounded-xl transition-all duration-200 ${
                        status.faceDetected
                          ? 'border-emerald-400/70 bg-emerald-500/10'
                          : 'border-amber-400/80 border-dashed bg-amber-500/10'
                      }`}
                    />
                  </div>
                  {/* Responsive Audio Level Overlay Bar */}
                  <div className="absolute bottom-1.5 left-2 right-2 flex items-center gap-1.5 bg-black/70 backdrop-blur-xs px-2 py-0.5 rounded-md">
                    <span className="text-[9px] font-mono text-slate-300 font-semibold">MIC</span>
                    <div className="flex-1 h-1.5 bg-slate-700/80 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-75 ${
                          status.audioLevel > 35
                            ? 'bg-rose-500'
                            : status.audioLevel > 18
                            ? 'bg-amber-400'
                            : 'bg-emerald-400'
                        }`}
                        style={{ width: `${Math.min(100, Math.max(3, status.audioLevel))}%` }}
                      />
                    </div>
                    <span className="text-[9px] font-mono font-bold text-slate-200 min-w-[24px] text-right">
                      {status.audioLevel}%
                    </span>
                  </div>
                </>
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center text-slate-500 text-[10px] gap-1">
                  <Camera className="w-5 h-5 text-slate-600" />
                  <span>Camera Standby</span>
                </div>
              )}
            </div>
          )}

          {/* Status Badges Grid: "Camera OK", "Microphone OK", "Face detected", "Attention check" */}
          <div className="grid grid-cols-2 gap-1.5 text-[10px] font-medium">
            {/* Camera OK */}
            <div
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                status.cameraOk
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.cameraOk ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="truncate">{status.cameraOk ? 'Camera OK' : 'Camera Lost'}</span>
            </div>

            {/* Microphone OK */}
            <div
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                status.micOk
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-950/40 border-rose-500/40 text-rose-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.micOk ? 'bg-emerald-400' : 'bg-rose-400'
                }`}
              />
              <span className="truncate">{status.micOk ? 'Microphone OK' : 'Mic Lost'}</span>
            </div>

            {/* Face detected */}
            <div
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                status.faceDetected && !status.multipleFacesDetected
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : status.multipleFacesDetected
                  ? 'bg-rose-950/40 border-rose-500/40 text-rose-300 animate-pulse'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.faceDetected && !status.multipleFacesDetected
                    ? 'bg-emerald-400'
                    : status.multipleFacesDetected
                    ? 'bg-rose-400'
                    : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {status.multipleFacesDetected
                  ? 'Multiple Faces'
                  : status.faceDetected
                  ? 'Face Detected'
                  : 'No Face'}
              </span>
            </div>

            {/* Attention check */}
            <div
              className={`px-2 py-1 rounded-lg border flex items-center gap-1.5 transition-colors ${
                status.attentionOk
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-950/40 border-amber-500/40 text-amber-300 animate-pulse'
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full ${
                  status.attentionOk ? 'bg-emerald-400' : 'bg-amber-400'
                }`}
              />
              <span className="truncate">
                {status.attentionOk ? 'Attention OK' : 'Attention Check'}
              </span>
            </div>

            {/* Voice / Silence Monitoring Badge (Spans full width) */}
            <div
              className={`col-span-2 px-2 py-1 rounded-lg border flex items-center justify-between transition-colors ${
                status.isTalking
                  ? 'bg-rose-950/60 border-rose-500/50 text-rose-200 animate-pulse'
                  : !status.isQuiet
                  ? 'bg-amber-950/50 border-amber-500/40 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
              }`}
            >
              <div className="flex items-center gap-1.5">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    status.isTalking
                      ? 'bg-rose-400 animate-ping'
                      : !status.isQuiet
                      ? 'bg-amber-400'
                      : 'bg-emerald-400'
                  }`}
                />
                <span className="font-semibold">
                  {status.isTalking
                    ? 'Voice Detected — Do Not Talk'
                    : !status.isQuiet
                    ? 'Ambient Noise Detected'
                    : 'Silence Verified — Quiet'}
                </span>
              </div>
              <span className="font-mono text-[9px] opacity-80">{status.audioLevel}%</span>
            </div>
          </div>

          {/* Footer note & event count */}
          <div className="flex items-center justify-between text-[9px] text-slate-400 mt-2 px-1 border-t border-slate-800 pt-1.5">
            <span className="flex items-center gap-1">
              <Shield className="w-3 h-3 text-slate-500" /> Integrity Shield
            </span>
            <span>{events.length} events logged</span>
          </div>
        </div>
      </div>
    </>
  );
};
