import React, { useEffect } from 'react';
import { ExamQuestion, OptionKey } from '../types/exam';

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

  // Keyboard shortcut listener for options (1-4 or A-D)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore when user is focusing input or textarea or pressing modifier keys
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
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-400 pb-1">
        <span>Select your answer:</span>
        <span className="text-[11px] text-slate-500 hidden sm:inline">
          Tip: Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">A</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-slate-300">D</kbd>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-3">
        {options.map(opt => {
          const isSelected = selectedOption === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => onSelectOption(opt.key)}
              type="button"
              className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-start gap-3.5 group relative ${
                isSelected
                  ? 'bg-gradient-to-r from-saffron/15 to-transparent border-saffron shadow-md shadow-saffron/10 text-white'
                  : 'bg-[#111D32] hover:bg-[#172540] border-[#1F3152] hover:border-slate-500 text-slate-200'
              }`}
              aria-checked={isSelected}
              role="radio"
            >
              {/* Option Key Badge */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-mono font-bold text-sm flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-saffron text-slate-950 shadow-sm'
                    : 'bg-[#172540] text-slate-300 group-hover:bg-[#1F3152] border border-[#1F3152]'
                }`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-1 text-sm sm:text-base leading-relaxed">
                {opt.text}
              </div>

              {/* Radio Indicator */}
              <div className="pt-1 flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-slate-500 font-mono hidden md:inline">
                  [{opt.shortcutKey}]
                </span>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-saffron bg-saffron/20'
                      : 'border-slate-600 group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && (
                    <div className="w-2.5 h-2.5 rounded-full bg-saffron" />
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
