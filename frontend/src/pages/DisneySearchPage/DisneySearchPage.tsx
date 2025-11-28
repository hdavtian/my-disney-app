import { FormEvent, ReactNode, useCallback, useEffect, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import { selectPark, fetchParks } from "../../store/slices/parksSlice";
import {
  selectAttraction,
  fetchAttractionsByPark,
} from "../../store/slices/attractionsSlice";
import type { Attraction } from "../../types/Attraction";
import {
  clearError,
  executeSearch,
  loadCapabilities,
  restoreFromHistory,
  selectDisneySearchHistory,
  selectDisneySearchState,
  setMatchMode,
  setQuery,
  toggleCategory,
  applyScopePreset,
} from "../../store/slices/disneySearchSlice";
import {
  DisneySearchResult,
  HighlightRange,
  SearchCapabilitiesResponse,
  SearchCategoryKey,
  SearchHistoryEntry,
  SearchScopeKey,
  SearchResultType,
} from "../../types/DisneySearch";
import { getImageUrl } from "../../config/assets";
import { trackEvent } from "../../hooks/useAnalytics";
import "./DisneySearchPage.scss";

const scopePresets: Array<{
  id: string;
  label: string;
  description: string;
  scopes: Partial<Record<SearchCategoryKey, SearchScopeKey>>;
}> = [
  {
    id: "story-core",
    label: "Story Core",
    description: "Balanced preset focused on headline synopsis fields.",
    scopes: { movies: "basic", characters: "basic", parks: "basic" },
  },
  {
    id: "deep-dive",
    label: "Deep Dive",
    description: "Enable extended metadata for richer research journeys.",
    scopes: { movies: "extended", characters: "extended", parks: "extended" },
  },
];

const fallbackCategories: Array<{ key: SearchCategoryKey; label: string }> = [
  { key: "movies", label: "Movies" },
  { key: "characters", label: "Characters" },
  { key: "parks", label: "Parks" },
];

/**
 * Map search result type to asset category for getImageUrl utility.
 */
const getAssetCategory = (
  resultType: SearchResultType
): "movies" | "characters" | "attractions" => {
  switch (resultType.toLowerCase()) {
    case "movie":
      return "movies";
    case "character":
      return "characters";
    case "park":
    case "attraction":
      return "attractions";
    default:
      return "movies"; // fallback
  }
};

const highlightContent = (
  text?: string | null,
  ranges?: HighlightRange[]
): ReactNode => {
  if (!text) return null;
  if (!ranges || ranges.length === 0) {
    return <span>{text}</span>;
  }

  const fragments: ReactNode[] = [];
  let cursor = 0;

  ranges.forEach((range, index) => {
    if (cursor < range.start) {
      fragments.push(
        <span key={`plain-${index}-${cursor}`}>
          {text.slice(cursor, range.start)}
        </span>
      );
    }
    fragments.push(
      <mark key={`mark-${index}-${range.start}`}>
        {text.slice(range.start, range.end)}
      </mark>
    );
    cursor = range.end;
  });

  if (cursor < text.length) {
    fragments.push(<span key="tail">{text.slice(cursor)}</span>);
  }

  return <span>{fragments}</span>;
};

const extractHighlightedFields = (result: DisneySearchResult) => {
  const entries = result.highlights ? Object.entries(result.highlights) : [];
  if (entries.length === 0) return null;

  // Now each highlight contains both text and ranges
  // We can display ALL fields without worrying about text/highlight mismatch
  const highlightElements = entries
    .map(([field, fieldHighlight], index) => {
      if (!fieldHighlight.text) return null;

      return (
        <div key={`${field}-${index}`} className="highlight-match">
          <span className="field-label">{field.replace(/_/g, " ")}:</span>
          <span className="field-value">
            {highlightContent(fieldHighlight.text, fieldHighlight.ranges)}
          </span>
        </div>
      );
    })
    .filter(Boolean);

  return highlightElements.length > 0 ? highlightElements : null;
};

const resolveDetailPath = (result: DisneySearchResult) => {
  const rawDetailPath = (result as any).detail_path;

  if (!rawDetailPath) {
    return null;
  }

  // For movies and characters, use the ID instead of url_id
  if (result.type === "movie") {
    return `/movie/${result.id}`;
  }

  if (result.type === "character") {
    return `/character/${result.id}`;
  }

  // Parks are handled separately with button click
  if (result.type === "park") {
    return "/parks";
  }

  return null;
};

const getCategoryList = (
  capabilities?: SearchCapabilitiesResponse
): Array<{ key: SearchCategoryKey; label: string }> => {
  if (!capabilities) {
    return fallbackCategories;
  }
  return Object.entries(capabilities.categories).map(([key, value]) => ({
    key: key as SearchCategoryKey,
    label: value.label,
  }));
};

export const DisneySearchPage = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const {
    query,
    selectedCategories,
    scopeSelections,
    matchMode,
    capabilities,
    capabilitiesLoading,
    results,
    loading,
    error,
  } = useAppSelector(selectDisneySearchState);
  const history = useAppSelector(selectDisneySearchHistory);
  const { parks } = useAppSelector((state) => state.parks);

  useEffect(() => {
    if (!capabilities && !capabilitiesLoading) {
      dispatch(loadCapabilities());
    }
  }, [capabilities, capabilitiesLoading, dispatch]);

  // Fetch parks data for park attraction navigation
  useEffect(() => {
    dispatch(fetchParks());
  }, [dispatch]);

  const availableCategories = useMemo(
    () => getCategoryList(capabilities),
    [capabilities]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }

    // Track Disney search query
    trackEvent("disney_search", {
      search_term: query.trim(),
    });

    dispatch(
      executeSearch({
        query: query.trim(),
        categories: selectedCategories,
        scopes: scopeSelections,
        matchMode,
      })
    );
  };

  const handleCategoryToggle = useCallback(
    (category: SearchCategoryKey) => dispatch(toggleCategory(category)),
    [dispatch]
  );

  const handleHistoryReplay = (entry: SearchHistoryEntry) => {
    dispatch(restoreFromHistory(entry));
    dispatch(
      executeSearch({
        query: entry.query,
        categories: entry.categories,
        scopes: entry.scopes,
        matchMode,
      })
    );
  };

  const handleParkAttractionClick = useCallback(
    (result: DisneySearchResult) => {
      const rawDetailPath = (result as any).detail_path;
      if (!rawDetailPath || !rawDetailPath.startsWith("/parks/")) return;

      // Extract attraction URL ID from path like "/parks/space_mountain"
      const attractionUrlId = rawDetailPath.replace("/parks/", "");

      // Extract park URL ID from result (should be in the result data)
      const parkUrlId = (result as any).park_url_id;
      if (!parkUrlId) {
        console.error("No park_url_id found for attraction:", result);
        return;
      }

      // Find the park
      const targetPark = parks.find((p) => p.url_id === parkUrlId);
      if (!targetPark) {
        console.error("Could not find park with url_id:", parkUrlId);
        return;
      }

      // Navigate to parks page
      navigate("/parks");

      // Select the park
      dispatch(selectPark(targetPark));

      // Fetch attractions for the park and then select the specific attraction
      dispatch(fetchAttractionsByPark(parkUrlId)).then((action) => {
        // Get attractions from the fulfilled action payload
        if (fetchAttractionsByPark.fulfilled.match(action)) {
          const attractions = action.payload.attractions;

          // Find the full attraction object
          const fullAttraction = attractions.find(
            (attr: Attraction) => attr.url_id === attractionUrlId
          );

          if (fullAttraction) {
            // Select the specific attraction immediately (overriding the auto-select)
            dispatch(selectAttraction(fullAttraction));
          } else {
            console.error(
              "Could not find attraction with url_id:",
              attractionUrlId
            );
          }
        }
      });
    },
    [dispatch, navigate, parks]
  );

  const hasResults = Object.values(results).some(
    (categoryResult) => categoryResult?.results?.length
  );

  return (
    <div className="disney-search-page">
      <section className="disney-search-page__hero">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="disney-search-page__hero-inner"
        >
          <p className="eyebrow">New multi-index beta</p>
          <h1>Disney Search</h1>
          <p className="lede">
            Explore characters, films, and park moments through a single
            cinematic search canvas powered by our aggregated index.
          </p>
        </motion.div>
      </section>

      <section className="disney-search-page__panel">
        <form className="disney-search-form" onSubmit={handleSubmit}>
          <label className="sr-only" htmlFor="disney-search-query">
            Search for Disney content
          </label>
          <div className="disney-search-form__field">
            <input
              id="disney-search-query"
              type="text"
              value={query}
              onChange={(event) => dispatch(setQuery(event.target.value))}
              placeholder="Search movies, characters, attractions..."
              aria-label="Disney Search query"
            />
            <button
              type="submit"
              className="primary"
              disabled={loading || query.trim().length === 0}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Searching...
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>

          <div className="disney-search-form__match-mode">
            <div
              className="match-mode-radios"
              role="radiogroup"
              aria-label="Match mode"
            >
              <label className="match-mode-radio">
                <input
                  type="radio"
                  name="match-mode"
                  value="exact"
                  checked={matchMode === "exact"}
                  onChange={() => dispatch(setMatchMode("exact"))}
                />
                <span>Exact Words</span>
              </label>
              <label className="match-mode-radio">
                <input
                  type="radio"
                  name="match-mode"
                  value="partial"
                  checked={matchMode === "partial"}
                  onChange={() => dispatch(setMatchMode("partial"))}
                />
                <span>Partial Match</span>
              </label>
            </div>
          </div>

          <div className="disney-search-form__controls">
            <div className="disney-search-form__group">
              <p className="group-label">Categories</p>
              <p className="group-help-text">
                Select which content types to search across (you can select
                multiple)
              </p>
              <div
                className="pill-list"
                role="group"
                aria-label="Search categories"
              >
                {availableCategories.map((category) => (
                  <button
                    key={category.key}
                    type="button"
                    className={`pill ${
                      selectedCategories.includes(category.key)
                        ? "pill--active"
                        : ""
                    }`}
                    onClick={() => handleCategoryToggle(category.key)}
                    aria-pressed={selectedCategories.includes(category.key)}
                  >
                    {category.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="disney-search-form__group">
              <p className="group-label">Scope presets</p>
              <p className="group-help-text">
                Quick presets to apply common search configurations
              </p>
              <div
                className="preset-grid"
                role="radiogroup"
                aria-label="Scope presets"
              >
                {scopePresets.map((preset) => (
                  <label key={preset.id} className="preset-card">
                    <input
                      type="radio"
                      name="scope-preset"
                      value={preset.id}
                      defaultChecked={preset.id === "story-core"}
                      onChange={() => dispatch(applyScopePreset(preset.scopes))}
                    />
                    <div className="preset-card__content">
                      <span className="preset-card__label">{preset.label}</span>
                      <span className="preset-card__description">
                        {preset.description}
                      </span>
                    </div>
                  </label>
                ))}{" "}
              </div>
            </div>
          </div>
        </form>

        {error && (
          <div className="disney-search-page__alert" role="alert">
            <span>{error}</span>
            <button type="button" onClick={() => dispatch(clearError())}>
              Dismiss
            </button>
          </div>
        )}
      </section>

      <section className="disney-search-page__panel">
        <header className="panel-header">
          <div>
            <p className="eyebrow">Live results</p>
            <h2>Search spotlight</h2>
            {hasResults && (
              <p className="total-count" aria-live="polite">
                {Object.values(results).reduce(
                  (sum, cat) => sum + (cat?.total ?? 0),
                  0
                )}{" "}
                total matches
              </p>
            )}
          </div>
          {history.length > 0 && (
            <div className="history-chip" aria-live="polite">
              Recent searches: {history.length}
            </div>
          )}
        </header>

        {!hasResults && !loading && (
          <div className="empty-state">
            <p>
              Start by entering a query and selecting the categories you care
              about.
            </p>
          </div>
        )}

        <div className="result-grid">
          {selectedCategories.map((categoryKey) => {
            const categoryResult = results[categoryKey];
            const items = categoryResult?.results ?? [];
            const total = categoryResult?.total ?? 0;
            const categoryLabel = availableCategories.find(
              (category) => category.key === categoryKey
            )?.label;

            return (
              <article key={categoryKey} className="result-column">
                <header>
                  <p className="eyebrow">{categoryLabel}</p>
                  <h3>
                    {total} {total === 1 ? "match" : "matches"}
                  </h3>
                </header>

                {items.length === 0 ? (
                  <p className="muted">No matches yet.</p>
                ) : (
                  <ul>
                    {items.map((result) => {
                      const rawImageUrl = (result as any).image_url;
                      const resolvedDetailPath = resolveDetailPath(result);
                      const assetCategory = getAssetCategory(result.type);
                      const imageUrl = rawImageUrl
                        ? getImageUrl(assetCategory, rawImageUrl)
                        : null;
                      const parkName = (result as any).park_name;

                      console.log("[DisneySearch] Result processing:", {
                        title: result.title,
                        type: result.type,
                        id: result.id,
                        rawImageUrl,
                        assetCategory,
                        computedImageUrl: imageUrl,
                        resolvedDetailPath,
                        parkName,
                      });

                      return (
                        <li
                          key={`${result.type}-${result.id}`}
                          className="result-card"
                        >
                          <div className="result-card__image">
                            {imageUrl ? (
                              <img
                                src={imageUrl}
                                alt={result.title}
                                loading="lazy"
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            ) : (
                              <div className="result-card__image-placeholder">
                                {result.title.charAt(0)}
                              </div>
                            )}
                          </div>

                          <div className="result-card__content">
                            <h4 className="result-card__title">
                              {result.title}
                            </h4>

                            {extractHighlightedFields(result) ? (
                              <div className="result-card__highlights">
                                {extractHighlightedFields(result)}
                              </div>
                            ) : (
                              <p className="result-card__snippet result-card__snippet--empty">
                                No additional details available
                              </p>
                            )}

                            <div className="result-card__badges">
                              <span className="result-card__type-badge">
                                {result.type}
                              </span>
                              {parkName && (
                                <span className="result-card__park-badge">
                                  {parkName}
                                </span>
                              )}
                            </div>

                            {resolvedDetailPath &&
                              (result.type === "park" ? (
                                <button
                                  onClick={() =>
                                    handleParkAttractionClick(result)
                                  }
                                  className="result-card__link"
                                  type="button"
                                >
                                  View details
                                </button>
                              ) : (
                                <Link
                                  to={resolvedDetailPath}
                                  className="result-card__link"
                                >
                                  View details
                                </Link>
                              ))}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </article>
            );
          })}
        </div>
      </section>

      {history.length > 0 && (
        <section className="disney-search-page__panel">
          <header className="panel-header">
            <div>
              <p className="eyebrow">Recall center</p>
              <h2>Recent explorations</h2>
            </div>
          </header>
          <div className="history-grid">
            {history.map((entry) => (
              <button
                key={entry.timestamp}
                className="history-card"
                type="button"
                onClick={() => handleHistoryReplay(entry)}
              >
                <span className="history-card__query">“{entry.query}”</span>
                <span className="history-card__meta">
                  {entry.categories.join(", ")}
                </span>
                <span className="history-card__action">Run again</span>
              </button>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
