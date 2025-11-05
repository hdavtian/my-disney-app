import { Character } from "../types/Character";

// Column configuration for Characters DataGrid
export const charactersColumns = [
  {
    dataField: "name",
    caption: "Character Name",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 200,
    fixed: true,
    fixedPosition: "left",
    cellTemplate: "nameTemplate",
  },
  {
    dataField: "category",
    caption: "Category",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 120,
    alignment: "center",
    lookup: {
      dataSource: [
        { value: "princess", text: "Princess" },
        { value: "villain", text: "Villain" },
        { value: "hero", text: "Hero" },
        { value: "sidekick", text: "Sidekick" },
        { value: "other", text: "Other" },
      ],
      valueExpr: "value",
      displayExpr: "text",
    },
  },
  {
    dataField: "franchise",
    caption: "Franchise",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 150,
  },
  {
    dataField: "debut",
    caption: "Debut",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 120,
    alignment: "center",
  },
  {
    dataField: "first_appearance",
    caption: "First Appearance",
    dataType: "string",
    allowSorting: true,
    allowFiltering: true,
    allowGrouping: true,
    allowReordering: true,
    width: 150,
  },
  {
    dataField: "movies",
    caption: "Movies",
    dataType: "string",
    allowSorting: false,
    allowFiltering: true,
    allowGrouping: false,
    allowReordering: true,
    width: 200,
    calculateDisplayValue: (data: Character) => {
      return data.movies
        ? data.movies.slice(0, 2).join(", ") +
            (data.movies.length > 2 ? "..." : "")
        : "";
    },
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
    dataField: "tags",
    caption: "Tags",
    dataType: "string",
    allowSorting: false,
    allowFiltering: true,
    allowGrouping: false,
    allowReordering: true,
    width: 180,
    calculateDisplayValue: (data: Character) => {
      return data.tags
        ? data.tags.slice(0, 3).join(", ") + (data.tags.length > 3 ? "..." : "")
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
export const charactersExportConfig = {
  enabled: true,
  allowExportSelectedData: true,
  formats: ["xlsx", "csv"],
  fileName: "disney_characters",
};

// Grouping configuration
export const charactersGroupingConfig = {
  autoExpandAll: false,
  allowCollapsing: true,
  contextMenuEnabled: true,
  expandMode: "buttonClick",
};

// Filtering configuration
export const charactersFilteringConfig = {
  enabled: true,
  mode: "row",
};

// Search panel configuration
export const charactersSearchConfig = {
  visible: true,
  width: 300,
  placeholder: "Search characters...",
  highlightCaseSensitive: false,
};

// Paging configuration
export const charactersPagingConfig = {
  enabled: true,
  pageSize: 25,
  pageSizes: [10, 25, 50, 100],
  showPageSizeSelector: true,
  showInfo: true,
  showNavigationButtons: true,
};

// Sorting configuration
export const charactersSortingConfig = {
  mode: "multiple",
};

// Column chooser configuration
export const charactersColumnChooserConfig = {
  enabled: true,
  mode: "select",
};

// Main DataGrid configuration
export const charactersDataGridConfig = {
  columns: charactersColumns,
  export: charactersExportConfig,
  grouping: charactersGroupingConfig,
  filterRow: charactersFilteringConfig,
  searchPanel: charactersSearchConfig,
  paging: charactersPagingConfig,
  sorting: charactersSortingConfig,
  columnChooser: charactersColumnChooserConfig,
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
