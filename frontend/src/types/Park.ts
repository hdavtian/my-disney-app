/**
 * Disney Park Type Definition
 * Matches backend API structure from DisneyPark.java entity
 * Backend returns snake_case field names
 */
export interface Park {
  id: number;
  url_id: string;
  name: string;
  resort?: string;
  city?: string;
  state_region?: string;
  country: string;
  opening_date?: number[]; // [year, month, day]
  park_type?: string;
  is_castle_park?: boolean;
  area_acres?: number;
  theme?: string;
  short_description?: string;
  long_description?: string;
  official_website?: string;
  image_1?: string;
  created_at?: number[]; // timestamp array
  updated_at?: number[]; // timestamp array
}
