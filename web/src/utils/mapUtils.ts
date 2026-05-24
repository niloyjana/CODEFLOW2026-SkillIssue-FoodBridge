// Map utility functions — Haversine, bounds, sorting
// No external dependencies

export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

/**
 * Haversine formula — calculates great-circle distance between two points in km.
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth radius in km
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/**
 * Checks whether a point falls inside a bounding box.
 */
export function isWithinBounds(point: LatLng, bounds: MapBounds): boolean {
  return (
    point.lat >= bounds.south &&
    point.lat <= bounds.north &&
    point.lng >= bounds.west &&
    point.lng <= bounds.east
  );
}

/**
 * Expands a center point into a bounding box of the given radius in km.
 */
export function centerToBounds(center: LatLng, radiusKm: number): MapBounds {
  // 1 degree latitude ≈ 111 km
  const latDelta = radiusKm / 111;
  // 1 degree longitude varies with latitude
  const lngDelta = radiusKm / (111 * Math.cos(toRad(center.lat)));
  return {
    north: center.lat + latDelta,
    south: center.lat - latDelta,
    east: center.lng + lngDelta,
    west: center.lng - lngDelta,
  };
}

/**
 * Generates a unique ID string for markers and temporary objects.
 */
export function generateUniqueId(): string {
  return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Sorts an array of items with lat/lng by distance from an origin point (ascending).
 */
export function sortByDistance<T extends LatLng>(
  origin: LatLng,
  items: T[]
): T[] {
  return [...items].sort((a, b) => {
    const distA = calculateDistance(origin.lat, origin.lng, a.lat, a.lng);
    const distB = calculateDistance(origin.lat, origin.lng, b.lat, b.lng);
    return distA - distB;
  });
}
