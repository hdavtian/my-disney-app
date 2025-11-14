import { useState } from "react";
import { NavLink } from "react-router-dom";
import { motion } from "framer-motion";
import { useFavorites } from "../../hooks/useFavorites";
import { SiteSettings } from "../SiteSettings";

export const Navigation = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const { favorites } = useFavorites();

  const navItems = [
    { path: "/movies", label: "Movies" },
    { path: "/characters", label: "Characters" },
    { path: "/favorites", label: "Favorites" },
    { path: "/behind-the-magic", label: "Behind the Magic" },
  ];

  return (
    <nav className="navigation" role="navigation" aria-label="Main navigation">
      <div className="navigation__container">
        {/* Logo */}
        <NavLink
          to="/"
          className="navigation__logo"
          aria-label="Disney App Home"
        >
          <motion.div
            className="navigation__logo-text"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Disney App
          </motion.div>
        </NavLink>

        {/* Desktop Navigation */}
        <div className="navigation__desktop">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navigation__link ${isActive ? "navigation__link--active" : ""}`
              }
            >
              <motion.span
                whileHover={{ y: -2 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                {item.label}
                {item.path === "/favorites" && favorites.length > 0 && (
                  <span className="navigation__favorites-chip">
                    {favorites.length}
                  </span>
                )}
              </motion.span>
            </NavLink>
          ))}

          {/* Settings Button */}
          <button
            className="navigation__settings-btn"
            onClick={() => setShowSettings(true)}
            aria-label="Open site settings"
            title="Site Settings"
          >
            <i className="fas fa-cog"></i>
          </button>
        </div>

        {/* Mobile Menu Button */}
        <button
          className="navigation__mobile-toggle"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
          aria-label="Toggle navigation menu"
        >
          <span className="navigation__hamburger">
            <span></span>
            <span></span>
            <span></span>
          </span>
        </button>
      </div>

      {/* Mobile Menu */}
      <motion.div
        id="mobile-menu"
        className="navigation__mobile"
        initial={false}
        animate={{ height: isMenuOpen ? "auto" : 0 }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        <div className="navigation__mobile-content">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) =>
                `navigation__mobile-link ${
                  isActive ? "navigation__mobile-link--active" : ""
                }`
              }
              onClick={() => setIsMenuOpen(false)}
            >
              {item.label}
              {item.path === "/favorites" && favorites.length > 0 && (
                <span className="navigation__favorites-chip">
                  {favorites.length}
                </span>
              )}
            </NavLink>
          ))}

          {/* Mobile Settings Button */}
          <button
            className="navigation__mobile-settings-btn"
            onClick={() => {
              setShowSettings(true);
              setIsMenuOpen(false);
            }}
          >
            <i className="fas fa-cog me-2"></i>
            Settings
          </button>
        </div>
      </motion.div>

      {/* Site Settings Modal */}
      <SiteSettings show={showSettings} onHide={() => setShowSettings(false)} />
    </nav>
  );
};
