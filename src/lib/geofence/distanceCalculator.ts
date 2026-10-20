/**
 * Centralized Geodesic Distance Calculator
 * Implements the standard spherical Haversine formula with coordinate bounds validation.
 *
 * Real-world GPS Tolerance Notes:
 * Consumer-grade mobile GNSS and Wi-Fi positioning typically exhibit 5m to 25m of accuracy error.
 * Dense urban canyons or indoor spaces may report accuracy circles exceeding 50m.
 * The system preserves unrounded numeric distance for circular radius filtering and nearest-first sorting,
 * and formats distances into human-readable strings only at presentation time.
 */

export const EARTH_RADIUS_METERS = 6371000; // WGS-84 volumetric mean Earth radius in meters

/**
 * Validates that latitude and longitude fall within genuine Earth geographic coordinate ranges.
 */
export function isValidCoordinate(lat: number, lon: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    !isNaN(lat) &&
    !isNaN(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Calculates the great-circle distance between two geographic points
 * using the standard Haversine formula on a spherical Earth.
 *
 * Returns the exact numeric distance in meters (unrounded float) for exact filtering and sorting.
 *
 * @param lat1 Latitude of point 1 in degrees (-90 to 90)
 * @param lon1 Longitude of point 1 in degrees (-180 to 180)
 * @param lat2 Latitude of point 2 in degrees (-90 to 90)
 * @param lon2 Longitude of point 2 in degrees (-180 to 180)
 * @returns Great-circle distance between points in meters
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!isValidCoordinate(lat1, lon1) || !isValidCoordinate(lat2, lon2)) {
    throw new Error(
      `Invalid geographic coordinates provided to calculateHaversineDistance: (${lat1}, ${lon1}), (${lat2}, ${lon2})`
    );
  }

  // Exact same point check
  if (lat1 === lat2 && lon1 === lon2) {
    return 0;
  }

  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);

  const lat1Rad = toRadians(lat1);
  const lat2Rad = toRadians(lat2);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  // Clamp to avoid floating point precision domain errors with asin/acos
  const clampedA = Math.min(1, Math.max(0, a));
  const c = 2 * Math.atan2(Math.sqrt(clampedA), Math.sqrt(1 - clampedA));

  return EARTH_RADIUS_METERS * c;
}

/**
 * Human-friendly distance presentation formatter.
 * Displays meters for distances < 1000m, and kilometers for distances >= 1000m.
 *
 * @param meters Numeric distance in meters
 * @returns Formatted string (e.g. "35 m away", "1.4 km away")
 */
export function formatDistance(meters?: number | null): string {
  if (meters === undefined || meters === null || isNaN(meters)) {
    return 'Nearby';
  }
  if (meters < 0) {
    return '0 m away';
  }
  if (meters < 1000) {
    return `${Math.round(meters)} m away`;
  }
  return `${(meters / 1000).toFixed(1)} km away`;
}

/**
 * Checks whether a given position is within a geofence radius.
 * Includes optional buffer/tolerance for GPS jitter reduction.
 */
export function isPointInsideGeofence(
  userLat: number,
  userLon: number,
  centerLat: number,
  centerLon: number,
  radiusMeters: number,
  toleranceMeters: number = 0
): { isInside: boolean; distanceMeters: number } {
  const distance = calculateHaversineDistance(userLat, userLon, centerLat, centerLon);
  const isInside = distance <= radiusMeters + toleranceMeters;

  return {
    isInside,
    distanceMeters: distance
  };
}
