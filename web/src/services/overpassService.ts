// Overpass API service — free OSM POI queries, no API key
// Docs: https://wiki.openstreetmap.org/wiki/Overpass_API

const OVERPASS_BASE = 'https://overpass-api.de/api/interpreter';
const TIMEOUT_SECONDS = 25;

export interface OverpassRestaurant {
  id: number;
  name: string;
  lat: number;
  lon: number;
  cuisine: string;
  phone: string;
  website: string;
  openingHours: string;
  address: string;
}

export interface OverpassBounds {
  north: number;
  south: number;
  east: number;
  west: number;
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Fetch restaurants, cafes, and fast-food places within the current map view.
 */
export async function fetchRestaurantsInView(
  bounds: OverpassBounds
): Promise<OverpassRestaurant[]> {
  const bbox = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`;
  const query = `
    [out:json][timeout:${TIMEOUT_SECONDS}];
    (
      node["amenity"="restaurant"](${bbox});
      node["amenity"="cafe"](${bbox});
      node["amenity"="fast_food"](${bbox});
    );
    out body;
  `;
  return executeQuery(query);
}

/**
 * Fetch restaurants, cafes, and fast-food places within a radius (km) of a point.
 */
export async function fetchRestaurantsNearby(
  lat: number,
  lon: number,
  radiusKm: number
): Promise<OverpassRestaurant[]> {
  const radiusMeters = Math.round(radiusKm * 1000);
  const query = `
    [out:json][timeout:${TIMEOUT_SECONDS}];
    (
      node["amenity"="restaurant"](around:${radiusMeters},${lat},${lon});
      node["amenity"="cafe"](around:${radiusMeters},${lat},${lon});
      node["amenity"="fast_food"](around:${radiusMeters},${lat},${lon});
    );
    out body;
  `;
  return executeQuery(query);
}

// ── Internals ─────────────────────────────────────────────────────────────────

async function executeQuery(
  query: string
): Promise<OverpassRestaurant[]> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(
      () => controller.abort(),
      TIMEOUT_SECONDS * 1000
    );

    const res = await fetch(OVERPASS_BASE, {
      method: 'POST',
      body: `data=${encodeURIComponent(query.trim())}`,
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      console.warn(`[Overpass] HTTP ${res.status}`);
      return [];
    }

    const data = await res.json();
    const elements: OverpassElement[] = data.elements || [];

    return elements
      .filter((el) => el.lat !== undefined && el.lon !== undefined)
      .map(mapToRestaurant);
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') {
      console.warn('[Overpass] Request timed out');
    } else {
      console.warn('[Overpass] Query failed', err);
    }
    return [];
  }
}

interface OverpassElement {
  id: number;
  lat?: number;
  lon?: number;
  tags?: Record<string, string>;
}

function mapToRestaurant(el: OverpassElement): OverpassRestaurant {
  const tags = el.tags || {};

  // Build an address string from structured address tags
  const addressParts = [
    tags['addr:housenumber'],
    tags['addr:street'],
    tags['addr:city'],
  ].filter(Boolean);

  return {
    id: el.id,
    name: tags.name || 'Unnamed',
    lat: el.lat || 0,
    lon: el.lon || 0,
    cuisine: tags.cuisine || '',
    phone: tags.phone || tags['contact:phone'] || '',
    website: tags.website || tags['contact:website'] || '',
    openingHours: tags.opening_hours || '',
    address: addressParts.length > 0 ? addressParts.join(', ') : '',
  };
}
