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
