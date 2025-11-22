import { useMemo } from "react";
import "./AlphabetFilter.scss";

// Helper to strip articles and get first character
export const getIndexCharacter = (name: string): string => {
  // Strip common articles ("The", "A", "An")
  const cleanName = name.replace(/^(The|A|An)\s+/i, "");
  const firstChar = cleanName.charAt(0).toUpperCase();

  // Return '#' for numbers, otherwise the letter
  return /[0-9]/.test(firstChar) ? "#" : firstChar;
};

// Generate letter index with counts (for determining active/disabled state)
export const getLetterIndex = <T extends Record<string, any>>(
  items: T[],
  nameKey: keyof T
): Record<string, number> => {
  const index: Record<string, number> = {};

  items.forEach((item) => {
    const name = String(item[nameKey]);
    const char = getIndexCharacter(name);
    if (/[A-Z#]/.test(char)) {
      index[char] = (index[char] || 0) + 1;
    }
  });

  return index;
};

export interface AlphabetFilterProps<T extends Record<string, any>> {
  // Data source
  items: T[];
  nameKey: keyof T;

  // Current state
  selectedLetter?: string | null;
  onLetterSelect: (letter: string | null) => void;

  // Optional customization
  className?: string;
  showCounts?: boolean;
}

export const AlphabetFilter = <T extends Record<string, any>>({
  items,
  nameKey,
  selectedLetter,
  onLetterSelect,
  className = "",
  showCounts = false,
}: AlphabetFilterProps<T>) => {
  const letterIndex = useMemo(() => {
    const index = getLetterIndex(items, nameKey);
    console.log(
      `📊 AlphabetFilter Letter Index (${items.length} items):`,
      index
    );
    console.log(
      `📊 Sample items:`,
      items.slice(0, 5).map((item) => ({
        name: item[nameKey],
        letter: getIndexCharacter(String(item[nameKey])),
      }))
    );
    return index;
  }, [items, nameKey]);

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ#".split("");

  const handleLetterClick = (letter: string) => {
    // If clicking the same letter, deselect it
    if (selectedLetter === letter) {
      onLetterSelect(null);
    } else {
      onLetterSelect(letter);
    }
  };

  return (
    <div className={`alphabet-filter ${className}`}>
      {/* Desktop/Tablet: Letter row */}
      <div className="alphabet-filter__letters">
        <button
          className={`alphabet-filter__letter alphabet-filter__letter--all ${
            !selectedLetter ? "selected" : ""
          }`}
          onClick={() => onLetterSelect(null)}
          aria-label="Show all items"
        >
          All
        </button>
        {alphabet.map((letter) => {
          const count = letterIndex[letter] || 0;
          const isDisabled = count === 0;
          const isSelected = selectedLetter === letter;

          return (
            <button
              key={letter}
              className={`alphabet-filter__letter ${
                isDisabled ? "disabled" : ""
              } ${isSelected ? "selected" : ""}`}
              onClick={() => handleLetterClick(letter)}
              aria-label={`Filter by letter ${letter}`}
              title={showCounts && count > 0 ? `${count} items` : undefined}
            >
              {letter}
            </button>
          );
        })}
      </div>

      {/* Mobile: Dropdown */}
      <div className="alphabet-filter__dropdown">
        <select
          value={selectedLetter || "all"}
          onChange={(e) =>
            onLetterSelect(e.target.value === "all" ? null : e.target.value)
          }
          aria-label="Filter by letter"
        >
          <option value="all">All Letters</option>
          {alphabet.map((letter) => {
            const count = letterIndex[letter] || 0;
            return count > 0 ? (
              <option key={letter} value={letter}>
                {letter}
                {showCounts ? ` (${count})` : ""}
              </option>
            ) : null;
          })}
        </select>
      </div>
    </div>
  );
};
