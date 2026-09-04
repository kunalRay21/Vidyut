import React, { useState } from 'react';
import { Copy, Check, Terminal } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({ code, language = 'code' }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.warn('Failed to copy code snippet:', err);
    }
  };

  const lines = code.split('\n');

  return (
    <div className="my-4 rounded-xl overflow-hidden border border-slate-200 bg-slate-900 shadow-xs">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-slate-800/80 border-b border-slate-700/60 text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-amber-400" />
          <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-300">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2 py-1 rounded bg-slate-700/70 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-[11px]"
          title="Copy Code Snippet"
        >
          {copied ? (
            <>
              <Check className="w-3 h-3 text-emerald-400" />
              <span className="text-emerald-400 font-medium">Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3 h-3 text-slate-400" />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>

      {/* Code Body with Line Numbers */}
      <div className="p-4 overflow-x-auto text-xs sm:text-sm font-mono leading-relaxed custom-scrollbar">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.04]">
                <td className="w-8 select-none pr-4 text-right text-xs text-slate-500 font-mono">
                  {idx + 1}
                </td>
                <td className="text-slate-100 whitespace-pre font-mono">
                  {line}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
