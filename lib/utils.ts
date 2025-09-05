import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format distance for map display
 * - < 1 km: show in meters
 * - 1–10 km: show km with 1 decimal
 * - >= 10 km: show whole km
 *
 * @param {number} meters - distance in meters
 * @returns {string} formatted distance
 */
export function formatDistance(meters: number) {
  if (meters < 1000) {
    // Round small distances smartly
    if (meters < 500) {
      // nearest 10m for short walking distances
      const rounded = Math.round(meters / 10) * 10;
      return `${rounded} m`;
    }
    // nearest 50m for medium walking distances
    const rounded = Math.round(meters / 50) * 50;
    return `${rounded} m`;
  }

  const km = meters / 1000;

  if (km < 10) {
    return `${km.toFixed(1)} km`;
  }

  return `${Math.round(km)} km`;
}
