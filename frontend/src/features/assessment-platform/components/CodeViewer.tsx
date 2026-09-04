import React, { useState } from 'react';
import { Copy, Check, Code2, Lock } from 'lucide-react';

interface CodeViewerProps {
  code: string;
  language?: string;
  allowCopy?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  code,
  language = 'python',
  allowCopy = false,
}) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!allowCopy) return;
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
    <div className="rounded-lg overflow-hidden border border-slate-700/80 bg-[#0d1117] shadow-xs select-none">
      {/* Code Header Bar */}
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-[#161b22] border-b border-slate-700/60 text-xs select-none">
        <div className="flex items-center gap-2 text-slate-400 font-mono">
          <Code2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] font-medium text-slate-300">
            {language}.snippet
          </span>
        </div>

        {allowCopy ? (
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-2 py-0.5 rounded text-[11px] text-slate-400 hover:text-white hover:bg-slate-700/60 transition-colors"
            title="Copy Code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400 font-medium">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>
        ) : (
          <div className="flex items-center gap-1 text-[10px] text-slate-500 font-medium select-none">
            <Lock className="w-3 h-3 text-slate-500" />
            <span>Copy Disabled</span>
          </div>
        )}
      </div>

      {/* Code Body with Selection Disabled */}
      <div className="p-3.5 overflow-x-auto text-xs sm:text-[13px] font-mono leading-relaxed custom-scrollbar select-none">
        <table className="w-full border-collapse select-none">
          <tbody>
            {lines.map((line, idx) => (
              <tr key={idx} className="hover:bg-white/[0.03] select-none">
                <td className="w-7 select-none pr-3 text-right text-xs text-slate-600 font-mono">
                  {idx + 1}
                </td>
                <td className="text-slate-200 whitespace-pre font-mono select-none">
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
