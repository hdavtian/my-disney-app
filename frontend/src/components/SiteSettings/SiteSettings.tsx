import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CacheService } from "../../utils/cacheService";
import { clearPreferencesFromStorage } from "../../store/middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "../../store/slices/uiPreferencesSlice";
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
                <section className="settings-section">
                  <h3 className="settings-section__title">
                    <i className="fas fa-database"></i>
                    Cache Statistics
                  </h3>
                  <div className="cache-stats">
                    <div className="cache-stats__item">
                      <span className="cache-stats__label">Total Items</span>
                      <span className="cache-stats__value">
                        {cacheStats.totalItems}
                      </span>
                    </div>
                    <div className="cache-stats__item">
                      <span className="cache-stats__label">Total Size</span>
                      <span className="cache-stats__value">
                        {cacheStats.totalSize}
                      </span>
                    </div>
                  </div>

                  {cacheStats.items.length > 0 && (
                    <div className="cache-items">
                      <h4 className="cache-items__title">Cached Items</h4>
                      <ul className="cache-items__list">
                        {cacheStats.items.map((item, index) => (
                          <li key={index} className="cache-item">
                            <span className="cache-item__key">{item.key}</span>
                            <div className="cache-item__meta">
                              <span className="cache-item__size">
                                {item.size}
                              </span>
                              <span className="cache-item__expiry">
                                {item.expiresIn}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </section>

                {/* Info Section */}
                <section className="settings-section settings-section--info">
                  <h3 className="settings-section__title">
                    <i className="fas fa-info-circle"></i>
                    About Site Data
                  </h3>
                  <ul className="settings-info">
                    <li className="settings-info__item">
                      <i className="fas fa-check-circle"></i>
                      <span>
                        <strong>Cache:</strong> Stores API responses for 2 hours
                      </span>
                    </li>
                    <li className="settings-info__item">
                      <i className="fas fa-check-circle"></i>
                      <span>
                        <strong>Preferences:</strong> Saves your view settings
                      </span>
                    </li>
                    <li className="settings-info__item">
                      <i className="fas fa-check-circle"></i>
                      <span>
                        <strong>Auto-Clear:</strong> Cache expires automatically
                      </span>
                    </li>
                  </ul>
                </section>

                {/* Actions Section */}
                <section className="settings-section">
                  <h3 className="settings-section__title">
                    <i className="fas fa-sliders-h"></i>
                    Actions
                  </h3>

                  <div className="settings-actions">
                    <button
                      className="settings-btn settings-btn--warning"
                      onClick={handleClearCache}
                    >
                      <i className="fas fa-broom"></i>
                      <span>Clear Cache</span>
                    </button>

                    <button
                      className="settings-btn settings-btn--info"
                      onClick={handleResetPreferences}
                    >
                      <i className="fas fa-undo-alt"></i>
                      <span>Reset Preferences</span>
                    </button>

                    <button
                      className="settings-btn settings-btn--danger"
                      onClick={handleResetAll}
                    >
                      <i className="fas fa-exclamation-triangle"></i>
                      <span>Reset All Data</span>
                    </button>
                  </div>
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
