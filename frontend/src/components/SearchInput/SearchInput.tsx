import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import "./SearchInput.scss";

export interface SearchInputProps<T> {
  items: T[];
  onSearch: (results: T[], query: string) => void;
  searchFields: (keyof T)[];
  placeholder?: string;
  minCharacters?: number;
  getDisplayText: (item: T) => string;
  getSecondaryText?: (item: T) => string;
  onSelectItem?: (item: T) => void;
  initialValue?: string;
}

export const SearchInput = <T extends { id: number | string }>({
  items,
  onSearch,
  searchFields,
  placeholder = "Search...",
  minCharacters = 3,
  getDisplayText,
  getSecondaryText,
  onSelectItem,
  initialValue = "",
}: SearchInputProps<T>) => {
  const [query, setQuery] = useState(initialValue);
  const [filteredResults, setFilteredResults] = useState<T[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isFocused, setIsFocused] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [userDismissed, setUserDismissed] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync internal query state when initialValue prop changes externally
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  // Debounced search function
  const performSearch = useCallback(
    (searchQuery: string) => {
      if (searchQuery.length < minCharacters) {
        setFilteredResults([]);
        setShowDropdown(false);
        // Only call onSearch if there was a previous search (don't call on mount)
        if (searchQuery.length > 0) {
          onSearch(items, ""); // User cleared search, show all items
        }
        return;
      }

      const lowerQuery = searchQuery.toLowerCase();
      const results = items.filter((item) => {
        return searchFields.some((field) => {
          const value = item[field];
          if (typeof value === "string") {
            return value.toLowerCase().includes(lowerQuery);
          }
          return false;
        });
      });

      setFilteredResults(results);
      // Only show dropdown if user hasn't dismissed it and not currently selecting
      if (!isSelecting && !userDismissed) {
        setShowDropdown(results.length > 0);
      }
      onSearch(results, searchQuery);
    },
    [items, searchFields, minCharacters, onSearch, isSelecting, userDismissed]
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      performSearch(query);
    }, 300); // Debounce delay

    return () => clearTimeout(timer);
  }, [query, performSearch]);

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        if (!showDropdown) return;
        e.preventDefault();
        setSelectedIndex((prev) =>
          prev < filteredResults.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        if (!showDropdown) return;
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (
          showDropdown &&
          selectedIndex >= 0 &&
          filteredResults[selectedIndex]
        ) {
          // User has selected an item from dropdown with arrow keys
          handleSelectItem(filteredResults[selectedIndex]);
        } else {
          // User pressed Enter without selecting - accept current search and close dropdown
          setIsSelecting(true);
          setUserDismissed(true);
          setShowDropdown(false);
          setSelectedIndex(-1);
          inputRef.current?.blur();
          // Reset selecting flag after a short delay
          setTimeout(() => setIsSelecting(false), 500);
        }
        break;
      case "Escape":
        e.preventDefault();
        handleClear();
        break;
    }
  };

  // Handle item selection
  const handleSelectItem = (item: T) => {
    setIsSelecting(true);
    setQuery(getDisplayText(item));
    setShowDropdown(false);
    setSelectedIndex(-1);
    if (onSelectItem) {
      onSelectItem(item);
    }
    inputRef.current?.blur();
    // Reset selecting flag after a short delay
    setTimeout(() => setIsSelecting(false), 500);
  };

  // Handle clear
  const handleClear = () => {
    setQuery("");
    setFilteredResults([]);
    setShowDropdown(false);
    setSelectedIndex(-1);
    onSearch(items, "");
    inputRef.current?.focus();
  };

  // Click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowDropdown(false);
        setSelectedIndex(-1);
        setUserDismissed(true);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Scroll selected item into view
  useEffect(() => {
    if (selectedIndex >= 0 && dropdownRef.current) {
      const selectedElement = dropdownRef.current.children[
        selectedIndex
      ] as HTMLElement;
      if (selectedElement) {
        selectedElement.scrollIntoView({
          block: "nearest",
          behavior: "smooth",
        });
      }
    }
  }, [selectedIndex]);

  const totalMatches =
    query.length >= minCharacters ? filteredResults.length : items.length;

  return (
    <div className="search-input">
      <div className="search-input__wrapper">
        <div
          className={`search-input__field ${
            isFocused ? "search-input__field--focused" : ""
          }`}
        >
          <svg
            className="search-input__icon"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>

          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setUserDismissed(false); // Reset dismissed flag when user types
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              setIsFocused(true);
              // If query is valid, show dropdown again
              if (query.length >= minCharacters && filteredResults.length > 0) {
                setShowDropdown(true);
                setUserDismissed(false);
              }
            }}
            onBlur={() => setIsFocused(false)}
            placeholder={placeholder}
            className="search-input__input"
          />

          {query && (
            <button
              className="search-input__clear"
              onClick={handleClear}
              type="button"
              aria-label="Clear search"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                <path
                  d="M18 6L6 18M6 6l12 12"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        <span className="search-input__count">
          {totalMatches} {totalMatches === 1 ? "result" : "results"}
        </span>
      </div>

      <AnimatePresence>
        {showDropdown && filteredResults.length > 0 && (
          <motion.div
            ref={dropdownRef}
            className="search-input__dropdown"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {filteredResults.slice(0, 8).map((item, index) => (
              <div
                key={item.id}
                className={`search-input__item ${
                  index === selectedIndex ? "search-input__item--selected" : ""
                }`}
                onClick={() => handleSelectItem(item)}
                onMouseEnter={() => setSelectedIndex(index)}
              >
                <div className="search-input__item-main">
                  {getDisplayText(item)}
                </div>
                {getSecondaryText && (
                  <div className="search-input__item-secondary">
                    {getSecondaryText(item)}
                  </div>
                )}
              </div>
            ))}
            {filteredResults.length > 8 && (
              <div className="search-input__more">
                +{filteredResults.length - 8} more results
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
