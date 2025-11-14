import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { CacheService } from "../../utils/cacheService";
import { clearPreferencesFromStorage } from "../../store/middleware/localStorageSyncMiddleware";
import { rehydratePreferences } from "../../store/slices/uiPreferencesSlice";
import "./SiteSettings.scss";

interface SiteSettingsProps {
  show: boolean;
  onHide: () => void;
}

export const SiteSettings: React.FC<SiteSettingsProps> = ({ show, onHide }) => {
  const dispatch = useDispatch();
  const [cacheStats, setCacheStats] = useState(CacheService.getStats());

  // Refresh cache stats when modal opens
  useEffect(() => {
    if (show) {
      setCacheStats(CacheService.getStats());
    }
  }, [show]);

  const refreshCacheStats = () => {
    setCacheStats(CacheService.getStats());
  };

  const handleClearCache = () => {
    if (
      window.confirm(
        "Are you sure you want to clear all cached data? This will cause the app to re-fetch data from the server."
      )
    ) {
      CacheService.clear();
      refreshCacheStats();
      alert("Cache cleared successfully!");
    }
  };

  const handleResetPreferences = () => {
    if (
      window.confirm(
        "Are you sure you want to reset all preferences to defaults? This will reset view modes, pagination, and search history."
      )
    ) {
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
      alert("Preferences reset successfully!");
    }
  };

  const handleResetAll = () => {
    if (
      window.confirm(
        "⚠️ This will clear ALL site data including cache, preferences, and cookies. Are you sure?"
      )
    ) {
      // Clear cache
      CacheService.clear();

      // Clear preferences
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
      alert("All site data reset successfully! Page will reload.");

      // Reload page to ensure clean state
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  if (!show) return null;

  return (
    <>
      {/* Modal Backdrop */}
      <div
        className="modal-backdrop fade show"
        onClick={onHide}
        style={{ zIndex: 1040 }}
      ></div>

      {/* Modal Dialog */}
      <div
        className="modal fade show"
        style={{ display: "block", zIndex: 1050 }}
        tabIndex={-1}
        onClick={onHide}
      >
        <div
          className="modal-dialog modal-dialog-centered modal-lg site-settings-modal"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                <i className="bi bi-gear-fill me-2"></i>
                Site Settings
              </h5>
              <button
                type="button"
                className="btn-close"
                onClick={onHide}
                aria-label="Close"
              ></button>
            </div>

            <div className="modal-body">
              {/* Cache Statistics Section */}
              <section className="settings-section">
                <h5 className="section-title">
                  <i className="bi bi-database-fill me-2"></i>
                  Cache Statistics
                </h5>
                <div className="cache-stats">
                  <div className="stat-item">
                    <span className="stat-label">Total Items:</span>
                    <span className="stat-value">{cacheStats.totalItems}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">Total Size:</span>
                    <span className="stat-value">{cacheStats.totalSize}</span>
                  </div>
                </div>

                {cacheStats.items.length > 0 && (
                  <div className="cache-items">
                    <h6 className="subsection-title">Cached Items:</h6>
                    <ul className="cache-list">
                      {cacheStats.items.map((item, index) => (
                        <li key={index} className="cache-item">
                          <span className="cache-key">{item.key}</span>
                          <span className="cache-size">{item.size}</span>
                          <span className="cache-expiry">
                            Expires in {item.expiresIn}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </section>

              {/* Actions Section */}
              <section className="settings-section">
                <h5 className="section-title">
                  <i className="bi bi-sliders me-2"></i>
                  Actions
                </h5>

                <div className="settings-actions">
                  <button
                    className="btn btn-outline-warning w-100 mb-3"
                    onClick={handleClearCache}
                  >
                    <i className="bi bi-trash me-2"></i>
                    Clear Cache
                    <small className="d-block text-muted mt-1">
                      Remove all cached API responses (preserves preferences)
                    </small>
                  </button>

                  <button
                    className="btn btn-outline-info w-100 mb-3"
                    onClick={handleResetPreferences}
                  >
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    Reset Preferences
                    <small className="d-block text-muted mt-1">
                      Reset view modes, pagination, and search history
                      (preserves cache)
                    </small>
                  </button>

                  <button
                    className="btn btn-outline-danger w-100"
                    onClick={handleResetAll}
                  >
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Reset All Site Data
                    <small className="d-block text-muted mt-1">
                      ⚠️ Clear everything and reload page
                    </small>
                  </button>
                </div>
              </section>

              {/* Info Section */}
              <section className="settings-section settings-info">
                <h6 className="section-title">
                  <i className="bi bi-info-circle me-2"></i>
                  About Site Data
                </h6>
                <ul className="info-list">
                  <li>
                    <strong>Cache:</strong> Stores API responses for 2 hours to
                    improve performance
                  </li>
                  <li>
                    <strong>Preferences:</strong> Saves your view modes,
                    pagination state, and search queries
                  </li>
                  <li>
                    <strong>Auto-Clear:</strong> Cache expires automatically
                    after 2 hours
                  </li>
                </ul>
              </section>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={onHide}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default SiteSettings;
