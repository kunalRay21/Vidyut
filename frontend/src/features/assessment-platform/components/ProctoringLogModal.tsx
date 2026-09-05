import React from 'react';
import { X, ShieldAlert, Clock, CheckCircle, AlertTriangle, AlertCircle, Info } from 'lucide-react';
import { ProctoringEvent } from '../types/proctoring';

interface ProctoringLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  events: ProctoringEvent[];
}

export const ProctoringLogModal: React.FC<ProctoringLogModalProps> = ({
  isOpen,
  onClose,
  events,
}) => {
  if (!isOpen) return null;

  const getSeverityBadge = (severity: ProctoringEvent['severity']) => {
    switch (severity) {
      case 'HIGH':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-rose-100 text-rose-800 border border-rose-200">
            <AlertCircle className="w-3 h-3 text-rose-600" /> HIGH
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
            <AlertTriangle className="w-3 h-3 text-amber-600" /> MEDIUM
          </span>
        );
      case 'LOW':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
            <Info className="w-3 h-3 text-blue-600" /> LOW
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-700 border border-slate-200">
            <CheckCircle className="w-3 h-3 text-slate-500" /> INFO
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fadeIn select-none">
      <div className="max-w-2xl w-full bg-white rounded-2xl p-6 border border-slate-200 shadow-2xl flex flex-col max-h-[85vh] relative overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 pb-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-blue-600">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold font-heading text-slate-900">
                Proctoring Event Audit Log
              </h3>
              <p className="text-xs text-slate-500">
                Transparent log of recorded audio-visual telemetry events and confidence metrics.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Event List */}
        <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar text-xs">
          {events.length === 0 ? (
            <div className="py-12 text-center text-slate-400">
              No anomalies recorded. Candidate session has maintained clean integrity.
            </div>
          ) : (
            events.map((evt) => {
              const date = new Date(evt.timestamp);
              const formattedTime = date.toLocaleTimeString();

              return (
                <div
                  key={evt.id}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100/80 transition-colors flex items-start justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 font-mono text-[11px]">
                        {evt.type}
                      </span>
                      {getSeverityBadge(evt.severity)}
                    </div>
                    <p className="text-slate-600 text-[11px] leading-relaxed">{evt.message}</p>
                    {evt.details && (
                      <div className="text-[10px] font-mono text-slate-400">
                        {JSON.stringify(evt.details)}
                      </div>
                    )}
                  </div>

                  <div className="text-right flex-shrink-0 space-y-1">
                    <div className="inline-flex items-center gap-1 text-[10px] text-slate-500">
                      <Clock className="w-3 h-3" />
                      <span>{formattedTime}</span>
                    </div>
                    <div className="text-[10px] font-semibold text-slate-700">
                      Conf: {Math.round(evt.confidence * 100)}%
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 pt-4 mt-4 flex items-center justify-between text-xs text-slate-500">
          <span>Total Recorded Events: {events.length}</span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-900 text-white hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Close Audit Log
          </button>
        </div>
      </div>
    </div>
  );
};
