import { FormEvent, ReactNode, useCallback, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { useAppDispatch, useAppSelector } from "../../hooks/redux";
import {
  clearError,
  executeSearch,
  loadCapabilities,
  restoreFromHistory,
  selectDisneySearchHistory,
  selectDisneySearchState,
  setQuery,
  setScopeSelection,
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
} from "../../types/DisneySearch";
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

const extractFirstHighlightField = (result: DisneySearchResult) => {
  const entries = result.highlights ? Object.entries(result.highlights) : [];
  if (entries.length === 0) return null;
  const [field, ranges] = entries[0];
  const sourceText = (result as Record<string, string | undefined>)[field];
  return highlightContent(sourceText ?? result.descriptionSnippet, ranges);
};

const resolveDetailPath = (detailPath?: string | null) => {
  if (!detailPath) {
    return null;
  }
  if (detailPath.startsWith("/movies/")) {
    return detailPath.replace("/movies/", "/movie/");
  }
  if (detailPath.startsWith("/characters/")) {
    return detailPath.replace("/characters/", "/character/");
  }
  if (detailPath.startsWith("/parks/")) {
    return "/parks";
  }
  return detailPath;
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
  const {
    query,
    selectedCategories,
    scopeSelections,
    capabilities,
    capabilitiesLoading,
    results,
    loading,
    error,
  } = useAppSelector(selectDisneySearchState);
  const history = useAppSelector(selectDisneySearchHistory);

  useEffect(() => {
    if (!capabilities && !capabilitiesLoading) {
      dispatch(loadCapabilities());
    }
  }, [capabilities, capabilitiesLoading, dispatch]);

  const availableCategories = useMemo(
    () => getCategoryList(capabilities),
    [capabilities]
  );

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!query.trim()) {
      return;
    }
    dispatch(
      executeSearch({
        query: query.trim(),
        categories: selectedCategories,
        scopes: scopeSelections,
      })
    );
  };

  const handleCategoryToggle = useCallback(
    (category: SearchCategoryKey) => dispatch(toggleCategory(category)),
    [dispatch]
  );

  const handleScopeChange = useCallback(
    (category: SearchCategoryKey, scope: SearchScopeKey) =>
      dispatch(setScopeSelection({ category, scope })),
    [dispatch]
  );

  const handleHistoryReplay = (entry: SearchHistoryEntry) => {
    dispatch(restoreFromHistory(entry));
    dispatch(
      executeSearch({
        query: entry.query,
        categories: entry.categories,
        scopes: entry.scopes,
      })
    );
  };

  const hasResults = Object.values(results).some(
    (categoryResult) => categoryResult?.results?.length
  );

  const availableScopes = (
    category: SearchCategoryKey
  ): Array<{ key: string; label: string }> => {
    const scopeConfig = capabilities?.categories?.[category]?.scopes;
    if (!scopeConfig) {
      return [
        { key: "basic", label: "Basic" },
        { key: "extended", label: "Extended" },
      ];
    }
    return Object.entries(scopeConfig).map(([key, value]) => ({
      key,
      label: value.label,
    }));
  };

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
              {loading ? "Searching..." : "Search"}
            </button>
          </div>

          <div className="disney-search-form__controls">
            <div className="disney-search-form__group">
              <p className="group-label">Categories</p>
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
              <p className="group-label">Scope settings</p>
              <div className="scope-grid">
                {availableCategories.map((category) => (
                  <label
                    key={`${category.key}-scope`}
                    className="scope-grid__item"
                  >
                    <span>{category.label}</span>
                    <select
                      value={scopeSelections[category.key]}
                      onChange={(event) =>
                        handleScopeChange(
                          category.key,
                          event.target.value as SearchScopeKey
                        )
                      }
                    >
                      {availableScopes(category.key).map((scope) => (
                        <option key={scope.key} value={scope.key}>
                          {scope.label}
                        </option>
                      ))}
                    </select>
                  </label>
                ))}
              </div>
            </div>

            <div className="disney-search-form__group">
              <p className="group-label">Scope presets</p>
              <div className="preset-grid">
                {scopePresets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    className="preset-card"
                    onClick={() => dispatch(applyScopePreset(preset.scopes))}
                  >
                    <span className="preset-card__label">{preset.label}</span>
                    <span className="preset-card__description">
                      {preset.description}
                    </span>
                  </button>
                ))}
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
                      const resolvedDetailPath = resolveDetailPath(
                        result.detailPath
                      );
                      return (
                        <li
                          key={`${result.type}-${result.id}`}
                          className="result-card"
                        >
                          {result.imageUrl && (
                            <img
                              src={result.imageUrl}
                              alt={result.title}
                              loading="lazy"
                            />
                          )}
                          <div>
                            <div className="result-card__title-row">
                              <p className="eyebrow">{result.type}</p>
                              <h4>{result.title}</h4>
                            </div>
                            <p className="result-card__snippet">
                              {extractFirstHighlightField(result) ??
                                result.descriptionSnippet}
                            </p>
                            {resolvedDetailPath && (
                              <Link
                                to={resolvedDetailPath}
                                className="result-card__link"
                              >
                                View details
                              </Link>
                            )}
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
