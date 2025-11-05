import { useState, useEffect, useCallback } from "react";
import "./CharactersPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchCharacters } from "../../store/slices/charactersSlice";
import { addRecentlyViewedCharacter } from "../../store/slices/recentlyViewedSlice";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { CharactersGridView } from "../../components/CharactersGridView";
import { CharactersListView } from "../../components/CharactersListView";
import { SearchInput } from "../../components/SearchInput";
import { CharacterQuiz } from "../../components/CharacterQuiz";
import { Character } from "../../types/Character";

export const CharactersPage = () => {
  const dispatch = useAppDispatch();
  const { characters, loading, error } = useAppSelector(
    (state) => state.characters
  );
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [filteredCharacters, setFilteredCharacters] =
    useState<Character[]>(characters);

  useEffect(() => {
    dispatch(fetchCharacters());
  }, [dispatch]);

  useEffect(() => {
    setFilteredCharacters(characters);
  }, [characters]);

  const handleCharacterClick = useCallback(
    (characterId: string) => {
      const character = characters.find(
        (c: { id: string }) => c.id === characterId
      );
      if (character) {
        dispatch(
          addRecentlyViewedCharacter({
            id: character.id,
            name: character.name,
          })
        );
        // Navigate to character detail page
        window.location.href = `/character/${characterId}`;
      }
    },
    [characters, dispatch]
  );

  const handleSearch = useCallback((results: Character[]) => {
    setFilteredCharacters(results);
  }, []);

  if (loading) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="characters-page__loading">Loading characters...</div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="page-container"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="characters-page__error">Error: {error}</div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="page-container characters-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="characters-page__header">
        <div className="characters-page__header-content">
          <h1>Disney Characters</h1>
          <p>
            Discover the magical world of Disney characters from classic to
            modern tales.
          </p>
        </div>

        <div className="characters-page__controls">
          <SearchInput
            items={characters}
            onSearch={handleSearch}
            searchFields={["name"]}
            placeholder="Search characters..."
            minCharacters={2}
            getDisplayText={(c: Character) => c.name}
            getSecondaryText={(c: Character) =>
              `${c.debut || ""} • ${c.category}`
            }
            onSelectItem={(c: Character) => handleCharacterClick(c.id)}
          />

          <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      <div className="characters-page__content">
        <CharacterQuiz />

        {viewMode === "grid" ? (
          <CharactersGridView
            characters={filteredCharacters}
            onCharacterClick={handleCharacterClick}
            hideSearch={true}
          />
        ) : (
          <CharactersListView />
        )}
      </div>
    </motion.div>
  );
};
