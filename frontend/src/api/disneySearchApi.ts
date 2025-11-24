import {
  MatchMode,
  SearchCapabilitiesResponse,
  SearchCategoryKey,
  SearchResultsResponse,
  SearchScopeKey,
} from "../types/DisneySearch";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:8080";

export interface DisneySearchRequest {
  query: string;
  categories: SearchCategoryKey[];
  scopes: Record<SearchCategoryKey, SearchScopeKey>;
  matchMode?: MatchMode;
  limit?: number;
}

const buildSearchUrl = ({
  query,
  categories,
  scopes,
  matchMode,
  limit,
}: DisneySearchRequest): string => {
  const params = new URLSearchParams();
  params.append("query", query);

  if (categories.length > 0) {
    params.append("categories", categories.join(","));
  }

  if (matchMode) {
    params.append("matchMode", matchMode);
  }

  if (typeof limit === "number") {
    params.append("limit", String(limit));
  }

  Object.entries(scopes).forEach(([category, scope]) => {
    if (scope) {
      params.append(`scope[${category}]`, scope);
    }
  });

  return `${API_BASE_URL}/api/search?${params.toString()}`;
};

export const fetchSearchCapabilities =
  async (): Promise<SearchCapabilitiesResponse> => {
    const response = await fetch(`${API_BASE_URL}/api/search/capabilities`);
    if (!response.ok) {
      throw new Error("Unable to load search capabilities");
    }
    return response.json();
  };

export const fetchSearchResults = async (
  request: DisneySearchRequest
): Promise<SearchResultsResponse> => {
  const response = await fetch(buildSearchUrl(request));
  if (!response.ok) {
    throw new Error("Unable to complete Disney Search request");
  }
  return response.json();
};
