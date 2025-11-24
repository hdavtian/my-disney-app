export type SearchCategoryKey = "movies" | "characters" | "parks";
export type SearchScopeKey = "basic" | "extended" | string;
export type SearchResultType = "movie" | "character" | "park";

export interface HighlightRange {
  start: number;
  end: number;
}

export interface FieldHighlight {
  text: string;
  ranges: HighlightRange[];
}

export interface DisneySearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  imageUrl?: string | null;
  detailPath?: string | null;
  highlights?: Record<string, FieldHighlight>;
  [key: string]: unknown;
}

export interface SearchCategoryResult {
  total: number;
  results: DisneySearchResult[];
}

export type SearchResultsResponse = Record<string, SearchCategoryResult>;

export interface SearchCapabilitiesResponse {
  version: number;
  categories: Record<
    string,
    {
      label: string;
      scopes: Record<string, { label: string; fields: string[] }>;
    }
  >;
}

export interface SearchHistoryEntry {
  query: string;
  categories: SearchCategoryKey[];
  scopes: Record<SearchCategoryKey, SearchScopeKey>;
  timestamp: number;
}
