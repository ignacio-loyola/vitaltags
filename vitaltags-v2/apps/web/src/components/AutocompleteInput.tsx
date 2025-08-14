'use client';

import { useState, useRef, useEffect } from 'react';
import { searchTerms, type SeedTerm } from '../data/seed-terms';

interface AutocompleteInputProps {
  category: 'condition' | 'allergy' | 'medication';
  value: string;
  onChange: (value: string) => void;
  onSelect?: (term: SeedTerm) => void;
  placeholder?: string;
  className?: string;
  id?: string;
  'aria-label'?: string;
}

export function AutocompleteInput({
  category,
  value,
  onChange,
  onSelect,
  placeholder,
  className = '',
  id,
  'aria-label': ariaLabel,
}: AutocompleteInputProps) {
  const [suggestions, setSuggestions] = useState<SeedTerm[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionRefs = useRef<(HTMLLIElement | null)[]>([]);

  useEffect(() => {
    if (value.length >= 2) {
      const results = searchTerms(value, category);
      setSuggestions(results);
      setShowSuggestions(results.length > 0);
      setSelectedIndex(-1);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  }, [value, category]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  const handleSuggestionClick = (term: SeedTerm) => {
    onChange(term.name_en);
    setShowSuggestions(false);
    onSelect?.(term);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
          handleSuggestionClick(suggestions[selectedIndex]);
        }
        break;
      case 'Escape':
        e.preventDefault();
        setShowSuggestions(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleBlur = (e: React.FocusEvent) => {
    // Delay hiding suggestions to allow click events on suggestions
    setTimeout(() => {
      const currentTarget = e.currentTarget;
      if (currentTarget && !currentTarget.contains(document.activeElement)) {
        setShowSuggestions(false);
        setSelectedIndex(-1);
      }
    }, 150);
  };

  const handleFocus = () => {
    if (suggestions.length > 0) {
      setShowSuggestions(true);
    }
  };

  // Scroll selected suggestion into view
  useEffect(() => {
    if (selectedIndex >= 0 && suggestionRefs.current[selectedIndex]) {
      suggestionRefs.current[selectedIndex]?.scrollIntoView({
        block: 'nearest',
      });
    }
  }, [selectedIndex]);

  return (
    <div className="relative" onBlur={handleBlur}>
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        className={`w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${className}`}
        id={id}
        aria-label={ariaLabel}
        aria-expanded={showSuggestions}
        aria-autocomplete="list"
        aria-activedescendant={selectedIndex >= 0 ? `suggestion-${selectedIndex}` : undefined}
        role="combobox"
      />
      
      {showSuggestions && suggestions.length > 0 && (
        <ul
          className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
          role="listbox"
        >
          {suggestions.map((term, index) => (
            <li
              key={term.slug}
              ref={el => (suggestionRefs.current[index] = el)}
              className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                index === selectedIndex ? 'bg-blue-100' : ''
              }`}
              onClick={() => handleSuggestionClick(term)}
              role="option"
              aria-selected={index === selectedIndex}
              id={`suggestion-${index}`}
            >
              {term.name_en}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}