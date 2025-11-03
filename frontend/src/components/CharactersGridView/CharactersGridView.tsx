import { useState, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Character } from "../../types/Character";
import { CharacterCard } from "../CharacterCard";
import { SearchInput } from "../SearchInput";
import "./CharactersGridView.scss";

export interface CharactersGridViewProps {
  characters: Character[];
  onCharacterClick?: (characterId: string) => void;
  /** When true, parent page controls search and results */
  hideSearch?: boolean;
}

export const CharactersGridView = ({
  characters,
  onCharacterClick,
  hideSearch,
}: CharactersGridViewProps) => {
  const [filteredCharacters, setFilteredCharacters] =
    useState<Character[]>(characters);

  // keep internal list in sync when parent passes new characters (or filtered list)
  useEffect(() => {
    setFilteredCharacters(characters);
  }, [characters]);
  const [searchQuery, setSearchQuery] = useState("");

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
            searchFields={["name", "short_description", "debut", "category"]}
            placeholder="Search characters by name, description, or category..."
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
        <div className="characters-grid-view__grid">
          {filteredCharacters.map((character, index) => (
            <CharacterCard
              key={character.id}
              character={character}
              onClick={onCharacterClick}
              index={index}
            />
          ))}
        </div>
      )}
    </div>
  );
};
