import { motion } from "framer-motion";
import "./ViewModeToggle.scss";

export type ViewMode = "grid" | "list";

export interface ViewModeToggleProps {
  currentMode: ViewMode;
  onModeChange: (mode: ViewMode) => void;
}

export const ViewModeToggle = ({
  currentMode,
  onModeChange,
}: ViewModeToggleProps) => {
  return (
    <div className="view-mode-toggle">
      <button
        className={`view-mode-toggle__button ${
          currentMode === "grid" ? "view-mode-toggle__button--active" : ""
        }`}
        onClick={() => onModeChange("grid")}
        aria-label="Grid View"
        aria-pressed={currentMode === "grid"}
      >
        <svg
          className="view-mode-toggle__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
        </svg>
        <span className="view-mode-toggle__label">Grid View</span>
        {currentMode === "grid" && (
          <motion.div
            className="view-mode-toggle__indicator"
            layoutId="activeIndicator"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </button>

      <button
        className={`view-mode-toggle__button ${
          currentMode === "list" ? "view-mode-toggle__button--active" : ""
        }`}
        onClick={() => onModeChange("list")}
        aria-label="List View"
        aria-pressed={currentMode === "list"}
      >
        <svg
          className="view-mode-toggle__icon"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <line x1="8" y1="6" x2="21" y2="6" />
          <line x1="8" y1="12" x2="21" y2="12" />
          <line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" />
          <line x1="3" y1="12" x2="3.01" y2="12" />
          <line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
        <span className="view-mode-toggle__label">List View</span>
        {currentMode === "list" && (
          <motion.div
            className="view-mode-toggle__indicator"
            layoutId="activeIndicator"
            initial={false}
            transition={{
              type: "spring",
              stiffness: 500,
              damping: 30,
            }}
          />
        )}
      </button>
    </div>
  );
};
