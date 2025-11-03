import "./MoviesListView.scss";

export interface MoviesListViewProps {
  // Props will be defined when implementing DevExpress components
}

export const MoviesListView = (_props: MoviesListViewProps) => {
  return (
    <div className="movies-list-view">
      <div className="movies-list-view__placeholder">
        <div className="movies-list-view__icon">
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
          advanced filtering, sorting, and analysis.
        </p>
        <div className="movies-list-view__features">
          <div className="movies-list-view__feature">✓ Advanced filtering</div>
          <div className="movies-list-view__feature">✓ Column sorting</div>
          <div className="movies-list-view__feature">✓ Export to Excel</div>
          <div className="movies-list-view__feature">✓ Grouping options</div>
        </div>
      </div>
    </div>
  );
};
