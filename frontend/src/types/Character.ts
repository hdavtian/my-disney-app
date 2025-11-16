export interface Character {
  id: string;
  name: string;
  imageUrl?: string;
  thumbnailUrl?: string;
  profile_image1?: string;
  background_image1?: string;
  short_description?: string;
  long_description?: string;
  franchise?: string;
  movies?: string[];
  category: "princess" | "villain" | "hero" | "sidekick" | "other";
  debut?: string;
  first_appearance?: string;
  isFavorite?: boolean;
  tags?: string[];
}

/**
 * Summary DTO for character data in movie relationships.
 * Matches backend CharacterSummaryDto (which returns snake_case via @JsonProperty).
 */
export interface CharacterSummary {
  id: number;
  url_id: string;
  name: string;
  short_description?: string;
  category?: string;
  character_type?: string;
  species?: string;
  profile_image1?: string;
}
