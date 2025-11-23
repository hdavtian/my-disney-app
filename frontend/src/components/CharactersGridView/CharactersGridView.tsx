import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Character } from "../../types/Character";
import { CharacterCard } from "../CharacterCard";
import { SearchInput } from "../SearchInput";
import { CardSizeControl } from "../CardSizeControl";
import "./CharactersGridView.scss";

export interface CharactersGridViewProps {
  characters: Character[];
  onCharacterClick?: (characterId: string) => void;
  /** When true, parent page controls search and results */
  hideSearch?: boolean;
  /** Pagination support for infinite scroll */
  onLoadMore?: () => void;
  hasMore?: boolean;
  isLoadingMore?: boolean;
  /** Number of items to load per page */
  pageSize?: number;
  /** Skip card animations (for load more scenario) */
  skipAnimation?: boolean;
  /** Number of columns to display (0 = use default) */
  gridColumns?: number;
  /** Callback when grid columns change */
  onGridColumnsChange?: (columns: number) => void;
  /** Min columns for grid size control */
  minColumns?: number;
  /** Max columns for grid size control */
  maxColumns?: number;
  /** Default columns for grid size control */
  defaultColumns?: number;
  /** Labels for grid size control */
  gridLabels?: string[];
}

export const CharactersGridView = ({
  characters,
  onCharacterClick,
  hideSearch,
  onLoadMore,
  hasMore,
  isLoadingMore,
  pageSize = 20,
  skipAnimation = false,
  gridColumns = 0,
  onGridColumnsChange,
  minColumns = 2,
  maxColumns = 10,
  defaultColumns = 6,
  gridLabels = ["Normal", "Comfy", "Compact", "Dense", "Max"],
}: CharactersGridViewProps) => {
  const [filteredCharacters, setFilteredCharacters] =
    useState<Character[]>(characters);
  const [searchQuery, setSearchQuery] = useState("");

  // keep internal list in sync when parent passes new characters (or filtered list)
  useEffect(() => {
    setFilteredCharacters(characters);
  }, [characters]);

  // Infinite scroll handler for window scroll
  useEffect(() => {
    if (!onLoadMore || !hasMore) return;

    const handleScroll = () => {
      const scrollTop =
        window.pageYOffset || document.documentElement.scrollTop;
      const scrollHeight = document.documentElement.scrollHeight;
      const clientHeight = window.innerHeight;
      const isNearBottom = scrollTop + clientHeight >= scrollHeight - 400; // 400px threshold for better trackpad detection

      if (isNearBottom && !isLoadingMore) {
        console.log(
          "🔽 Infinite scroll triggered - Loading more characters..."
        );
        onLoadMore();
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [onLoadMore, hasMore, isLoadingMore]);

  const handleSearch = useCallback((results: Character[], query: string) => {
    setFilteredCharacters(results);
    setSearchQuery(query);
  }, []);

  return (
    <div className="characters-grid-view">
      {!hideSearch && (
        <div className="characters-grid-view__search-container">
          <div className="characters-grid-view__search-count">
            {filteredCharacters.length}{" "}
            {filteredCharacters.length === 1 ? "character" : "characters"}
            {searchQuery && ` matching "${searchQuery}"`}
          </div>
          <SearchInput
            items={characters}
            onSearch={handleSearch}
            searchFields={["name"]}
            placeholder="Search characters by name..."
            minCharacters={2}
            getDisplayText={(character) => character.name}
            getSecondaryText={(character) =>
              `${character.debut} • ${character.category}`
            }
            onSelectItem={(character) => onCharacterClick?.(character.id)}
          />
        </div>
      )}

      {filteredCharacters.length === 0 ? (
        <motion.div
          className="characters-grid-view__empty"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
          <h3>No characters found</h3>
          <p>Try adjusting your search criteria</p>
        </motion.div>
      ) : (
        <>
          {onGridColumnsChange && (
            <div className="characters-grid-view__grid-controls">
              <CardSizeControl
                currentColumns={gridColumns}
                minColumns={minColumns}
                maxColumns={maxColumns}
                defaultColumns={defaultColumns}
                onChange={onGridColumnsChange}
                labels={gridLabels}
              />
            </div>
          )}
          <div
            className="characters-grid-view__grid"
            style={
              gridColumns > 0
                ? ({ "--grid-columns": gridColumns } as React.CSSProperties)
                : undefined
            }
          >
            {filteredCharacters.map((character, index) => (
              <CharacterCard
                key={character.id}
                character={character}
                onClick={onCharacterClick}
                index={index}
                skipAnimation={skipAnimation}
              />
            ))}
          </div>

          {/* Infinite Scroll Section */}
          {hideSearch && onLoadMore && (
            <div className="characters-grid-view__load-more">
              {isLoadingMore && (
                <div className="characters-grid-view__loading">
                  <div className="spinner"></div>
                  Loading more characters...
                </div>
              )}

              {!isLoadingMore && hasMore && (
                <motion.div
                  className="characters-grid-view__scroll-indicator"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <div className="characters-grid-view__scroll-icon">
                    <svg
                      width="24"
                      height="24"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <polyline points="7 13 12 18 17 13"></polyline>
                      <polyline points="7 6 12 11 17 6"></polyline>
                    </svg>
                  </div>
                  <p className="characters-grid-view__scroll-text">
                    Scroll down to load{" "}
                    <strong>{pageSize} more characters</strong>
                  </p>
                </motion.div>
              )}

              {!hasMore && filteredCharacters.length > 20 && (
                <motion.div
                  className="characters-grid-view__end-message"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                  </svg>
                  <h3>That's all the characters!</h3>
                  <p>
                    You've reached the end of the collection (
                    {filteredCharacters.length} characters)
                  </p>
                </motion.div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};
