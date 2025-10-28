import { PointTargetFeature } from "@/types";
/**
 * Mapbox helpers usable on server and client.
 * fetchPoi accepts an optional token; when called in the browser it will
 * fall back to `process.env.NEXT_PUBLIC_MAPBOX_TOKEN` (public token).
 */
export function generateSessionToken(): string {
  try {
    // @ts-ignore
    if (typeof globalThis !== 'undefined' && (globalThis as any).crypto && typeof (globalThis as any).crypto.randomUUID === 'function') {
      return (globalThis as any).crypto.randomUUID();
    }
  } catch (e) {}
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// A TargetFeature whose geometry is guaranteed to be a Point with [lng, lat]

export async function fetchPoi(
  mapboxId: string,
  sessionToken?: string
): Promise<PointTargetFeature | null> {
  try {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!token) {
      console.error("fetchPoi: no Mapbox token available for this runtime");
      return null;
    }

    const st = sessionToken || generateSessionToken();
    const url = `https://api.mapbox.com/search/searchbox/v1/retrieve/${encodeURIComponent(
      mapboxId
    )}?access_token=${encodeURIComponent(token)}&session_token=${encodeURIComponent(st)}`;

    const res = await fetch(url);
    if (!res.ok) {
      console.error(`Mapbox retrieve failed for ${mapboxId}: ${res.status} ${res.statusText}`);
      return null;
    }

    const data = await res.json();
    console.log("Mapbox POI data:", data?.features?.[0].properties);
    const feature = data?.features?.[0];
    if (!feature) return null;

    // Runtime guard: ensure geometry is a Point with numeric coordinates.
    const geom = feature.geometry;
    if (
      !geom ||
      geom.type !== "Point" ||
      !Array.isArray(geom.coordinates) ||
      typeof geom.coordinates[0] !== "number" ||
      typeof geom.coordinates[1] !== "number"
    ) {
      // If your endpoint truly only returns Points this should not happen,
      // but defend defensively and return null if the shape is unexpected.
      console.warn(`Mapbox feature for ${mapboxId} does not have Point geometry`, geom?.type);
      return null;
    }

    return feature as PointTargetFeature;
  } catch (err) {
    console.error(`Error fetching Mapbox POI ${mapboxId}:`, err);
    return null;
  }
}
