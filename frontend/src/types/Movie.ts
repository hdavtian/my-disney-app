export interface Movie {
  id: string;
  title: string;
  posterUrl: string;
  backdropUrl?: string;
  short_description?: string;
  long_description?: string;
  releaseYear: number;
  genre?: string[];
  director?: string;
  duration?: number;
  rating?: string;
  characters?: string[];
  isFavorite?: boolean;
  image_1?: string;
  image_2?: string;
}
