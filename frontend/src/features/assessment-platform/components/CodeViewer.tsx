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
    <div className="my-4 rounded-xl overflow-hidden border border-[#1F3152] bg-[#070D18] shadow-lg">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-4 py-2 bg-[#0E1726] border-b border-[#1F3152] text-xs">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-saffron" />
          <span className="uppercase text-[11px] font-semibold tracking-wider text-slate-300">
            {language}
          </span>
        </div>

        <button
          onClick={handleCopy}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-[#172540] hover:bg-[#1E3A8A] text-slate-300 hover:text-white transition-colors text-[11px]"
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
      <div className="p-4 overflow-x-auto text-sm font-mono leading-relaxed custom-scrollbar">
        <table className="w-full border-collapse">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.02]">
                <td className="w-10 select-none pr-4 text-right text-xs text-slate-600 font-mono">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre font-mono">
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
