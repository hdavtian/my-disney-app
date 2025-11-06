import { useCallback } from "react";
import DataGrid, {
  Column,
  Export,
  Grouping,
  GroupPanel,
  FilterRow,
  SearchPanel,
  Paging,
  Pager,
  Sorting,
  ColumnChooser,
  Selection,
  Scrolling,
  ColumnFixing,
} from "devextreme-react/data-grid";
import { Workbook } from "exceljs";
import { saveAs } from "file-saver";
import { exportDataGrid } from "devextreme/excel_exporter";
import { Movie } from "../../types/Movie";
import "./MoviesListView.scss";

export interface MoviesListViewProps {
  movies: Movie[];
  onMovieClick?: (movieId: string) => void;
}

export const MoviesListView = ({
  movies,
  onMovieClick,
}: MoviesListViewProps) => {
  const handleViewClick = useCallback(
    (movie: Movie) => {
      if (onMovieClick) {
        onMovieClick(movie.id);
      }
    },
    [onMovieClick]
  );

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Disney Movies");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "disney_movies.xlsx"
        );
      });
    });
  }, []);

  const renderTitleCell = (cellData: any) => {
    const movie = cellData.data as Movie;
    return (
      <div className="movies-list-view__title-cell">
        {movie.posterUrl && (
          <img
            src={movie.posterUrl}
            alt={movie.title}
            className="movies-list-view__poster-thumbnail"
            loading="lazy"
          />
        )}
        <div className="movies-list-view__title-text">
          <strong>{movie.title}</strong>
        </div>
      </div>
    );
  };

  const renderDescriptionCell = (cellData: any) => {
    const description = cellData.value;
    return (
      <div className="movies-list-view__description-cell" title={description}>
        {description && description.length > 100
          ? `${description.substring(0, 100)}...`
          : description}
      </div>
    );
  };

  const renderFavoriteCell = (cellData: any) => {
    return (
      <div className="movies-list-view__favorite-cell">
        {cellData.value ? (
          <span className="movies-list-view__favorite-icon">⭐</span>
        ) : (
          <span className="movies-list-view__not-favorite-icon">☆</span>
        )}
      </div>
    );
  };

  const renderViewButton = (cellData: any) => {
    const movie = cellData.data as Movie;
    return (
      <div className="movies-list-view__view-cell">
        <button
          className="movies-list-view__view-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleViewClick(movie);
          }}
          type="button"
        >
          View
        </button>
      </div>
    );
  };

  return (
    <div className="movies-list-view">
      <DataGrid
        dataSource={movies}
        keyExpr="id"
        onExporting={onExporting}
        showBorders={true}
        showRowLines={true}
        showColumnLines={true}
        rowAlternationEnabled={true}
        columnAutoWidth={false}
        wordWrapEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnResizingMode="nextColumn"
        hoverStateEnabled={true}
      >
        <Export enabled={true} allowExportSelectedData={true} />
        <Grouping
          autoExpandAll={false}
          allowCollapsing={true}
          contextMenuEnabled={true}
          expandMode="buttonClick"
        />
        <GroupPanel
          visible={true}
          emptyPanelText="Drag a column header here to group by that column"
        />
        <FilterRow visible={true} />
        <SearchPanel
          visible={true}
          width={300}
          placeholder="Search movies..."
          highlightCaseSensitive={false}
        />
        <Paging enabled={true} pageSize={20} />
        <Pager
          showPageSizeSelector={true}
          allowedPageSizes={[10, 20, 50, 100]}
          showInfo={true}
          showNavigationButtons={true}
        />
        <Sorting mode="multiple" />
        <ColumnChooser enabled={true} mode="select" />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <Scrolling mode="standard" />
        <ColumnFixing enabled={true} />

        <Column
          dataField="title"
          caption="Movie Title"
          width={250}
          fixed={true}
          fixedPosition="left"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          cellRender={renderTitleCell}
        />

        <Column
          dataField="releaseYear"
          caption="Release Year"
          width={120}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="genre"
          caption="Genre"
          width={150}
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          calculateDisplayValue={(data: Movie) =>
            data.genre ? data.genre.join(", ") : ""
          }
        />

        <Column
          dataField="director"
          caption="Director"
          width={180}
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="duration"
          caption="Duration (min)"
          width={130}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          dataType="number"
        />

        <Column
          dataField="rating"
          caption="Rating"
          width={100}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="short_description"
          caption="Description"
          width={300}
          allowFiltering={true}
          cellRender={renderDescriptionCell}
        />

        <Column
          dataField="characters"
          caption="Main Characters"
          width={200}
          allowFiltering={true}
          calculateDisplayValue={(data: Movie) =>
            data.characters
              ? data.characters.slice(0, 3).join(", ") +
                (data.characters.length > 3 ? "..." : "")
              : ""
          }
        />

        <Column
          dataField="isFavorite"
          caption="Favorite"
          width={100}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          dataType="boolean"
          cellRender={renderFavoriteCell}
        />

        <Column
          caption="Actions"
          width={100}
          alignment="center"
          allowSorting={false}
          allowFiltering={false}
          allowGrouping={false}
          allowReordering={false}
          allowResizing={false}
          cellRender={renderViewButton}
        />
      </DataGrid>
    </div>
  );
};
