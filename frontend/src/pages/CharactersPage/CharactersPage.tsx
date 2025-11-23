import { useEffect, useCallback, useRef, useMemo } from "react";
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
  setCharactersSelectedLetter,
  setCharactersSelectedCategories,
  setCharactersSortOrder,
} from "../../store/slices/uiPreferencesSlice";
import { initializeCachedCharacters } from "../../utils/quizApiCached";
import { addRecentlyViewedCharacter } from "../../store/slices/recentlyViewedSlice";
import { ViewModeToggle, ViewMode } from "../../components/ViewModeToggle";
import { CharactersGridView } from "../../components/CharactersGridView";
import { CharactersListView } from "../../components/CharactersListView";
import { SearchInput } from "../../components/SearchInput";
import {
  AlphabetFilter,
  getIndexCharacter,
} from "../../components/AlphabetFilter";
import { SortDropdown, SortOption } from "../../components/SortDropdown";
import { CharacterQuiz } from "../../components/CharacterQuiz";
import { Character } from "../../types/Character";

export const CharactersPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { characters, displayedCharacters, loading, error, pagination } =
    useAppSelector((state) => state.characters);
  const {
    viewMode,
    gridItemsToShow,
    searchQuery,
    gridColumns,
    selectedLetter = null,
    selectedCategories = [],
    sortOrder = null,
  } = useAppSelector((state) => state.uiPreferences.characters);

  // Track if we've restored pagination state
  const hasRestoredPagination = useRef(false);
  // Track if user has loaded more items (to skip animations)
  const hasLoadedMore = useRef(false);

  // Character categories
  const categories = ["Disney", "Marvel", "Pixar", "Star Wars"];

  // Sort options for characters
  const sortOptions: SortOption[] = [
    { key: "name-asc", label: "Name (A-Z)" },
    { key: "name-desc", label: "Name (Z-A)" },
  ];

  // Sort functions
  const sortCharacters = useCallback(
    (charactersToSort: Character[], order: string | null): Character[] => {
      if (!order) return charactersToSort;

      const sorted = [...charactersToSort];
      switch (order) {
        case "name-asc":
          return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case "name-desc":
          return sorted.sort((a, b) => b.name.localeCompare(a.name));
        default:
          return sorted;
      }
    },
    []
  );

  // Apply filters and sorting to displayed characters
  const filteredAndSortedCharacters = useMemo(() => {
    // Start with full dataset if any filter is active, otherwise use displayed
    let result =
      selectedLetter || selectedCategories.length > 0
        ? characters
        : displayedCharacters;

    // Apply alphabetical filter
    if (selectedLetter) {
      result = result.filter((character) => {
        const char = getIndexCharacter(character.name);
        return char === selectedLetter;
      });
    }

    // Apply category filter
    if (selectedCategories.length > 0) {
      result = result.filter((character) =>
        selectedCategories.includes(character.category)
      );
    }

    // Apply sorting
    result = sortCharacters(result, sortOrder);

    return result;
  }, [
    characters,
    displayedCharacters,
    selectedLetter,
    selectedCategories,
    sortOrder,
    sortCharacters,
  ]);

  // Compute hasMore based on whether filters are active
  const hasMoreToShow = useMemo(() => {
    // If any filter is active, all filtered results are already showing
    if (selectedLetter || selectedCategories.length > 0) {
      return false;
    }
    // No filters active - use pagination hasMore
    return pagination.hasMore;
  }, [selectedLetter, selectedCategories, pagination.hasMore]);

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
      hasLoadedMore.current = true;
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

  const handleLetterSelect = useCallback(
    (letter: string | null) => {
      dispatch(setCharactersSelectedLetter(letter));
    },
    [dispatch]
  );

  const handleCategoryToggle = useCallback(
    (category: string) => {
      const newCategories = selectedCategories.includes(category)
        ? selectedCategories.filter((c) => c !== category)
        : [...selectedCategories, category];
      dispatch(setCharactersSelectedCategories(newCategories));
    },
    [dispatch, selectedCategories]
  );

  const handleSortChange = useCallback(
    (sort: string | null) => {
      dispatch(setCharactersSortOrder(sort));
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

        <div className="characters-page__filters">
          <AlphabetFilter
            items={characters}
            nameKey="name"
            selectedLetter={selectedLetter}
            onLetterSelect={handleLetterSelect}
          />
          <div className="characters-page__filter-row">
            <div className="characters-page__category-filters">
              {categories.map((category) => (
                <button
                  key={category}
                  className={`characters-page__category-btn ${
                    selectedCategories.includes(category) ? "active" : ""
                  }`}
                  onClick={() => handleCategoryToggle(category)}
                >
                  {category}
                </button>
              ))}
            </div>
            <SortDropdown
              options={sortOptions}
              value={sortOrder}
              onChange={handleSortChange}
            />
          </div>
        </div>

        <div className="characters-page__results-count">
          {filteredAndSortedCharacters.length}{" "}
          {filteredAndSortedCharacters.length === 1 ? "result" : "results"}
        </div>

        {viewMode === "grid" ? (
          <CharactersGridView
            characters={filteredAndSortedCharacters}
            onCharacterClick={handleCharacterClick}
            onLoadMore={handleLoadMore}
            hasMore={hasMoreToShow}
            isLoadingMore={pagination.isLoadingMore}
            pageSize={pagination.pageSize}
            hideSearch={true}
            gridColumns={gridColumns}
            onGridColumnsChange={handleGridColumnsChange}
            skipAnimation={hasLoadedMore.current}
          />
        ) : (
          <CharactersListView
            characters={filteredAndSortedCharacters}
            onCharacterClick={handleCharacterClick}
          />
        )}
      </div>
    </motion.div>
  );
};
