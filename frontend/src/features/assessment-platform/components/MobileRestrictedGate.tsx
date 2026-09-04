import React, { useState } from 'react';
import { Laptop, Smartphone, Copy, Check, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const MobileRestrictedGate: React.FC = () => {
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      console.warn('Clipboard write failed:', err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-slate-800">
      {/* Official Indian National Flag Ribbon */}
      <div className="fixed top-0 left-0 right-0 gov-tricolor-banner" />

      <div className="max-w-md w-full gov-card p-8 bg-white border border-slate-200 shadow-md text-center space-y-6">
        {/* Visual Device Indicator */}
        <div className="flex items-center justify-center gap-4 py-2">
          <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 flex items-center justify-center text-red-500">
            <Smartphone className="w-6 h-6" />
          </div>
          <div className="text-slate-300 font-bold">→</div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600">
            <Laptop className="w-6 h-6" />
          </div>
        </div>

        {/* Heading */}
        <div className="space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200">
            <ShieldAlert className="w-3.5 h-3.5" />
            Device Restriction Active
          </span>
          <h2 className="text-xl font-bold font-heading text-slate-900">
            Desktop Environment Required
          </h2>
          <p className="text-xs text-slate-600 leading-relaxed">
            The Vidyut Diagnostic Examination requires a laptop or desktop computer. Mobile test taking is restricted to maintain rigorous examination standards.
          </p>
        </div>

        {/* Why Box */}
        <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-left text-xs space-y-2 text-slate-600">
          <div className="font-semibold text-slate-800 text-[11px] uppercase tracking-wider">
            Required Assessment Conditions:
          </div>
          <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
            <li>Minimum screen width of 1024px for split-pane code inspection</li>
            <li>Physical keyboard for fast response hotkeys (1–4, Alt+N)</li>
            <li>Proctored window focus and tab-switch telemetry</li>
          </ul>
        </div>

        {/* Actions */}
        <div className="space-y-2.5 pt-2">
          <button
            onClick={handleCopyLink}
            className="btn-saffron w-full text-xs font-semibold py-2.5 flex items-center justify-center gap-2"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-white" />
                <span>Exam Link Copied to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Exam Link for Computer</span>
              </>
            )}
          </button>

          <button
            onClick={() => navigate('/')}
            className="w-full py-2 rounded-lg text-xs font-medium text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Vidyut Portal</span>
          </button>
        </div>
      </div>
    </div>
  );
};
