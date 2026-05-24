// Route optimization service — nearest-neighbor TSP for shelter multi-stop pickup
// Pure client-side, no API calls

import { calculateDistance } from '../utils/mapUtils';

export interface OptimizationPoint {
  id: string;
  lat: number;
  lng: number;
  name: string;
}

export interface OptimizedStop {
  id: string;
  name: string;
  lat: number;
  lng: number;
  distanceFromPrevKm: number;
  cumulativeDistanceKm: number;
  estimatedDurationMin: number; // cumulative minutes from start
}

export interface OptimizedRoute {
  stops: OptimizedStop[];
  totalDistanceKm: number;
  totalEstimatedMinutes: number;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Nearest-neighbor greedy algorithm for ordering destinations.
 * Returns the ordered sequence of destination IDs.
 */
export function optimizeRouteOrder(
  start: OptimizationPoint,
  destinations: OptimizationPoint[]
): string[] {
  if (destinations.length === 0) return [];
  if (destinations.length === 1) return [destinations[0].id];

  const remaining = [...destinations];
  const ordered: OptimizationPoint[] = [];
  let current = start;

  while (remaining.length > 0) {
    let nearestIdx = 0;
    let nearestDist = Infinity;

    for (let i = 0; i < remaining.length; i++) {
      const dist = calculateDistance(
        current.lat,
        current.lng,
        remaining[i].lat,
        remaining[i].lng
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIdx = i;
      }
    }

    const nearest = remaining.splice(nearestIdx, 1)[0];
    ordered.push(nearest);
    current = nearest;
  }

  return ordered.map((p) => p.id);
}

/**
 * Calculates total route distance in km given an ordered list of point IDs.
 */
export function calculateTotalDistance(
  orderedIds: string[],
  points: OptimizationPoint[],
  start: OptimizationPoint
): number {
  const pointMap = new Map(points.map((p) => [p.id, p]));
  let total = 0;
  let current = start;

  for (const id of orderedIds) {
    const next = pointMap.get(id);
    if (!next) continue;
    total += calculateDistance(current.lat, current.lng, next.lat, next.lng);
    current = next;
  }

  return total;
}

/**
 * Builds a full optimized route with per-stop distances and ETA.
 * Assumes an average speed of 30 km/h for urban driving.
 */
export function buildOptimizedRoute(
  start: OptimizationPoint,
  destinations: OptimizationPoint[]
): OptimizedRoute {
  const AVG_SPEED_KMH = 30;

  if (destinations.length === 0) {
    return { stops: [], totalDistanceKm: 0, totalEstimatedMinutes: 0 };
  }

  const orderedIds = optimizeRouteOrder(start, destinations);
  const pointMap = new Map(destinations.map((p) => [p.id, p]));

  const stops: OptimizedStop[] = [];
  let current = start;
  let cumDist = 0;

  for (const id of orderedIds) {
    const next = pointMap.get(id);
    if (!next) continue;

    const segmentKm = calculateDistance(
      current.lat,
      current.lng,
      next.lat,
      next.lng
    );
    cumDist += segmentKm;

    stops.push({
      id: next.id,
      name: next.name,
      lat: next.lat,
      lng: next.lng,
      distanceFromPrevKm: parseFloat(segmentKm.toFixed(2)),
      cumulativeDistanceKm: parseFloat(cumDist.toFixed(2)),
      estimatedDurationMin: Math.round((cumDist / AVG_SPEED_KMH) * 60),
    });

    current = next;
  }

  return {
    stops,
    totalDistanceKm: parseFloat(cumDist.toFixed(2)),
    totalEstimatedMinutes: Math.round((cumDist / AVG_SPEED_KMH) * 60),
  };
}
