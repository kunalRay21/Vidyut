import React, { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { Globe, Check, ChevronDown } from 'lucide-react';
import { SUPPORTED_LANGUAGES, LanguageOption } from '../../i18n/config';

interface LanguageSwitcherProps {
  compact?: boolean;
  className?: string;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({
  compact = false,
  className = '',
}) => {
  const { i18n } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const currentLang =
    SUPPORTED_LANGUAGES.find((lang) => i18n.language?.startsWith(lang.code)) ||
    SUPPORTED_LANGUAGES[0];

  const handleSelectLanguage = (lang: LanguageOption) => {
    i18n.changeLanguage(lang.code);
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-xs font-medium text-gray-700 hover:text-gray-950 bg-white/70 hover:bg-white border border-gray-200/80 shadow-2xs transition backdrop-blur-sm cursor-pointer"
        aria-expanded={isOpen}
        aria-label="Change language"
      >
        <Globe className="w-3.5 h-3.5 text-saffron-600 shrink-0" />
        <span className="font-semibold text-gray-800">
          {compact ? currentLang.code.toUpperCase() : currentLang.nativeName}
        </span>
        <ChevronDown
          className={`w-3 h-3 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {/* Popover Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-52 origin-top-right rounded-xl bg-white border border-gray-200/90 shadow-lg ring-1 ring-black/5 py-1.5 z-50 animate-in fade-in zoom-in-95 duration-100">
          <div className="px-3 py-1.5 border-b border-gray-100">
            <p className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
              Select Language / भाषा चुनें
            </p>
          </div>

          <div className="py-1">
            {SUPPORTED_LANGUAGES.map((lang) => {
              const isSelected = currentLang.code === lang.code;
              return (
                <button
                  key={lang.code}
                  type="button"
                  onClick={() => handleSelectLanguage(lang)}
                  className={`w-full text-left px-3 py-2 flex items-center justify-between text-xs transition cursor-pointer ${
                    isSelected
                      ? 'bg-saffron/10 text-saffron-800 font-semibold'
                      : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  <div className="flex flex-col">
                    <span className="font-medium">{lang.nativeName}</span>
                    <span className="text-[10px] text-gray-400 font-normal">
                      {lang.label} · {lang.region}
                    </span>
                  </div>

                  {isSelected && <Check className="w-3.5 h-3.5 text-saffron-600 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
