import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CacheService } from "../../utils/cacheService";
import { clearPreferencesFromStorage } from "../../store/middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "../../store/slices/uiPreferencesSlice";
import { hydrateFavorites } from "../../store/slices/favoritesSlice";
import { clearDisclaimer } from "../../utils/disclaimerGate";
import { clear_guessing_game_state } from "../../utils/guessingGameStorage";
import { clearGameState as clearToonQuizState } from "../../utils/quizStorage";
import { resetPagination as resetMoviesPagination } from "../../store/slices/moviesSlice";
import { resetPagination as resetCharactersPagination } from "../../store/slices/charactersSlice";
import { useTheme } from "../../hooks/useTheme";
import { trackEvent } from "../../hooks/useAnalytics";
import { VersionInfo } from "../VersionInfo/VersionInfo";
import "./SiteSettings.scss";

interface SiteSettingsProps {
  show: boolean;
  onHide: () => void;
}

interface ToastMessage {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

type TabType = "cache" | "theme" | "about";

export const SiteSettings: React.FC<SiteSettingsProps> = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const { selectedTheme, availableThemes, changeTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<TabType>("theme");
  const [cacheStats, setCacheStats] = useState(CacheService.getStats());
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [showConfirm, setShowConfirm] = useState<{
    action: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Clear data checkboxes state (all checked by default)
  const [clearOptions, setClearOptions] = useState({
    cachedData: true,
    preferences: true,
    favorites: true,
    disclaimer: true,
    guessingGame: true,
    toonQuiz: true,
  });

  // Refresh cache stats when modal opens
  useEffect(() => {
    if (show) {
      setCacheStats(CacheService.getStats());
    }
  }, [show]);

  // Auto-hide toast after 3 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const refreshCacheStats = () => {
    setCacheStats(CacheService.getStats());
  };

  const showToast = (type: ToastMessage["type"], message: string) => {
    setToast({ type, message });
  };

  const handleToggleClearOption = (option: keyof typeof clearOptions) => {
    setClearOptions((prev) => ({ ...prev, [option]: !prev[option] }));
  };

  const handleClearSelectedData = () => {
    const selectedItems = Object.entries(clearOptions)
      .filter(([_, checked]) => checked)
      .map(([key]) => key);

    if (selectedItems.length === 0) {
      showToast("warning", "Please select at least one option to clear.");
      return;
    }

    const itemLabels = selectedItems.map((key) => {
      switch (key) {
        case "cachedData":
          return "Cached API Data";
        case "preferences":
          return "View Preferences";
        case "favorites":
          return "Favorites";
        case "disclaimer":
          return "Disclaimer Agreement";
        case "guessingGame":
          return "Guessing Game Progress";
        case "toonQuiz":
          return "Toon Quiz Progress";
        default:
          return key;
      }
    });

    const allSelected = selectedItems.length === 6;
    const message = allSelected
      ? "⚠️ This will clear ALL site data. The page will reload after clearing. Are you sure?"
      : `Are you sure you want to clear: ${itemLabels.join(", ")}?`;

    setShowConfirm({
      action: "Clear Selected Data",
      message,
      onConfirm: () => {
        let clearedItems: string[] = [];

        // Clear cached API data
        if (clearOptions.cachedData) {
          CacheService.clear();
          clearedItems.push("Cached API Data");
        }

        // Clear Guessing Game state
        if (clearOptions.guessingGame) {
          clear_guessing_game_state();
          clearedItems.push("Guessing Game Progress");
        }

        // Clear Toon Quiz state
        if (clearOptions.toonQuiz) {
          clearToonQuizState();
          clearedItems.push("Toon Quiz Progress");
        }

        // Clear preferences
        if (clearOptions.preferences) {
          clearPreferencesFromStorage();
          dispatch(
            rehydratePreferences({
              movies: {
                viewMode: "grid",
                gridItemsToShow: 20,
                searchQuery: "",
                gridColumns: 0,
                selectedLetter: null,
                sortOrder: null,
                lastUpdated: Date.now(),
              },
              characters: {
                viewMode: "grid",
                gridItemsToShow: 20,
                searchQuery: "",
                gridColumns: 0,
                selectedLetter: null,
                sortOrder: null,
                selectedCategories: [],
                lastUpdated: Date.now(),
              },
              favorites: {
                viewMode: "grid",
                gridItemsToShow: 20,
                searchQuery: "",
                gridColumns: 0,
                filterType: "all",
                lastUpdated: Date.now(),
              },
              parks: {
                searchQuery: "",
                searchMode: "current",
                lastUpdated: Date.now(),
              },
              theme: "light", // Reset to default theme
            })
          );
          // Reset pagination state in movies and characters slices
          // This ensures displayedMovies/displayedCharacters arrays are reset to initial 20 items
          dispatch(resetMoviesPagination());
          dispatch(resetCharactersPagination());
          // Reset theme to default using changeTheme from useTheme hook
          // This properly updates both Redux state AND applies theme to body element
          changeTheme("auto");
          clearedItems.push("View Preferences");
        }

        // Clear favorites
        if (clearOptions.favorites) {
          dispatch(hydrateFavorites([]));
          localStorage.removeItem("disneyapp_favorites");
          clearedItems.push("Favorites");
        }

        // Clear disclaimer
        if (clearOptions.disclaimer) {
          clearDisclaimer();
          clearedItems.push("Disclaimer Agreement");
        }

        refreshCacheStats();
        setShowConfirm(null);

        // If all options cleared, reload page after showing toast
        if (allSelected) {
          showToast("success", "All site data cleared! Reloading page...");
          setTimeout(() => {
            window.location.reload();
          }, 1500);
        } else {
          showToast(
            "success",
            `Cleared: ${clearedItems.join(", ")}${
              clearOptions.disclaimer
                ? ". Please refresh to see disclaimer."
                : ""
            }`
          );
        }
      },
    });
  };

  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div className="settings-backdrop" onClick={onHide}></div>

      {/* Modal Dialog */}
      <div className="settings-modal">
        <div className="settings-modal__content">
          {/* Header */}
          <div className="settings-modal__header">
            <div className="settings-modal__title">
              <i className="fas fa-cog"></i>
              <span>Site Settings</span>
            </div>
            <button
              className="settings-modal__close"
              onClick={onHide}
              aria-label="Close"
            >
              <i className="fas fa-times"></i>
            </button>
          </div>

          {/* Tabs */}
          <div className="settings-tabs">
            <button
              className={`settings-tab ${
                activeTab === "theme" ? "settings-tab--active" : ""
              }`}
              onClick={() => setActiveTab("theme")}
            >
              <i className="fas fa-palette"></i>
              Theme
            </button>
            <button
              className={`settings-tab ${
                activeTab === "cache" ? "settings-tab--active" : ""
              }`}
              onClick={() => setActiveTab("cache")}
            >
              <i className="fas fa-database"></i>
              Cache Settings
            </button>
            <button
              className={`settings-tab ${
                activeTab === "about" ? "settings-tab--active" : ""
              }`}
              onClick={() => setActiveTab("about")}
            >
              <i className="fas fa-info-circle"></i>
              About
            </button>
          </div>

          {/* Tab Content */}
          <div className="settings-modal__body">
            {activeTab === "cache" && (
              <div className="settings-tab-panel">
                {/* Cache Statistics Section */}
                <section className="settings-section settings-section--compact">
                  <h3 className="settings-section__title">
                    <i className="fas fa-chart-bar"></i>
                    Cache Statistics
                  </h3>
                  <div className="cache-stats">
                    <div className="cache-stats__item">
                      <span className="cache-stats__label">Items</span>
                      <span className="cache-stats__value">
                        {cacheStats.totalItems}
                      </span>
                    </div>
                    <div className="cache-stats__item">
                      <span className="cache-stats__label">Size</span>
                      <span className="cache-stats__value">
                        {cacheStats.totalSize}
                      </span>
                    </div>
                  </div>

                  {/* Detailed Cache Items */}
                  {cacheStats.items.length > 0 && (
                    <div className="cache-details">
                      <h4 className="cache-details__title">Cached Items</h4>
                      <div className="cache-details__list">
                        {cacheStats.items.map((item, index) => (
                          <div key={index} className="cache-item">
                            <div className="cache-item__key">{item.key}</div>
                            <div className="cache-item__meta">
                              <span className="cache-item__size">
                                {item.size}
                              </span>
                              <span className="cache-item__expiry">
                                <i className="fas fa-clock"></i>
                                {item.expiresIn}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </section>

                {/* Clear Data Section */}
                <section className="settings-section settings-section--compact">
                  <h3 className="settings-section__title">
                    <i className="fas fa-broom"></i>
                    Clear Site Data
                  </h3>

                  {/* Checkboxes */}
                  <div className="clear-options">
                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.cachedData}
                        onChange={() => handleToggleClearOption("cachedData")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-database"></i>
                          Cached API Data
                        </div>
                        <div className="clear-option__description">
                          Characters & movies downloaded from server (
                          {cacheStats.totalItems} items, {cacheStats.totalSize})
                        </div>
                      </div>
                    </label>

                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.preferences}
                        onChange={() => handleToggleClearOption("preferences")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-sliders-h"></i>
                          View Preferences
                        </div>
                        <div className="clear-option__description">
                          Grid/list views, search filters, pagination settings,
                          theme
                        </div>
                      </div>
                    </label>

                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.favorites}
                        onChange={() => handleToggleClearOption("favorites")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-heart"></i>
                          Favorites
                        </div>
                        <div className="clear-option__description">
                          Your saved favorite characters, movies & attractions
                        </div>
                      </div>
                    </label>

                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.disclaimer}
                        onChange={() => handleToggleClearOption("disclaimer")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-file-contract"></i>
                          Disclaimer Agreement
                        </div>
                        <div className="clear-option__description">
                          Access gate - you'll need to re-accept on next visit
                        </div>
                      </div>
                    </label>

                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.guessingGame}
                        onChange={() => handleToggleClearOption("guessingGame")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-gamepad"></i>
                          Guessing Game Progress
                        </div>
                        <div className="clear-option__description">
                          Saved game state, score, and current question
                        </div>
                      </div>
                    </label>

                    <label className="clear-option">
                      <input
                        type="checkbox"
                        checked={clearOptions.toonQuiz}
                        onChange={() => handleToggleClearOption("toonQuiz")}
                      />
                      <div className="clear-option__content">
                        <div className="clear-option__label">
                          <i className="fas fa-question-circle"></i>
                          Toon Quiz Progress
                        </div>
                        <div className="clear-option__description">
                          Saved quiz state, score, and current question
                        </div>
                      </div>
                    </label>
                  </div>

                  {/* Clear Button */}
                  <button
                    className="settings-btn settings-btn--primary"
                    onClick={handleClearSelectedData}
                    disabled={
                      !clearOptions.cachedData &&
                      !clearOptions.preferences &&
                      !clearOptions.favorites &&
                      !clearOptions.disclaimer &&
                      !clearOptions.guessingGame &&
                      !clearOptions.toonQuiz
                    }
                  >
                    <i className="fas fa-broom"></i>
                    <span>Clear Selected Data</span>
                  </button>
                </section>
              </div>
            )}

            {activeTab === "theme" && (
              <div className="settings-tab-panel">
                <section className="settings-section">
                  <h3 className="settings-section__title">
                    <i className="fas fa-paint-brush"></i>
                    Choose Your Theme
                  </h3>
                  <p className="settings-section__description">
                    Select a theme to customize your viewing experience. Choose
                    "Auto" to automatically match your system preferences.
                  </p>

                  <div className="theme-grid">
                    {availableThemes.map((theme) => (
                      <button
                        key={theme.id}
                        className={`theme-card ${
                          selectedTheme === theme.id ? "theme-card--active" : ""
                        }`}
                        onClick={() => {
                          changeTheme(theme.id);
                          trackEvent("theme_selected", {
                            theme_id: theme.id,
                            theme_name: theme.name,
                          });
                        }}
                        aria-label={`Select ${theme.name} theme`}
                        data-theme={theme.id}
                      >
                        {/* Selected Indicator */}
                        {selectedTheme === theme.id && (
                          <div className="theme-card__badge">
                            <i className="fas fa-check-circle"></i>
                          </div>
                        )}

                        {/* Theme Preview */}
                        <div
                          className="theme-card__preview"
                          style={{
                            background: theme.preview.background,
                          }}
                        >
                          {theme.fonts ? (
                            <div className="theme-card__preview-fonts">
                              <div
                                className="theme-card__preview-line"
                                style={{
                                  color: theme.preview.text,
                                  fontFamily: theme.fonts.display,
                                }}
                              >
                                {theme.name}
                              </div>
                              <div
                                className="theme-card__preview-line"
                                style={{
                                  color: theme.preview.text,
                                  fontFamily: theme.fonts.accent,
                                }}
                              >
                                {theme.name}
                              </div>
                            </div>
                          ) : (
                            <div
                              className="theme-card__preview-text"
                              style={{ color: theme.preview.text }}
                            >
                              Aa
                            </div>
                          )}
                          <div
                            className="theme-card__preview-accent"
                            style={{ background: theme.preview.accent }}
                          ></div>
                        </div>

                        {/* Color Swatches */}
                        {theme.swatches && (
                          <div className="theme-card__swatches">
                            {theme.swatches.map((color, index) => (
                              <div
                                key={index}
                                className="theme-card__swatch"
                                style={{ backgroundColor: color }}
                                title={color}
                              />
                            ))}
                          </div>
                        )}

                        {/* Theme Info */}
                        <div
                          className="theme-card__info"
                          style={{
                            background: theme.preview.background,
                          }}
                        >
                          <div className="theme-card__name">
                            {theme.id === "auto" && (
                              <i className="fas fa-magic"></i>
                            )}
                            {theme.name}
                          </div>
                          <div className="theme-card__description">
                            {theme.description}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </section>
              </div>
            )}

            {activeTab === "about" && (
              <div className="settings-tab-panel">
                <section className="settings-section">
                  <h3 className="settings-section__title">
                    <i className="fas fa-info-circle"></i>
                    Application Information
                  </h3>
                  <div className="about-content">
                    <div className="about-section">
                      <h4 className="about-section__title">
                        Version Information
                      </h4>
                      <VersionInfo />
                    </div>
                    <div className="about-section">
                      <h4 className="about-section__title">About Disney App</h4>
                      <p className="about-section__text">
                        A modern Disney character and movie catalog showcasing
                        cinematic design and clean architecture.
                      </p>
                    </div>
                  </div>
                </section>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className={`settings-toast settings-toast--${toast.type}`}>
          <i
            className={`fas fa-${
              toast.type === "success"
                ? "check-circle"
                : toast.type === "error"
                ? "times-circle"
                : toast.type === "warning"
                ? "exclamation-triangle"
                : "info-circle"
            }`}
          ></i>
          <span>{toast.message}</span>
        </div>
      )}

      {/* Confirmation Dialog */}
      {showConfirm && (
        <div className="settings-confirm">
          <div className="settings-confirm__content">
            <h3 className="settings-confirm__title">{showConfirm.action}</h3>
            <p className="settings-confirm__message">{showConfirm.message}</p>
            <div className="settings-confirm__actions">
              <button
                className="settings-confirm__btn settings-confirm__btn--cancel"
                onClick={() => setShowConfirm(null)}
              >
                Cancel
              </button>
              <button
                className="settings-confirm__btn settings-confirm__btn--confirm"
                onClick={showConfirm.onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SiteSettings;
