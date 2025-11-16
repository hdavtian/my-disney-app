import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CacheService } from "../../utils/cacheService";
import { clearPreferencesFromStorage } from "../../store/middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "../../store/slices/uiPreferencesSlice";
import { hydrateFavorites } from "../../store/slices/favoritesSlice";
import { clearDisclaimer } from "../../utils/disclaimerGate";
import { useTheme } from "../../hooks/useTheme";
import "./SiteSettings.scss";

interface SiteSettingsProps {
  show: boolean;
  onHide: () => void;
}

interface ToastMessage {
  type: "success" | "error" | "warning" | "info";
  message: string;
}

type TabType = "cache" | "theme";

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
        default:
          return key;
      }
    });

    const allSelected = selectedItems.length === 4;
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

        // Clear preferences
        if (clearOptions.preferences) {
          clearPreferencesFromStorage();
          dispatch(
            rehydratePreferences({
              movies: {
                viewMode: "grid",
                gridItemsToShow: 20,
                searchQuery: "",
                lastUpdated: Date.now(),
              },
              characters: {
                viewMode: "grid",
                gridItemsToShow: 20,
                searchQuery: "",
                lastUpdated: Date.now(),
              },
              theme: "light",
            })
          );
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

  const handleClearCache = () => {
    setShowConfirm({
      action: "Clear Cache",
      message:
        "Are you sure you want to clear all cached data? This will cause the app to re-fetch data from the server.",
      onConfirm: () => {
        CacheService.clear();
        refreshCacheStats();
        showToast("success", "Cache cleared successfully!");
        setShowConfirm(null);
      },
    });
  };

  const handleResetPreferences = () => {
    setShowConfirm({
      action: "Reset Preferences",
      message:
        "Are you sure you want to reset all preferences to defaults? This will reset view modes, pagination, and search history.",
      onConfirm: () => {
        clearPreferencesFromStorage();
        dispatch(
          rehydratePreferences({
            movies: {
              viewMode: "grid",
              gridItemsToShow: 20,
              searchQuery: "",
              lastUpdated: Date.now(),
            },
            characters: {
              viewMode: "grid",
              gridItemsToShow: 20,
              searchQuery: "",
              lastUpdated: Date.now(),
            },
            theme: "light",
          })
        );
        refreshCacheStats();
        showToast("success", "Preferences reset successfully!");
        setShowConfirm(null);
      },
    });
  };

  const handleResetAll = () => {
    setShowConfirm({
      action: "Reset All Site Data",
      message:
        "⚠️ This will clear ALL site data including cache, preferences, and cookies. The page will reload after reset. Are you sure?",
      onConfirm: () => {
        CacheService.clear();
        clearPreferencesFromStorage();
        // Clear favorites from Redux store
        dispatch(hydrateFavorites([]));
        // Also clear favorites from localStorage
        localStorage.removeItem("disneyapp_favorites");
        dispatch(
          rehydratePreferences({
            movies: {
              viewMode: "grid",
              gridItemsToShow: 20,
              searchQuery: "",
              lastUpdated: Date.now(),
            },
            characters: {
              viewMode: "grid",
              gridItemsToShow: 20,
              searchQuery: "",
              lastUpdated: Date.now(),
            },
            theme: "light",
          })
        );
        showToast("success", "All site data reset! Reloading page...");
        setShowConfirm(null);

        setTimeout(() => {
          window.location.reload();
        }, 1500);
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
                          Grid/list views, search filters, pagination settings
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
                          Your saved favorite characters & movies
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
                  </div>

                  {/* Clear Button */}
                  <button
                    className="settings-btn settings-btn--primary"
                    onClick={handleClearSelectedData}
                    disabled={
                      !clearOptions.cachedData &&
                      !clearOptions.preferences &&
                      !clearOptions.favorites &&
                      !clearOptions.disclaimer
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
                        onClick={() => changeTheme(theme.id)}
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
