import { motion, AnimatePresence } from "framer-motion";
import "./RecentlyViewed.scss";

export interface RecentlyViewedItem {
  id: string;
  name: string;
  timestamp: number;
}

export interface RecentlyViewedProps {
  items: RecentlyViewedItem[];
  title?: string;
  maxItems?: number;
  onItemClick?: (id: string) => void;
  onClear?: () => void;
}

export const RecentlyViewed = ({
  items,
  title = "Recently Viewed",
  maxItems = 10,
  onItemClick,
  onClear,
}: RecentlyViewedProps) => {
  if (items.length === 0) {
    return null;
  }

  const displayItems = items.slice(0, maxItems);

  return (
    <motion.div
      className="recently-viewed"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="recently-viewed__header">
        <h3 className="recently-viewed__title">{title}</h3>
        {onClear && items.length > 0 && (
          <button
            className="recently-viewed__clear"
            onClick={onClear}
            aria-label="Clear recently viewed"
            title="Clear all"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 6L6 18M6 6l12 12"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </button>
        )}
      </div>

      <div className="recently-viewed__list">
        <AnimatePresence initial={false}>
          {displayItems.map((item, index) => (
            <motion.div
              key={item.id}
              className="recently-viewed__item"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, delay: index * 0.03 }}
              onClick={() => onItemClick?.(item.id)}
            >
              <span className="recently-viewed__bullet">•</span>
              <span className="recently-viewed__name">{item.name}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {items.length > maxItems && (
        <div className="recently-viewed__footer">
          +{items.length - maxItems} more
        </div>
      )}
    </motion.div>
  );
};
