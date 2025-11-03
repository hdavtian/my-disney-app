import "./CharactersListView.scss";

export interface CharactersListViewProps {
  // Props will be defined when implementing DevExpress components
}

export const CharactersListView = (_props: CharactersListViewProps) => {
  return (
    <div className="characters-list-view">
      <div className="characters-list-view__placeholder">
        <div className="characters-list-view__icon">
          <svg
            width="80"
            height="80"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
          >
            <line x1="8" y1="6" x2="21" y2="6" />
            <line x1="8" y1="12" x2="21" y2="12" />
            <line x1="8" y1="18" x2="21" y2="18" />
            <line x1="3" y1="6" x2="3.01" y2="6" />
            <line x1="3" y1="12" x2="3.01" y2="12" />
            <line x1="3" y1="18" x2="3.01" y2="18" />
          </svg>
        </div>
        <h2>List View Coming Soon</h2>
        <p>
          We're building a powerful data grid using DevExpress components for
          advanced filtering, sorting, and character analysis.
        </p>
        <div className="characters-list-view__features">
          <div className="characters-list-view__feature">
            ✓ Category filtering
          </div>
          <div className="characters-list-view__feature">✓ Column sorting</div>
          <div className="characters-list-view__feature">✓ Export to Excel</div>
          <div className="characters-list-view__feature">
            ✓ Movie associations
          </div>
        </div>
      </div>
    </div>
  );
};
