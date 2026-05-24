// OSRM routing service — free public demo instance, no API key
// Docs: https://project-osrm.org/docs/v5.24.0/api/

import { calculateDistance } from '../utils/mapUtils';

const OSRM_BASE = 'https://router.project-osrm.org';

export interface RoutePoint {
  lat: number;
  lng: number;
}

export interface DirectionsResult {
  distance: number; // meters
  duration: number; // seconds
  geometry: Array<[number, number]>; // [lng, lat] coordinate pairs for polyline
  instructions: string[];
}

export interface DistanceMatrixEntry {
  distance: number; // meters
  duration: number; // seconds
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Get driving directions between two points using OSRM.
 */
export async function getDirections(
  from: RoutePoint,
  to: RoutePoint
): Promise<DirectionsResult> {
  try {
    const coords = `${from.lng},${from.lat};${to.lng},${to.lat}`;
    const url = `${OSRM_BASE}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=true`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM returned ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok' || !data.routes || data.routes.length === 0) {
      throw new Error('No route found');
    }

    const route = data.routes[0];
    const geometry: Array<[number, number]> = route.geometry.coordinates || [];
    const instructions: string[] = [];

    // Extract step-by-step instructions
    if (route.legs) {
      for (const leg of route.legs) {
        if (leg.steps) {
          for (const step of leg.steps) {
            if (step.maneuver && step.name) {
              const modifier = step.maneuver.modifier
                ? ` ${step.maneuver.modifier}`
                : '';
              const instruction = `${capitalize(step.maneuver.type)}${modifier} onto ${step.name || 'unnamed road'} (${formatDistance(step.distance)})`;
              instructions.push(instruction);
            }
          }
        }
      }
    }

    return {
      distance: route.distance || 0,
      duration: route.duration || 0,
      geometry,
      instructions,
    };
  } catch (err) {
    console.warn('[Routing] getDirections failed, using straight-line fallback', err);
    return straightLineFallback(from, to);
  }
}

/**
 * Get a distance matrix from one origin to multiple destinations.
 * Uses OSRM Table API.
 */
export async function getDistanceMatrix(
  origin: RoutePoint,
  destinations: RoutePoint[]
): Promise<DistanceMatrixEntry[]> {
  if (destinations.length === 0) return [];

  try {
    const allPoints = [origin, ...destinations];
    const coords = allPoints
      .map((p) => `${p.lng},${p.lat}`)
      .join(';');
    const sources = '0'; // only the origin
    const destIndices = destinations.map((_, i) => i + 1).join(';');

    const url = `${OSRM_BASE}/table/v1/driving/${coords}?sources=${sources}&destinations=${destIndices}&annotations=distance,duration`;
    const res = await fetch(url);
    if (!res.ok) throw new Error(`OSRM table returned ${res.status}`);
    const data = await res.json();

    if (data.code !== 'Ok') throw new Error('Table query failed');

    const durations: number[] = data.durations[0] || [];
    const distances: number[] = data.distances[0] || [];

    return destinations.map((_, i) => ({
      distance: distances[i] || 0,
      duration: durations[i] || 0,
    }));
  } catch (err) {
    console.warn('[Routing] getDistanceMatrix failed, using Haversine fallback', err);
    return destinations.map((dest) => {
      const km = calculateDistance(origin.lat, origin.lng, dest.lat, dest.lng);
      return {
        distance: km * 1000,
        duration: (km / 40) * 3600, // assume 40 km/h average
      };
    });
  }
}

// ── Formatting helpers ────────────────────────────────────────────────────────

/**
 * Format a distance in meters to human-readable text.
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)} m`;
  }
  const km = meters / 1000;
  return `${km.toFixed(1)} km`;
}

/**
 * Format a duration in seconds to human-readable text.
 */
export function formatDuration(seconds: number): string {
  if (seconds < 60) {
    return `${Math.round(seconds)} sec`;
  }
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) {
    return `${minutes} min`;
  }
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  return `${hours}h ${remainingMinutes}min`;
}

/**
 * Opens Google Maps directions in a new tab — backup navigation plan.
 */
export function openGoogleMapsDirections(
  from: RoutePoint,
  to: RoutePoint
): void {
  const distKm = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  if (distKm < 0.005) { // less than 5 meters
    alert("You are already at the destination!");
    return;
  }
  const url = `https://www.google.com/maps/dir/${from.lat},${from.lng}/${to.lat},${to.lng}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/**
 * Opens Google Maps directions in a new tab for a multi-stop route.
 */
export function openGoogleMapsMultiStopRoute(
  origin: RoutePoint,
  stops: RoutePoint[]
): void {
  if (stops.length === 0) return;

  // Filter out stops that are extremely close to the origin (less than 5 meters)
  const activeStops = stops.filter(stop => {
    const dist = calculateDistance(origin.lat, origin.lng, stop.lat, stop.lng);
    return dist >= 0.005; // 5 meters
  });

  // If no stops are left, then they are all at the origin
  if (activeStops.length === 0) {
    alert("You are already at all destinations on this route!");
    return;
  }

  const originStr = `${origin.lat},${origin.lng}`;
  const destinationStr = `${activeStops[activeStops.length - 1].lat},${activeStops[activeStops.length - 1].lng}`;
  
  let url = `https://www.google.com/maps/dir/?api=1&origin=${originStr}&destination=${destinationStr}`;
  
  if (activeStops.length > 1) {
    const waypoints = activeStops
      .slice(0, activeStops.length - 1)
      .map(stop => `${stop.lat},${stop.lng}`)
      .join('|');
    url += `&waypoints=${waypoints}`;
  }

  window.open(url, '_blank', 'noopener,noreferrer');
}


// ── Internals ─────────────────────────────────────────────────────────────────

function straightLineFallback(
  from: RoutePoint,
  to: RoutePoint
): DirectionsResult {
  const km = calculateDistance(from.lat, from.lng, to.lat, to.lng);
  return {
    distance: km * 1000,
    duration: (km / 40) * 3600,
    geometry: [
      [from.lng, from.lat],
      [to.lng, to.lat],
    ],
    instructions: [
      `Head towards destination (${formatDistance(km * 1000)} straight line)`,
    ],
  };
}

function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).replace(/_/g, ' ');
}
