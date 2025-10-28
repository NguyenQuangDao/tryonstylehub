'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, Search, X } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

export interface SearchableSelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  description?: string;
}

export interface SearchableSelectProps {
  options: SearchableSelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  label?: string;
  error?: string;
  required?: boolean;
  searchPlaceholder?: string;
  noResultsText?: string;
  loading?: boolean;
  'aria-label'?: string;
  'aria-describedby'?: string;
}

export const SearchableSelect: React.FC<SearchableSelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Chọn một tùy chọn',
  disabled = false,
  className = '',
  label,
  error,
  required = false,
  searchPlaceholder = 'Tìm kiếm...',
  noResultsText = 'Không tìm thấy kết quả',
  loading = false,
  'aria-label': ariaLabel,
  'aria-describedby': ariaDescribedby,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find(option => option.value === value);

  const filteredOptions = options.filter(option =>
    option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (option.description && option.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'ArrowDown':
          event.preventDefault();
          setFocusedIndex(prev => {
            const nextIndex = prev + 1;
            return nextIndex >= filteredOptions.length ? 0 : nextIndex;
          });
          break;
        case 'ArrowUp':
          event.preventDefault();
          setFocusedIndex(prev => {
            const prevIndex = prev - 1;
            return prevIndex < 0 ? filteredOptions.length - 1 : prevIndex;
          });
          break;
        case 'Enter':
        case ' ':
          event.preventDefault();
          if (focusedIndex >= 0 && focusedIndex < filteredOptions.length) {
            const option = filteredOptions[focusedIndex];
            if (!option.disabled) {
              onChange(option.value);
              setIsOpen(false);
              setSearchTerm('');
            }
          }
          break;
        case 'Escape':
          event.preventDefault();
          setIsOpen(false);
          setSearchTerm('');
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
  }, [isOpen, focusedIndex, filteredOptions, onChange]);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  const handleButtonClick = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(options.findIndex(option => option.value === value));
    }
  };

  const handleOptionClick = (option: SearchableSelectOption) => {
    if (!option.disabled) {
      onChange(option.value);
      setIsOpen(false);
      setSearchTerm('');
      buttonRef.current?.focus();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setFocusedIndex(-1);
  };

  const clearSearch = () => {
    setSearchTerm('');
    searchRef.current?.focus();
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
          {loading ? (
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          ) : (
            <Search className="h-5 w-5 text-gray-400" />
          )}
        </span>
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.15, ease: 'easeOut' }}
            className="absolute z-50 w-full mt-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg"
            role="listbox"
            aria-label="Tùy chọn có thể tìm kiếm"
          >
            {/* Search Input */}
            <div className="p-3 border-b border-gray-200 dark:border-gray-700">
              <div className="relative">
                <input
                  ref={searchRef}
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={searchPlaceholder}
                  className="w-full px-3 py-2 pl-10 pr-10 text-sm bg-gray-50 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                {searchTerm && (
                  <button
                    onClick={clearSearch}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                    aria-label="Xóa tìm kiếm"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Options List */}
            <div className="max-h-60 overflow-auto">
              {loading ? (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <Loader2 className="h-6 w-6 animate-spin mx-auto mb-2" />
                  <p className="text-sm">Đang tải...</p>
                </div>
              ) : filteredOptions.length > 0 ? (
                filteredOptions.map((option, index) => (
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
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm font-medium truncate ${option.disabled ? 'text-gray-400 dark:text-gray-500' : 'text-gray-900 dark:text-gray-100'}`}>
                          {option.label}
                        </p>
                        {option.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-1">
                            {option.description}
                          </p>
                        )}
                      </div>
                      {option.value === value && (
                        <div className="ml-2 flex-shrink-0">
                          <div className="h-2 w-2 bg-blue-600 dark:bg-blue-400 rounded-full" />
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 dark:text-gray-400">
                  <p className="text-sm">{noResultsText}</p>
                </div>
              )}
            </div>
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
