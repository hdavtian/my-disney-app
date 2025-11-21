export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  short_description?: string;
  long_description?: string;
  creation_year?: number;
  releaseYear?: number; // Deprecated - use creation_year
  genre?: string[];
  director?: string;
  duration?: number;
  rating?: string;
  characters?: string[];
  isFavorite?: boolean;
  image_1?: string;
  image_2?: string;
}

/**
 * Summary DTO for movie data in character relationships.
 * Matches backend MovieSummaryDto (returns snake_case via global Jackson config).
 */
export interface MovieSummary {
  id: number;
  url_id: string;
  title: string;
  short_description?: string;
  creation_year?: number;
  movie_rating?: string;
  image_1?: string;
}
