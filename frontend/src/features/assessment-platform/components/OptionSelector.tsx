import React, { useEffect } from 'react';
import { ExamQuestion, OptionKey } from '../types/exam';
import { Check } from 'lucide-react';

interface OptionSelectorProps {
  question: ExamQuestion;
  selectedOption: OptionKey | null;
  onSelectOption: (option: OptionKey) => void;
}

export const OptionSelector: React.FC<OptionSelectorProps> = ({
  question,
  selectedOption,
  onSelectOption,
}) => {
  const options: { key: OptionKey; text: string; shortcutKey: string }[] = [
    { key: 'A', text: question.option_a, shortcutKey: '1' },
    { key: 'B', text: question.option_b, shortcutKey: '2' },
    { key: 'C', text: question.option_c, shortcutKey: '3' },
    { key: 'D', text: question.option_d, shortcutKey: '4' },
  ];

  // Keyboard shortcut listener (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }
      if (e.altKey || e.ctrlKey || e.metaKey) return;

      const keyUpper = e.key.toUpperCase();
      if (keyUpper === '1' || keyUpper === 'A') onSelectOption('A');
      else if (keyUpper === '2' || keyUpper === 'B') onSelectOption('B');
      else if (keyUpper === '3' || keyUpper === 'C') onSelectOption('C');
      else if (keyUpper === '4' || keyUpper === 'D') onSelectOption('D');
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onSelectOption]);

  return (
    <div className="space-y-2.5 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <span className="font-semibold text-slate-700">Select your answer:</span>
        <span className="text-[11px] text-slate-400 font-mono hidden sm:inline">
          Use keys [1–4] or [A–D]
        </span>
      </div>

      <div className="space-y-2.5">
        {options.map(opt => {
          const isSelected = selectedOption === opt.key;

          return (
            <div
              key={opt.key}
              onClick={() => onSelectOption(opt.key)}
              role="radio"
              aria-checked={isSelected}
              className={`w-full text-left p-3.5 sm:p-4 rounded-xl border transition-all flex items-center gap-3.5 cursor-pointer select-none ${
                isSelected
                  ? 'border-blue-600 bg-blue-50/40 text-slate-900 shadow-xs'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/60 text-slate-800'
              }`}
            >
              {/* Option Key Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono text-xs font-semibold flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-blue-600 text-white font-bold'
                    : 'bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <div className="flex-1 text-sm sm:text-base font-normal leading-normal">
                {opt.text}
              </div>

              {/* Right side: Key hint and selection indicator */}
              <div className="flex items-center gap-2.5 flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-mono px-1.5 py-0.5 rounded bg-slate-50 border border-slate-200 hidden sm:inline">
                  [{opt.shortcutKey}]
                </span>

                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-blue-600 bg-blue-600 text-white'
                      : 'border-slate-300 bg-white'
                  }`}
                >
                  {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
