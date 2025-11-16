import { useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import "./CharactersPage.scss";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  fetchCharacters,
  loadMoreCharacters,
  setSearchFilter,
  restorePaginationState,
} from "../../store/slices/charactersSlice";
import {
  setCharactersViewMode,
  setCharactersSearchQuery,
  incrementCharactersGridItems,
  setCharactersGridColumns,
} from "../../store/slices/uiPreferencesSlice";
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
  const { viewMode, gridItemsToShow, searchQuery, gridColumns } =
    useAppSelector((state) => state.uiPreferences.characters);

  // Track if we've restored pagination state
  const hasRestoredPagination = useRef(false);

  // Fetch characters on mount
  useEffect(() => {
    dispatch(fetchCharacters());
  }, [dispatch]);

  // Restore pagination state after characters are loaded (only once)
  useEffect(() => {
    if (
      characters.length > 0 &&
      gridItemsToShow > 20 &&
      !hasRestoredPagination.current
    ) {
      console.log(
        `🔄 Restoring Characters pagination: ${gridItemsToShow} items`
      );
      dispatch(restorePaginationState(gridItemsToShow));
      hasRestoredPagination.current = true;
    }
    // Only run when characters are first loaded
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, characters.length]);

  // Restore search query from UI preferences (run AFTER pagination restore)
  useEffect(() => {
    if (searchQuery && characters.length > 0 && hasRestoredPagination.current) {
      console.log(`🔍 Restoring search query: "${searchQuery}"`);
      dispatch(setSearchFilter(searchQuery));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dispatch, characters.length]);

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
      dispatch(setCharactersSearchQuery(query));
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

  const handleResetSearch = useCallback(() => {
    dispatch(setSearchFilter(""));
    dispatch(setCharactersSearchQuery(""));
  }, [dispatch]);

  const handleLoadMore = useCallback(() => {
    if (pagination.hasMore && !pagination.isLoadingMore) {
      console.log(
        `🔽 Load More clicked - Current items: ${displayedCharacters.length}, Adding: ${pagination.pageSize}`
      );
      dispatch(loadMoreCharacters());
      // Increment the grid items count by pageSize (default 20)
      dispatch(incrementCharactersGridItems(pagination.pageSize));
    }
  }, [
    dispatch,
    pagination.hasMore,
    pagination.isLoadingMore,
    pagination.pageSize,
    displayedCharacters.length,
  ]);

  const handleViewModeChange = useCallback(
    (newMode: ViewMode) => {
      dispatch(setCharactersViewMode(newMode));
    },
    [dispatch]
  );

  const handleGridColumnsChange = useCallback(
    (columns: number) => {
      dispatch(setCharactersGridColumns(columns));
    },
    [dispatch]
  );

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
            initialValue={searchQuery}
            getDisplayText={(c: Character) => c.name}
            getSecondaryText={(c: Character) =>
              `${c.debut || ""} • ${c.category}`
            }
            onSelectItem={handleSearchItemClick}
          />

          <ViewModeToggle
            currentMode={viewMode}
            onModeChange={handleViewModeChange}
          />
          {searchQuery && (
            <button
              className="characters-page__reset-search"
              onClick={handleResetSearch}
              aria-label="Reset search"
            >
              <i className="fas fa-times-circle"></i>
              <span>Reset Search</span>
            </button>
          )}
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
            gridColumns={gridColumns}
            onGridColumnsChange={handleGridColumnsChange}
          />
        ) : (
          <CharactersListView
            characters={characters}
            onCharacterClick={handleCharacterClick}
          />
        )}
      </div>
    </motion.div>
  );
};
