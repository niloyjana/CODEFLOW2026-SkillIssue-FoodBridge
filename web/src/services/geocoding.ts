// Nominatim geocoding service — free, no API key
// Rate limit: 1 request per second — we queue and delay requests
// Docs: https://nominatim.org/release-docs/develop/api/Search/

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';
const USER_AGENT = 'FoodBridge-Hackathon/1.0';
const MIN_REQUEST_INTERVAL = 1100; // 1.1s to stay safely under 1 req/sec

export interface GeocodingResult {
  lat: number;
  lon: number;
  displayName: string;
  osmId: number;
  type: string;
  importance: number;
}

export interface ReverseGeocodingResult {
  displayName: string;
  address: {
    road: string;
    city: string;
    state: string;
    country: string;
    postcode: string;
  };
  lat: number;
  lon: number;
}

// ── Rate-limit queue ──────────────────────────────────────────────────────────
let lastRequestTime = 0;

async function throttledFetch(url: string): Promise<Response> {
  const now = Date.now();
  const timeSinceLast = now - lastRequestTime;
  if (timeSinceLast < MIN_REQUEST_INTERVAL) {
    await new Promise((resolve) =>
      setTimeout(resolve, MIN_REQUEST_INTERVAL - timeSinceLast)
    );
  }
  lastRequestTime = Date.now();
  return fetch(url, {
    headers: {
      'User-Agent': USER_AGENT,
      Accept: 'application/json',
    },
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

/**
 * Search for a location by free-text query.
 */
export async function searchLocation(
  query: string,
  biasLat?: number,
  biasLng?: number
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    let url = `${NOMINATIM_BASE}/search?q=${encoded}&format=json&addressdetails=1&limit=6`;
    if (biasLat !== undefined && biasLng !== undefined) {
      const left = biasLng - 0.5;
      const right = biasLng + 0.5;
      const top = biasLat + 0.5;
      const bottom = biasLat - 0.5;
      url += `&viewbox=${left},${top},${right},${bottom}&bounded=0`;
    }
    const res = await throttledFetch(url);
    if (!res.ok) return [];
    const data: NominatimSearchItem[] = await res.json();
    return data.map(mapToResult);
  } catch {
    console.warn('[Geocoding] searchLocation failed, returning empty');
    return [];
  }
}

/**
 * Search specifically for restaurants, cafes, and fast-food places.
 */
export async function searchRestaurant(
  query: string,
  biasLat?: number,
  biasLng?: number
): Promise<GeocodingResult[]> {
  if (!query || query.trim().length < 2) return [];
  try {
    const encoded = encodeURIComponent(query.trim());
    let url = `${NOMINATIM_BASE}/search?q=${encoded}&format=json&addressdetails=1&limit=8&extratags=1`;
    if (biasLat !== undefined && biasLng !== undefined) {
      const left = biasLng - 0.5;
      const right = biasLng + 0.5;
      const top = biasLat + 0.5;
      const bottom = biasLat - 0.5;
      url += `&viewbox=${left},${top},${right},${bottom}&bounded=0`;
    }
    const res = await throttledFetch(url);
    if (!res.ok) return [];
    const data: NominatimSearchItem[] = await res.json();
    // Keep results that look like food establishments, but fall back to all results
    const foodTypes = ['restaurant', 'cafe', 'fast_food', 'bar', 'food_court', 'pub'];
    const foodResults = data.filter(
      (item) =>
        foodTypes.some((t) => (item.type || '').toLowerCase().includes(t)) ||
        foodTypes.some((t) => (item.class || '').toLowerCase().includes(t))
    );
    const results = foodResults.length > 0 ? foodResults : data;
    return results.map(mapToResult);
  } catch {
    console.warn('[Geocoding] searchRestaurant failed, returning empty');
    return [];
  }
}

/**
 * Reverse geocode coordinates to an address.
 */
export async function reverseGeocode(
  lat: number,
  lon: number
): Promise<ReverseGeocodingResult | null> {
  try {
    const res = await throttledFetch(
      `${NOMINATIM_BASE}/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`
    );
    if (!res.ok) return null;
    const data = await res.json();
    return {
      displayName: data.display_name || '',
      address: {
        road: data.address?.road || '',
        city:
          data.address?.city ||
          data.address?.town ||
          data.address?.village ||
          '',
        state: data.address?.state || '',
        country: data.address?.country || '',
        postcode: data.address?.postcode || '',
      },
      lat: parseFloat(data.lat),
      lon: parseFloat(data.lon),
    };
  } catch {
    console.warn('[Geocoding] reverseGeocode failed');
    return null;
  }
}

// ── Debounce utility ──────────────────────────────────────────────────────────

/**
 * Creates a debounced version of the given function.
 * Useful for search inputs — prevents firing on every keystroke.
 */
export function debounce<T extends (...args: Parameters<T>) => void>(
  fn: T,
  delayMs: number
): (...args: Parameters<T>) => void {
  let timer: ReturnType<typeof setTimeout> | null = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), delayMs);
  };
}

// ── Internal types ────────────────────────────────────────────────────────────

interface NominatimSearchItem {
  lat: string;
  lon: string;
  display_name: string;
  osm_id: number;
  type: string;
  class: string;
  importance: number;
}

function mapToResult(item: NominatimSearchItem): GeocodingResult {
  return {
    lat: parseFloat(item.lat),
    lon: parseFloat(item.lon),
    displayName: item.display_name,
    osmId: item.osm_id,
    type: item.type || item.class || 'place',
    importance: item.importance || 0,
  };
}
