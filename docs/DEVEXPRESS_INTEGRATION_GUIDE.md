# DevExpress DataGrid Integration Guide

## 📋 Overview

This guide provides instructions for implementing DevExpress DataGrid components in the List views for Movies and Characters pages.

---

## 🎯 Prerequisites

✅ DevExpress packages already installed:

- `devextreme@^24.1.7`
- `devextreme-react@^24.1.7`

---

## 🚀 Basic Implementation Steps

### 1. Import DevExpress Styles

Add to your main entry file (`main.tsx` or `App.tsx`):

```typescript
import "devextreme/dist/css/dx.common.css";
import "devextreme/dist/css/dx.light.css"; // or dx.dark.css for dark theme
```

### 2. MoviesListView Implementation Example

```typescript
import {
  DataGrid,
  Column,
  Paging,
  FilterRow,
  Sorting,
  Export,
} from "devextreme-react/data-grid";
import { Movie } from "../../types/Movie";
import "./MoviesListView.scss";

export interface MoviesListViewProps {
  movies: Movie[];
}

export const MoviesListView = ({ movies }: MoviesListViewProps) => {
  return (
    <div className="movies-list-view">
      <DataGrid
        dataSource={movies}
        keyExpr="id"
        showBorders={true}
        rowAlternationEnabled={true}
        hoverStateEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} />
        <Sorting mode="multiple" />
        <Paging defaultPageSize={20} />
        <Export enabled={true} fileName="disney-movies" />

        <Column dataField="title" caption="Title" width={250} />
        <Column dataField="releaseYear" caption="Year" width={100} />
        <Column dataField="director" caption="Director" width={200} />
        <Column dataField="genre" caption="Genres" cellRender={renderGenres} />
        <Column dataField="duration" caption="Duration (min)" width={120} />
        <Column dataField="rating" caption="Rating" width={100} />
      </DataGrid>
    </div>
  );
};

const renderGenres = (cellData: any) => {
  const genres = cellData.value || [];
  return (
    <div className="genre-tags">
      {genres.map((genre: string, index: number) => (
        <span key={index} className="genre-tag">
          {genre}
        </span>
      ))}
    </div>
  );
};
```

### 3. CharactersListView Implementation Example

```typescript
import {
  DataGrid,
  Column,
  Paging,
  FilterRow,
  Sorting,
  Export,
} from "devextreme-react/data-grid";
import { Character } from "../../types/Character";
import "./CharactersListView.scss";

export interface CharactersListViewProps {
  characters: Character[];
}

export const CharactersListView = ({ characters }: CharactersListViewProps) => {
  return (
    <div className="characters-list-view">
      <DataGrid
        dataSource={characters}
        keyExpr="id"
        showBorders={true}
        rowAlternationEnabled={true}
        hoverStateEnabled={true}
        allowColumnReordering={true}
        allowColumnResizing={true}
        columnAutoWidth={true}
      >
        <FilterRow visible={true} />
        <Sorting mode="multiple" />
        <Paging defaultPageSize={20} />
        <Export enabled={true} fileName="disney-characters" />

        <Column dataField="name" caption="Name" width={200} />
        <Column dataField="category" caption="Category" width={120} />
        <Column dataField="debut" caption="Debut" width={150} />
        <Column dataField="movies" caption="Movies" cellRender={renderMovies} />
        <Column
          dataField="imageUrl"
          caption="Image"
          width={100}
          cellRender={renderImage}
          allowFiltering={false}
          allowSorting={false}
        />
      </DataGrid>
    </div>
  );
};

const renderMovies = (cellData: any) => {
  const movies = cellData.value || [];
  return <span>{movies.join(", ")}</span>;
};

const renderImage = (cellData: any) => {
  const imageUrl =
    cellData.value || `https://picsum.photos/seed/${cellData.data.id}/50/50`;
  return (
    <img
      src={imageUrl}
      alt={cellData.data.name}
      style={{ width: 50, height: 50, borderRadius: "8px", objectFit: "cover" }}
    />
  );
};
```

---

## 🎨 Disney Theme Customization

### Custom SCSS for DataGrid

```scss
// In MoviesListView.scss or CharactersListView.scss

