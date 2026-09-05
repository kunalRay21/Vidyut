import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';

export type DropdownOption = string | { value: string; label: string };

interface CustomDropdownProps {
  options: DropdownOption[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  name?: string;
  className?: string;
}

export const CustomDropdown: React.FC<CustomDropdownProps> = ({
  options,
  value,
  onChange,
  placeholder,
  name,
  className = 'w-full px-4 py-2.5',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Synchronize highlighted item when opening
  useEffect(() => {
    if (isOpen) {
      const idx = options.findIndex((opt) => (typeof opt === 'string' ? opt : opt.value) === value);
      setHighlightedIndex(idx >= 0 ? idx : 0);
    }
  }, [isOpen, value, options]);

  // Keyboard accessibility
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
        e.preventDefault();
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'Escape') {
      setIsOpen(false);
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev + 1 < options.length ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightedIndex((prev) => (prev - 1 >= 0 ? prev - 1 : options.length - 1));
    } else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      if (highlightedIndex >= 0 && highlightedIndex < options.length) {
        const opt = options[highlightedIndex];
        onChange(typeof opt === 'string' ? opt : opt.value);
        setIsOpen(false);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (isOpen && listRef.current && highlightedIndex >= 0) {
      const item = listRef.current.children[highlightedIndex] as HTMLElement;
      if (item) {
        item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
      }
    }
  }, [highlightedIndex, isOpen]);

  // Find the selected label to display in the button
  const selectedOption = options.find((opt) => (typeof opt === 'string' ? opt : opt.value) === value);
  const displayValue = selectedOption
    ? typeof selectedOption === 'string'
      ? selectedOption
      : selectedOption.label
    : value;

  return (
    <div className="relative w-full" ref={containerRef}>
      {/* Hidden native input for forms, if needed */}
      {name && <input type="hidden" name={name} value={value} />}
      
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={handleKeyDown}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`${className} flex items-center justify-between rounded-lg bg-white border text-left outline-none transition cursor-pointer ${
          isOpen
            ? 'border-saffron ring-1 ring-saffron shadow-sm'
            : 'border-gray-300 hover:border-gray-400'
        }`}
      >
        <span className={`block truncate ${!value ? 'text-gray-500' : 'text-gray-900'}`}>
          {displayValue || placeholder}
        </span>
        <ChevronDown
          className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-100 rounded-xl shadow-lg">
          <ul
            ref={listRef}
            role="listbox"
            className="py-1 max-h-60 overflow-auto rounded-xl outline-none no-scrollbar"
            tabIndex={-1}
          >
            {options.map((option, index) => {
              const val = typeof option === 'string' ? option : option.value;
              const label = typeof option === 'string' ? option : option.label;
              const isSelected = val === value;
              const isHighlighted = index === highlightedIndex;

              return (
                <li
                  key={val}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => {
                    onChange(val);
                    setIsOpen(false);
                  }}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  className={`relative cursor-pointer select-none py-1 pl-2.5 pr-8 mx-1 my-0.5 rounded-md transition-colors duration-150 text-sm ${
                    isSelected
                      ? 'bg-saffron-50 text-saffron-700 font-medium'
                      : isHighlighted
                      ? 'bg-saffron-50/70 text-gray-900'
                      : 'text-gray-700 hover:bg-saffron-50/70'
                  }`}
                >
                  <span className="block truncate">{label}</span>
                  {isSelected && (
                    <span className="absolute inset-y-0 right-0 flex items-center pr-3 text-saffron-600">
                      <Check className="w-4 h-4" />
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
};
