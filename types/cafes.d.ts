import { PointTargetFeature } from ".";

// Normalized Cafe type: properties are present; use `null` to represent missing values.
export type Cafe = {
  uuid: string;
  mapbox_id: string;

  // Key descriptive fields
  name: string | null;
  full_address: string | null;
  latitude: number | null;
  longitude: number | null;

  // Mapbox cache (JSONB) - required
  mapbox_data: PointTargetFeature;

  // Custom / curated fields
  description: string | null;
  website_url: string | null;
  instagram_url: string | null;
  hero_image_url: string | null;
  // Store gallery as an array of image URLs. Use `null` when absent.
  gallery_images: string[] | null;
  approved: boolean | null;

  // Metadata
  created_at: string | null;
  updated_at: string | null;
};

export type CafeHybrid = {
  byId: Record<string, Cafe>;
  array: Cafe[];
};