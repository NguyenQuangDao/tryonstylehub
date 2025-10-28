'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Check, ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const Select: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  disabled = false,
  className = '',
  label,
  error,
  required = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  const selectedOption = options.find(option => option.value === value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= options.length ? 0 : nextIndex;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex < 0 ? options.length - 1 : prevIndex;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < options.length) {
            const option = options[focusedIndex];
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          buttonRef.current?.focus();
          break;
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, focusedIndex, options, onChange]);

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(options.findIndex(option => option.value === value));
    }
  };

  const handleOptionClick = (option: SelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className={`relative ${className}`} ref={selectRef}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          {label}
          {required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <button
        ref={buttonRef}
        type="button"
        onClick={handleButtonClick}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        aria-label={ariaLabel}
        aria-describedby={ariaDescribedby}
        className={`
          relative w-full px-4 py-3 text-left bg-white dark:bg-gray-800 
          border border-gray-300 dark:border-gray-600 rounded-lg 
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
          transition-all duration-200
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${isOpen ? 'ring-2 ring-blue-500 border-transparent' : ''}
        `}
      >
        <span className={`block truncate ${selectedOption ? 'text-gray-900 dark:text-gray-100' : 'text-gray-500 dark:text-gray-400'}`}>
          {selectedOption ? selectedOption.label : placeholder}
        </span>
        
        <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
          <ChevronDown 
            className={`h-5 w-5 text-gray-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          />
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-auto"
            role="listbox"
            aria-label="Tùy chọn"
          >
            {options.map((option, index) => (
              <div
                key={option.value}
                onClick={() => handleOptionClick(option)}
                className={`
                  relative px-4 py-3 cursor-pointer transition-colors duration-150
                  ${index === focusedIndex ? 'bg-blue-50 dark:bg-blue-900/20' : ''}
                  ${option.disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50 dark:hover:bg-gray-700'}
                  ${option.value === value ? 'bg-blue-100 dark:bg-blue-900/30' : ''}
                `}
                role="option"
                aria-selected={option.value === value}
                aria-disabled={option.disabled}
              >
                <div className="flex items-center justify-between">
                  <span className={`block truncate ${option.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                    {option.label}
                  </span>
                  {option.value === value && (
                    <Check className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <p className="mt-1 text-sm text-red-600 dark:text-red-400" role="alert">
          {error}
        </p>
      )}
    </div>
  );
};
