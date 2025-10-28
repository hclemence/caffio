import type { TargetFeature } from "mapbox-gl";
export * from "./cafes";

export type PointTargetFeature = TargetFeature & {
  geometry: { type: "Point"; coordinates: [number, number] };
};
