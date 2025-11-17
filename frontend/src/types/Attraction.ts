/**
 * Disney Park Attraction Type Definition
 * Matches backend API structure from DisneyParkAttraction.java entity
 * Backend returns snake_case field names
 */
export interface Attraction {
  id: number;
  url_id: string;
  name: string;
  park_url_id: string;
  land_area?: string;
  attraction_type?: string;
  opening_date?: number[]; // [year, month, day]
  thrill_level?: string;
  theme?: string;
  short_description?: string;
  is_operational?: boolean;
  duration_minutes?: number;
  height_requirement_inches?: number;
  image_1?: string;
  image_2?: string;
  image_3?: string;
  image_4?: string;
  image_5?: string;
  created_at?: number[]; // timestamp array
  updated_at?: number[]; // timestamp array
}
