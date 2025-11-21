import { useMemo, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { useFavorites } from "../../hooks/useFavorites";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { fetchMoviesByIds } from "../../store/slices/moviesSlice";
import { fetchCharactersByIds } from "../../store/slices/charactersSlice";
import {
  fetchAttractionsByIds,
  selectAttraction,
} from "../../store/slices/attractionsSlice";
import { selectPark, fetchParks } from "../../store/slices/parksSlice";
import {
  setFavoritesGridColumns,
  setFavoritesSearchQuery,
  setFavoritesFilterType,
  setFavoritesSelectedLetter,
  setFavoritesSortOrder,
  FilterType,
} from "../../store/slices/uiPreferencesSlice";
import {
  addRecentlyViewedMovie,
  addRecentlyViewedCharacter,
} from "../../store/slices/recentlyViewedSlice";
import { Movie } from "../../types/Movie";
import { Character } from "../../types/Character";
import { Attraction } from "../../types/Attraction";
import { CardSizeControl } from "../../components/CardSizeControl";
import { MovieCard } from "../../components/MovieCard/MovieCard";
import { CharacterCard } from "../../components/CharacterCard/CharacterCard";
import { AttractionCard } from "../../components/AttractionCard/AttractionCard";
import { SearchInput } from "../../components/SearchInput";
import {
  AlphabetFilter,
  getIndexCharacter,
} from "../../components/AlphabetFilter";
import { SortDropdown, SortOption } from "../../components/SortDropdown";
import "./FavoritesPage.scss";

type FavoriteItem =
  | { type: "movie"; data: Movie }
  | { type: "character"; data: Character }
  | { type: "attraction"; data: Attraction };

export const FavoritesPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { favorites } = useFavorites();
  const allMovies = useAppSelector((state) => state.movies.movies);
  const allCharacters = useAppSelector((state) => state.characters.characters);
  const allAttractionsByPark = useAppSelector(
    (state) => state.attractions.attractionsByPark
  );
  const allAttractionsFromStore = useAppSelector(
    (state) => state.attractions.allAttractions
  );
  const { parks } = useAppSelector((state) => state.parks);
  const { gridColumns, searchQuery, filterType, selectedLetter, sortOrder } =
    useAppSelector(
      (state) =>
        state.uiPreferences.favorites ?? {
          gridColumns: 0,
          searchQuery: "",
          filterType: "all" as FilterType,
          selectedLetter: null,
          sortOrder: null,
        }
    );

  // Sort options
  const sortOptions: SortOption[] = [
    { key: "name-asc", label: "Name (A-Z)" },
    { key: "name-desc", label: "Name (Z-A)" },
  ];

  // Grid size configuration
  const minColumns = 2;
  const maxColumns = 10;
  const defaultColumns = 4;

  // Use default if gridColumns is 0 or out of bounds
  const activeColumns =
    gridColumns === 0 || gridColumns < minColumns || gridColumns > maxColumns
      ? defaultColumns
      : gridColumns;

  // Smart batch fetching - only fetch missing favorites
  useEffect(() => {
    // Ensure parks are loaded (needed for attraction navigation)
    if (parks.length === 0) {
      dispatch(fetchParks());
    }

    const movieFavorites = favorites.filter((f) => f.type === "movie");
    const characterFavorites = favorites.filter((f) => f.type === "character");
    const attractionFavorites = favorites.filter(
      (f) => f.type === "attraction"
    );

    // Find IDs that aren't already in the store
    const missingMovieIds = movieFavorites
      .filter((f) => !allMovies.find((m) => m.id === f.id))
      .map((f) => Number(f.id));

    const missingCharacterIds = characterFavorites
      .filter((f) => !allCharacters.find((c) => c.id === f.id))
      .map((f) => Number(f.id));

    const missingAttractionIds = attractionFavorites
      .filter((f) => !allAttractionsFromStore.find((a) => a.id === f.id))
      .map((f) => Number(f.id));

    // Batch fetch only missing items
    if (missingMovieIds.length > 0) {
      console.log("Batch fetching missing movies:", missingMovieIds);
      dispatch(fetchMoviesByIds(missingMovieIds));
    }

    if (missingCharacterIds.length > 0) {
      console.log("Batch fetching missing characters:", missingCharacterIds);
      dispatch(fetchCharactersByIds(missingCharacterIds));
    }

    if (missingAttractionIds.length > 0) {
      console.log("Batch fetching missing attractions:", missingAttractionIds);
      dispatch(fetchAttractionsByIds(missingAttractionIds));
    }
  }, [
    favorites,
    allMovies,
    allCharacters,
    allAttractionsFromStore,
    parks.length,
    dispatch,
  ]);

  // Combine attractions from parks (lazily loaded) and allAttractions (batch loaded)
  const allAttractions = useMemo(() => {
    const fromParks = Object.values(allAttractionsByPark).flat();
    const fromStore = allAttractionsFromStore;
    const combined = [...fromParks, ...fromStore];

    // Deduplicate by ID
    const uniqueMap = new Map<number, Attraction>();
    combined.forEach((attraction) => {
      if (!uniqueMap.has(attraction.id)) {
        uniqueMap.set(attraction.id, attraction);
      }
    });

    return Array.from(uniqueMap.values());
  }, [allAttractionsByPark, allAttractionsFromStore]);

  // Build a combined favorites array preserving the user's saved order
  const favoriteItems = useMemo<FavoriteItem[]>(() => {
    return favorites
      .map((fav) => {
        if (fav.type === "movie") {
          const movie = allMovies.find((m) => m.id === fav.id);
          return movie ? { type: "movie", data: movie } : null;
        }
        if (fav.type === "character") {
          const character = allCharacters.find((c) => c.id === fav.id);
          return character ? { type: "character", data: character } : null;
        }
        if (fav.type === "attraction") {
          const attraction = allAttractions.find((a) => a.id === fav.id);
          return attraction ? { type: "attraction", data: attraction } : null;
        }
        return null;
      })
      .filter(Boolean) as FavoriteItem[];
  }, [favorites, allMovies, allCharacters, allAttractions]);

  const hasFavorites = favoriteItems.length > 0;

  // Build a lightweight search index of favorite items for SearchInput
  const searchIndex = useMemo(() => {
    return favoriteItems.map((item) => {
      if (item.type === "movie") {
        const m = item.data as Movie;
        return {
          id: `movie-${m.id}`,
          title: m.title,
          secondary: `${m.releaseYear || ""}`,
          original: item,
        };
      }
      if (item.type === "character") {
        const c = item.data as Character;
        return {
          id: `char-${c.id}`,
          title: c.name,
          secondary: `${c.debut || ""}`,
          original: item,
        };
      }
      // attraction
      const a = item.data as Attraction;
      return {
        id: `attraction-${a.id}`,
        title: a.name,
        secondary: `${a.land_area || ""}`,
        original: item,
      };
    });
  }, [favoriteItems]);

  // Apply search filter, type filter, alphabetical filter, and sort to favoriteItems
  const filteredFavorites = useMemo(() => {
    let items = favoriteItems;

    // Apply type filter first
    if (filterType === "movies") {
      items = items.filter((item) => item.type === "movie");
    } else if (filterType === "characters") {
      items = items.filter((item) => item.type === "character");
    } else if (filterType === "attractions") {
      items = items.filter((item) => item.type === "attraction");
    }

    // Apply alphabetical filter
    if (selectedLetter) {
      items = items.filter((item) => {
        const name =
          item.type === "movie"
            ? (item.data as Movie).title
            : item.type === "character"
            ? (item.data as Character).name
            : (item.data as Attraction).name;
        const char = getIndexCharacter(name);
        return char === selectedLetter;
      });
    }

    // Then apply search filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      items = items.filter((item) => {
        if (item.type === "movie") {
          const movie = item.data as Movie;
          return (
            movie.title.toLowerCase().includes(lowerQuery) ||
            movie.releaseYear?.toString().includes(lowerQuery)
          );
        } else if (item.type === "character") {
          const character = item.data as Character;
          return (
            character.name.toLowerCase().includes(lowerQuery) ||
            character.debut?.toLowerCase().includes(lowerQuery)
          );
        } else {
          const attraction = item.data as Attraction;
          return (
            attraction.name.toLowerCase().includes(lowerQuery) ||
            attraction.land_area?.toLowerCase().includes(lowerQuery)
          );
        }
      });
    }

    // Apply sorting
    if (sortOrder) {
      items = [...items].sort((a, b) => {
        const nameA =
          a.type === "movie"
            ? (a.data as Movie).title
            : a.type === "character"
            ? (a.data as Character).name
            : (a.data as Attraction).name;
        const nameB =
          b.type === "movie"
            ? (b.data as Movie).title
            : b.type === "character"
            ? (b.data as Character).name
            : (b.data as Attraction).name;

        if (sortOrder === "name-asc") {
          return nameA.localeCompare(nameB);
        } else if (sortOrder === "name-desc") {
          return nameB.localeCompare(nameA);
        }
        return 0;
      });
    }

    return items;
  }, [favoriteItems, searchQuery, filterType, selectedLetter, sortOrder]);

  const handleSearch = useCallback(
    (_results: any[], query: string) => {
      dispatch(setFavoritesSearchQuery(query));
    },
    [dispatch]
  );

  const handleMovieClick = useCallback(
    (movieId: string) => {
      const movie = allMovies.find((m) => m.id === movieId);
      if (movie) {
        dispatch(addRecentlyViewedMovie({ id: movie.id, name: movie.title }));
        navigate(`/movie/${movie.id}`);
      }
    },
    [allMovies, dispatch, navigate]
  );

  const handleCharacterClick = useCallback(
    (characterId: string) => {
      const character = allCharacters.find((c) => c.id === characterId);
      if (character) {
        dispatch(
          addRecentlyViewedCharacter({ id: character.id, name: character.name })
        );
        navigate(`/character/${character.id}`);
      }
    },
    [allCharacters, dispatch, navigate]
  );

  const handleAttractionClick = useCallback(
    (attraction: Attraction) => {
      // Find the park for this attraction
      const targetPark = parks.find((p) => p.url_id === attraction.park_url_id);

      if (targetPark) {
        // Select the park first
        dispatch(selectPark(targetPark));
        // Wait for park to load, then select attraction
        setTimeout(() => {
          dispatch(selectAttraction(attraction));
        }, 300);
      }

      // Navigate to parks page
      navigate("/parks");
    },
    [parks, dispatch, navigate]
  );

  const handleGridColumnsChange = useCallback(
    (columns: number) => {
      dispatch(setFavoritesGridColumns(columns));
    },
    [dispatch]
  );

  const handleResetSearch = useCallback(() => {
    dispatch(setFavoritesSearchQuery(""));
  }, [dispatch]);

  const handleFilterChange = useCallback(
    (type: FilterType) => {
      dispatch(setFavoritesFilterType(type));
    },
    [dispatch]
  );

  const handleLetterSelect = useCallback(
    (letter: string | null) => {
      dispatch(setFavoritesSelectedLetter(letter));
    },
    [dispatch]
  );

  const handleSortChange = useCallback(
    (sort: string | null) => {
      dispatch(setFavoritesSortOrder(sort));
    },
    [dispatch]
  );

  // Build search index for AlphabetFilter
  const allFavoriteItems = useMemo(() => {
    return favoriteItems.map((item) => {
      if (item.type === "movie") {
        return { name: (item.data as Movie).title };
      } else if (item.type === "character") {
        return { name: (item.data as Character).name };
      } else {
        return { name: (item.data as Attraction).name };
      }
    });
  }, [favoriteItems]);

  return (
    <motion.div
      className="page-container favorites-page"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="favorites-page__header">
        <div className="favorites-page__header-content">
          <h1>Favorites</h1>
          <p>
            Your saved movies, characters, and attractions — shown with their
            native cards.
          </p>
        </div>

        <div className="favorites-page__controls">
          <SearchInput
            items={searchIndex}
            onSearch={handleSearch}
            searchFields={["title", "secondary"]}
            placeholder="Search favorites..."
            minCharacters={1}
            initialValue={searchQuery}
            getDisplayText={(i: any) => i.title}
            getSecondaryText={(i: any) => i.secondary}
          />
          {searchQuery && (
            <button
              className="favorites-page__reset-search"
              onClick={handleResetSearch}
              aria-label="Reset search"
            >
              <i className="fas fa-times-circle"></i>
              <span>Reset Search</span>
            </button>
          )}
        </div>
      </div>

      {!hasFavorites ? (
        <div className="favorites-page__empty">
          <p>
            No favorites yet. Add movies, characters, or attractions to your
            favorites!
          </p>
        </div>
      ) : (
        <div className="favorites-page__content">
          <div className="favorites-page__filters-section">
            <AlphabetFilter
              items={allFavoriteItems}
              nameKey="name"
              selectedLetter={selectedLetter}
              onLetterSelect={handleLetterSelect}
            />
            <div className="favorites-page__filter-row">
              <div className="favorites-page__filter-buttons">
                <button
                  className={`favorites-page__filter-button ${
                    filterType === "all" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("all")}
                  aria-label="Show all favorites"
                >
                  All
                </button>
                <button
                  className={`favorites-page__filter-button ${
                    filterType === "movies" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("movies")}
                  aria-label="Show movies only"
                >
                  Movies
                </button>
                <button
                  className={`favorites-page__filter-button ${
                    filterType === "characters" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("characters")}
                  aria-label="Show characters only"
                >
                  Characters
                </button>
                <button
                  className={`favorites-page__filter-button ${
                    filterType === "attractions" ? "active" : ""
                  }`}
                  onClick={() => handleFilterChange("attractions")}
                  aria-label="Show attractions only"
                >
                  Attractions
                </button>
              </div>
              <SortDropdown
                options={sortOptions}
                value={sortOrder}
                onChange={handleSortChange}
              />
            </div>
          </div>

          <div className="favorites-page__grid-controls">
            <CardSizeControl
              currentColumns={activeColumns}
              minColumns={minColumns}
              maxColumns={maxColumns}
              defaultColumns={defaultColumns}
              onChange={handleGridColumnsChange}
            />
          </div>
          <div
            className="favorites-grid"
            style={{
              gridTemplateColumns: `repeat(${activeColumns}, 1fr)`,
            }}
          >
            {filteredFavorites.map((item: FavoriteItem, idx: number) => {
              if (item.type === "movie") {
                return (
                  <MovieCard
                    key={`movie-${item.data.id}`}
                    movie={item.data}
                    onClick={() => handleMovieClick(item.data.id)}
                    index={idx}
                  />
                );
              } else if (item.type === "character") {
                return (
                  <CharacterCard
                    key={`char-${item.data.id}`}
                    character={item.data}
                    onClick={() => handleCharacterClick(item.data.id)}
                    index={idx}
                  />
                );
              } else {
                return (
                  <AttractionCard
                    key={`attraction-${item.data.id}`}
                    attraction={item.data}
                    onClick={() => handleAttractionClick(item.data)}
                    index={idx}
                    layout="external"
                  />
                );
              }
            })}
          </div>
        </div>
      )}
    </motion.div>
  );
};