.movies-list-view,
.characters-list-view {
  padding: var(--space-6);

  // Override DevExpress default colors
  :global {
    .dx-datagrid {
      background: rgba(255, 255, 255, 0.05);
      border-radius: var(--radius-xl);
      overflow: hidden;

      // Header styling
      .dx-datagrid-headers {
        background: linear-gradient(
          135deg,
          var(--disney-blue) 0%,
          var(--disney-blue-light) 100%
        );
        color: var(--white);
        font-weight: var(--font-semibold);

        .dx-datagrid-text-content {
          color: var(--white);
        }
      }

      // Row styling
      .dx-row {
        background: rgba(255, 255, 255, 0.05);
        color: var(--white);

        &:hover {
          background: rgba(0, 107, 179, 0.2);
        }

        &.dx-row-alt {
          background: rgba(255, 255, 255, 0.08);
        }
      }

      // Borders
      .dx-datagrid-borders > .dx-datagrid-header-panel,
      .dx-datagrid-borders > .dx-datagrid-headers,
      .dx-datagrid-borders > .dx-datagrid-rowsview,
      .dx-datagrid-borders > .dx-datagrid-total-footer {
        border-color: rgba(255, 255, 255, 0.1);
      }

      // Pager
      .dx-pager {
        background: rgba(255, 255, 255, 0.05);
        border-color: rgba(255, 255, 255, 0.1);

        .dx-page-sizes,
        .dx-pages {
          color: var(--white);
        }

        .dx-selection {
          background: var(--disney-blue);
          color: var(--white);
          border-radius: var(--radius);
        }
      }

      // Filter row
      .dx-datagrid-filter-row {
        background: rgba(255, 255, 255, 0.1);

        input {
          background: rgba(255, 255, 255, 0.1);
          color: var(--white);
          border-color: rgba(255, 255, 255, 0.2);

          &::placeholder {
            color: var(--gray-400);
          }

          &:focus {
            background: rgba(255, 255, 255, 0.15);
            border-color: var(--disney-blue);
          }
        }
      }
    }
  }

  // Custom genre/tag styling
  .genre-tags {
    display: flex;
    flex-wrap: wrap;
    gap: var(--space-2);
  }

  .genre-tag {
    display: inline-block;
    padding: var(--space-1) var(--space-2);
    background: var(--disney-blue);
    color: var(--white);
    border-radius: var(--radius);
    font-size: var(--text-xs);
    font-weight: var(--font-medium);
  }
}
```

---

## 🔧 Advanced Features

### 1. Grouping

```typescript
import { Grouping, GroupPanel } from 'devextreme-react/data-grid';

<DataGrid ...>
  <GroupPanel visible={true} />
  <Grouping autoExpandAll={false} />

  <Column dataField="category" groupIndex={0} />
  {/* other columns */}
</DataGrid>
```

### 2. Selection

```typescript
import { Selection } from 'devextreme-react/data-grid';

<DataGrid ...>
  <Selection mode="multiple" showCheckBoxesMode="always" />
</DataGrid>
```

### 3. Master-Detail

```typescript
import { MasterDetail } from 'devextreme-react/data-grid';

const renderDetail = (data: any) => {
  return (
    <div className="master-detail">
      <p>{data.data.description}</p>
    </div>
  );
};

<DataGrid ...>
  <MasterDetail enabled={true} render={renderDetail} />
</DataGrid>
```

### 4. Custom Cell Templates

```typescript
const renderCustomCell = (cellData: any) => {
  return (
    <div className="custom-cell">
      <span className="icon">⭐</span>
      {cellData.value}
    </div>
  );
};

<Column dataField="rating" cellRender={renderCustomCell} />;
```

---

## 📊 Performance Tips

1. **Virtual Scrolling** for large datasets:

```typescript
import { Scrolling } from 'devextreme-react/data-grid';

<DataGrid ...>
  <Scrolling mode="virtual" />
</DataGrid>
```

2. **Remote Operations** if using API:

```typescript
<DataGrid
  remoteOperations={true}
  // Will send filtering, sorting, paging params to API
/>
```

3. **Column Virtualization**:

```typescript
<DataGrid columnRenderingMode="virtual" />
```

---

## 🎯 Integration Checklist

- [ ] Import DevExpress CSS in main entry file
- [ ] Update MoviesListView component with DataGrid
- [ ] Update CharactersListView component with DataGrid
- [ ] Apply Disney theme customization
- [ ] Test filtering functionality
- [ ] Test sorting functionality
- [ ] Test export to Excel
- [ ] Test responsive behavior
- [ ] Add custom cell renderers where needed
- [ ] Optimize performance for large datasets

---

## 📚 Resources

- [DevExpress DataGrid Documentation](https://js.devexpress.com/React/Documentation/Guide/UI_Components/DataGrid/Getting_Started_with_DataGrid/)
- [DevExpress React Demos](https://js.devexpress.com/Demos/WidgetsGallery/Demo/DataGrid/Overview/React/Light/)
- [DevExpress Themes](https://js.devexpress.com/Documentation/Guide/Themes_and_Styles/Predefined_Themes/)

---

**Status**: Ready for Implementation  
**Priority**: Medium (Grid view is functional, List view is enhancement)
