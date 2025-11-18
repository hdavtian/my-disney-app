import { FC } from "react";
import { useFavorites, FavoriteType } from "../../hooks/useFavorites";
import "./FavoriteButton.scss";

interface FavoriteButtonProps {
  id: string | number;
  type: FavoriteType;
  size?: number;
  ariaLabel?: string;
}

export const FavoriteButton: FC<FavoriteButtonProps> = ({
  id,
  type,
  size = 24,
  ariaLabel,
}) => {
  const { isFavorite, add, remove } = useFavorites();
  const selected = isFavorite(id, type);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (selected) {
      remove(id, type);
    } else {
      add(id, type);
    }
  };

  return (
    <button
      className={`favorite-btn${selected ? " favorite-btn--selected" : ""}`}
      aria-label={
        ariaLabel || (selected ? "Remove from favorites" : "Add to favorites")
      }
      onClick={handleClick}
      type="button"
    >
      {/* Modern Heart Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill={selected ? "var(--accent-primary)" : "none"}
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="favorite-btn__icon"
        style={{
          filter: "drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8))",
        }}
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
    </button>
  );
};
