export type SupabaseCafe = {
  id: string;           // internal UUID
  mapbox_id: string;    // reference to Mapbox POI
  created_at?: string;  // optional timestamp
};

export type Cafe = {
  id: string;             // same as Supabase id
  mapbox_id: string;
  name: string;           // from Mapbox
  address?: string;       // optional from Mapbox
  latitude: number;       // from Mapbox.geometry.coordinates
  longitude: number;      // from Mapbox.geometry.coordinates
};

export type CafeHybrid = {
  byId: Record<string, Cafe>;
  array: Cafe[];
};