import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import "./CharactersPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCharacters,
  loadMoreCharacters,
  setSearchFilter,
} from "../../store/slices/charactersSlice";
import { initializeCachedCharacters } from "../../utils/quizApiCached";
import { addRecentlyViewedCharacter } from "../../store/slices/recentlyViewedSlice";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { CharactersGridView } from "../../components/CharactersGridView";
import { CharactersListView } from "../../components/CharactersListView";
import { SearchInput } from "../../components/SearchInput";
import { CharacterQuiz } from "../../components/CharacterQuiz";
import { Character } from "../../types/Character";

export const CharactersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { characters, displayedCharacters, loading, error, pagination } =
    useAppSelector((state) => state.characters);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");

  useEffect(() => {
    dispatch(fetchCharacters());
  }, [dispatch]);

  // Initialize cached characters for quiz when characters are loaded
  useEffect(() => {
    if (characters.length > 0) {
      initializeCachedCharacters(characters);
      console.log(
        `🎮 Quiz cache initialized with ${characters.length} characters`
      );
    }
  }, [characters.length]);

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
        navigate(`/character/${character.id}`);
      }
    },
    [characters, dispatch, navigate]
  );

  const handleSearch = useCallback(
    (_results: Character[], query: string) => {
      // SearchInput handles the filtering, but we update Redux state with the query
      dispatch(setSearchFilter(query));
    },
    [dispatch]
  );

  const handleSearchItemClick = useCallback(
    (character: Character) => {
      dispatch(
        addRecentlyViewedCharacter({
          id: character.id,
          name: character.name,
        })
      );
      navigate(`/character/${character.id}`);
    },
    [dispatch, navigate]
  );

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      dispatch(loadMoreCharacters());
    }
  }, [dispatch, pagination.hasMore, pagination.isLoadingMore]);

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
            onSelectItem={handleSearchItemClick}
          />

          <ViewModeToggle currentMode={viewMode} onModeChange={setViewMode} />
        </div>
      </div>

      <div className="characters-page__content">
        <CharacterQuiz />

        {viewMode === "grid" ? (
          <CharactersGridView
            characters={displayedCharacters}
            onCharacterClick={handleCharacterClick}
            onLoadMore={handleLoadMore}
            hasMore={pagination.hasMore}
            isLoadingMore={pagination.isLoadingMore}
            hideSearch={true}
          />
        ) : (
          <CharactersListView
            characters={displayedCharacters}
            onCharacterClick={handleCharacterClick}
          />
        )}
      </div>
    </motion.div>
  );
};
