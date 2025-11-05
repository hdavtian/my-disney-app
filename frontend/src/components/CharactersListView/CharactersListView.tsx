import { useCallback } from "react";
import { useNavigate } from "react-router-dom";
import DataGrid, {
  Column,
  Export,
  Grouping,
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
import { Character } from "../../types/Character";
import "./CharactersListView.scss";

export interface CharactersListViewProps {
  characters: Character[];
  onCharacterClick?: (characterId: string) => void;
}

export const CharactersListView = ({
  characters,
  onCharacterClick,
}: CharactersListViewProps) => {
  const navigate = useNavigate();

  const handleViewClick = useCallback(
    (character: Character) => {
      if (onCharacterClick) {
        onCharacterClick(character.id);
      }
      navigate(`/character/${character.id}`);
    },
    [navigate, onCharacterClick]
  );

  const onExporting = useCallback((e: any) => {
    const workbook = new Workbook();
    const worksheet = workbook.addWorksheet("Disney Characters");

    exportDataGrid({
      component: e.component,
      worksheet,
      autoFilterEnabled: true,
    }).then(() => {
      workbook.xlsx.writeBuffer().then((buffer: any) => {
        saveAs(
          new Blob([buffer], { type: "application/octet-stream" }),
          "disney_characters.xlsx"
        );
      });
    });
  }, []);

  const renderNameCell = (cellData: any) => {
    const character = cellData.data as Character;
    return (
      <div className="characters-list-view__name-cell">
        {character.imageUrl && (
          <img
            src={character.imageUrl}
            alt={character.name}
            className="characters-list-view__character-thumbnail"
          />
        )}
        <div className="characters-list-view__name-text">
          <strong>{character.name}</strong>
        </div>
      </div>
    );
  };

  const renderDescriptionCell = (cellData: any) => {
    const description = cellData.value;
    return (
      <div
        className="characters-list-view__description-cell"
        title={description}
      >
        {description && description.length > 100
          ? `${description.substring(0, 100)}...`
          : description}
      </div>
    );
  };

  const renderFavoriteCell = (cellData: any) => {
    return (
      <div className="characters-list-view__favorite-cell">
        {cellData.value ? (
          <span className="characters-list-view__favorite-icon">⭐</span>
        ) : (
          <span className="characters-list-view__not-favorite-icon">☆</span>
        )}
      </div>
    );
  };

  const renderCategoryCell = (cellData: any) => {
    const category = cellData.value;
    const categoryClasses: Record<string, string> = {
      princess: "characters-list-view__category-princess",
      villain: "characters-list-view__category-villain",
      hero: "characters-list-view__category-hero",
      sidekick: "characters-list-view__category-sidekick",
      other: "characters-list-view__category-other",
    };

    return (
      <div
        className={`characters-list-view__category-cell ${
          categoryClasses[category] || ""
        }`}
      >
        {category.charAt(0).toUpperCase() + category.slice(1)}
      </div>
    );
  };

  const renderViewButton = (cellData: any) => {
    const character = cellData.data as Character;
    return (
      <div className="characters-list-view__view-cell">
        <button
          className="characters-list-view__view-button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            handleViewClick(character);
          }}
          type="button"
        >
          View
        </button>
      </div>
    );
  };

  return (
    <div className="characters-list-view">
      <DataGrid
        dataSource={characters}
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
        <FilterRow visible={true} />
        <SearchPanel
          visible={true}
          width={300}
          placeholder="Search characters..."
          highlightCaseSensitive={false}
        />
        <Paging enabled={true} pageSize={25} />
        <Pager
          showPageSizeSelector={true}
          allowedPageSizes={[10, 25, 50, 100]}
          showInfo={true}
          showNavigationButtons={true}
        />
        <Sorting mode="multiple" />
        <ColumnChooser enabled={true} mode="select" />
        <Selection mode="multiple" showCheckBoxesMode="always" />
        <Scrolling mode="standard" />
        <ColumnFixing enabled={true} />

        <Column
          dataField="name"
          caption="Character Name"
          width={200}
          fixed={true}
          fixedPosition="left"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          cellRender={renderNameCell}
        />

        <Column
          dataField="category"
          caption="Category"
          width={120}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
          cellRender={renderCategoryCell}
        />

        <Column
          dataField="franchise"
          caption="Franchise"
          width={150}
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="debut"
          caption="Debut"
          width={120}
          alignment="center"
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="first_appearance"
          caption="First Appearance"
          width={150}
          allowSorting={true}
          allowFiltering={true}
          allowGrouping={true}
        />

        <Column
          dataField="movies"
          caption="Movies"
          width={200}
          allowFiltering={true}
          calculateDisplayValue={(data: Character) =>
            data.movies
              ? data.movies.slice(0, 2).join(", ") +
                (data.movies.length > 2 ? "..." : "")
              : ""
          }
        />

        <Column
          dataField="short_description"
          caption="Description"
          width={300}
          allowFiltering={true}
          cellRender={renderDescriptionCell}
        />

        <Column
          dataField="tags"
          caption="Tags"
          width={180}
          allowFiltering={true}
          calculateDisplayValue={(data: Character) =>
            data.tags
              ? data.tags.slice(0, 3).join(", ") +
                (data.tags.length > 3 ? "..." : "")
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
