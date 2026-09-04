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
    <div className="space-y-3 pt-2">
      <div className="flex items-center justify-between text-xs text-slate-500 pb-1">
        <span className="font-medium text-slate-700">Choose one option:</span>
        <span className="text-[11px] text-slate-400 hidden sm:inline">
          Hotkeys: <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-slate-600">1</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-slate-600">4</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-slate-600">A</kbd>–<kbd className="px-1.5 py-0.5 rounded bg-slate-100 border border-slate-300 font-mono text-slate-600">D</kbd>
        </span>
      </div>

      <div className="grid grid-cols-1 gap-2.5">
        {options.map(opt => {
          const isSelected = selectedOption === opt.key;

          return (
            <button
              key={opt.key}
              onClick={() => onSelectOption(opt.key)}
              type="button"
              className={`w-full text-left p-3.5 rounded-xl border transition-colors flex items-start gap-3.5 group relative ${
                isSelected
                  ? 'bg-amber-50/80 border-amber-500 text-slate-900 shadow-xs'
                  : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
              }`}
              aria-checked={isSelected}
              role="radio"
            >
              {/* Option Key Badge */}
              <div
                className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs flex-shrink-0 transition-colors ${
                  isSelected
                    ? 'bg-amber-600 text-white'
                    : 'bg-slate-100 text-slate-600 border border-slate-200 group-hover:bg-slate-200'
                }`}
              >
                {opt.key}
              </div>

              {/* Option Text */}
              <div className="flex-1 pt-0.5 text-sm sm:text-base leading-normal font-normal">
                {opt.text}
              </div>

              {/* Radio Indicator */}
              <div className="pt-1 flex items-center gap-2 flex-shrink-0">
                <span className="text-[10px] text-slate-400 font-mono hidden md:inline">
                  [{opt.shortcutKey}]
                </span>
                <div
                  className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                    isSelected
                      ? 'border-amber-600 bg-amber-600'
                      : 'border-slate-300 group-hover:border-slate-400'
                  }`}
                >
                  {isSelected && (
                    <div className="w-1.5 h-1.5 rounded-full bg-white" />
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
