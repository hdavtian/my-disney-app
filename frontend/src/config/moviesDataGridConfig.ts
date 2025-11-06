import { Movie } from "../types/Movie";

// Column configuration for Movies DataGrid
export const moviesColumns = [
  {
    dataField: "title",
    caption: "Movie Title",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 250,
    fixed: true,
    fixedPosition: "left",
    cellTemplate: "titleTemplate",
  },
  {
    dataField: "releaseYear",
    caption: "Release Year",
    dataType: "number",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 120,
    alignment: "center",
  },
  {
    dataField: "genre",
    caption: "Genre",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 150,
    calculateDisplayValue: (data: Movie) => {
      return data.genre ? data.genre.join(", ") : "";
    },
  },
  {
    dataField: "director",
    caption: "Director",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 180,
  },
  {
    dataField: "duration",
    caption: "Duration (min)",
    dataType: "number",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: false,
    allowReordering: true,
    width: 130,
    alignment: "center",
    format: {
      type: "fixedPoint",
      precision: 0,
    },
  },
  {
    dataField: "rating",
    caption: "Rating",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 100,
    alignment: "center",
  },
  {
    dataField: "short_description",
    caption: "Description",
    dataType: "string",
    allowSorting: false,
    allowFiltering: true,
    allowGrouping: false,
    allowReordering: true,
    width: 300,
    cellTemplate: "descriptionTemplate",
  },
  {
    dataField: "characters",
    caption: "Main Characters",
    dataType: "string",
    allowSorting: false,
    allowFiltering: true,
    allowGrouping: false,
    allowReordering: true,
    width: 200,
    calculateDisplayValue: (data: Movie) => {
      return data.characters
        ? data.characters.slice(0, 3).join(", ") +
            (data.characters.length > 3 ? "..." : "")
        : "";
    },
  },
  {
    dataField: "isFavorite",
    caption: "Favorite",
    dataType: "boolean",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 100,
    alignment: "center",
    cellTemplate: "favoriteTemplate",
  },
];

// Export configuration
export const moviesExportConfig = {
  enabled: true,
  allowExportSelectedData: true,
  formats: ["xlsx", "csv"],
  fileName: "disney_movies",
};

// Grouping configuration
export const moviesGroupingConfig = {
  autoExpandAll: false,
  allowCollapsing: true,
  contextMenuEnabled: true,
  expandMode: "buttonClick",
};

// Filtering configuration
export const moviesFilteringConfig = {
  enabled: true,
  mode: "row",
};

// Search panel configuration
export const moviesSearchConfig = {
  visible: true,
  width: 300,
  placeholder: "Search movies...",
  highlightCaseSensitive: false,
};

// Paging configuration
export const moviesPagingConfig = {
  enabled: true,
  pageSize: 20,
  pageSizes: [10, 20, 50, 100],
  showPageSizeSelector: true,
  showInfo: true,
  showNavigationButtons: true,
};

// Sorting configuration
export const moviesSortingConfig = {
  mode: "multiple",
};

// Column chooser configuration
export const moviesColumnChooserConfig = {
  enabled: true,
  mode: "select",
};

// Main DataGrid configuration
export const moviesDataGridConfig = {
  columns: moviesColumns,
  export: moviesExportConfig,
  grouping: moviesGroupingConfig,
  filterRow: moviesFilteringConfig,
  searchPanel: moviesSearchConfig,
  paging: moviesPagingConfig,
  sorting: moviesSortingConfig,
  columnChooser: moviesColumnChooserConfig,
  showBorders: true,
  showRowLines: true,
  showColumnLines: true,
  rowAlternationEnabled: true,
  columnAutoWidth: false,
  wordWrapEnabled: true,
  allowColumnReordering: true,
  allowColumnResizing: true,
  columnResizingMode: "nextColumn",
  hoverStateEnabled: true,
  selection: {
    mode: "multiple",
    showCheckBoxesMode: "always",
  },
  scrolling: {
    mode: "standard",
  },
  columnFixing: {
    enabled: true,
  },
};
