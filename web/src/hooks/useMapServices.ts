// Custom hooks for map-related services
// Wraps geocoding, routing, Overpass, and browser geolocation into React hooks

import { useState, useCallback, useEffect, useRef } from 'react';
import {
  searchLocation,
  reverseGeocode,
  GeocodingResult,
  ReverseGeocodingResult,
} from '../services/geocoding';
import {
  getDirections,
  formatDistance,
  formatDuration,
  DirectionsResult,
  RoutePoint,
} from '../services/routing';
import {
  fetchRestaurantsInView,
  OverpassRestaurant,
  OverpassBounds,
} from '../services/overpassService';

// ── useGeocoding ──────────────────────────────────────────────────────────────

export function useGeocoding() {
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);

  const search = useCallback(async (query: string) => {
    if (!query || query.trim().length < 2) {
      setResults([]);
      return;
    }
    setLoading(true);
    try {
      const data = await searchLocation(query);
      setResults(data);
    } catch {
      setResults([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const reverse = useCallback(
    async (
      lat: number,
      lon: number
    ): Promise<ReverseGeocodingResult | null> => {
      setLoading(true);
      try {
        return await reverseGeocode(lat, lon);
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearResults = useCallback(() => setResults([]), []);

  return { results, loading, search, reverseGeocode: reverse, clearResults };
}

// ── useRouting ────────────────────────────────────────────────────────────────

export function useRouting() {
  const [directions, setDirections] = useState<DirectionsResult | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchDirections = useCallback(
    async (from: RoutePoint, to: RoutePoint) => {
      setLoading(true);
      try {
        const result = await getDirections(from, to);
        setDirections(result);
        return result;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const clearDirections = useCallback(() => setDirections(null), []);

  return {
    directions,
    loading,
    getDirections: fetchDirections,
    clearDirections,
    formatDistance,
    formatDuration,
  };
}

// ── useNearbyRestaurants ──────────────────────────────────────────────────────

export function useNearbyRestaurants() {
  const [restaurants, setRestaurants] = useState<OverpassRestaurant[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchInView = useCallback(async (bounds: OverpassBounds) => {
    setLoading(true);
    try {
      const data = await fetchRestaurantsInView(bounds);
      setRestaurants(data);
    } catch {
      setRestaurants([]);
    } finally {
      setLoading(false);
    }
  }, []);

  return { restaurants, loading, fetchInView };
}

// ── useUserLocation ───────────────────────────────────────────────────────────

interface UserPosition {
  lat: number;
  lng: number;
  accuracy: number;
}

export function useUserLocation() {
  const [position, setPosition] = useState<UserPosition | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const watchIdRef = useRef<number | null>(null);

  const getPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const watchPosition = useCallback(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }
    setLoading(true);
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => {
        setPosition({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy,
        });
        setError(null);
        setLoading(false);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 }
    );
  }, []);

  const stopWatching = useCallback(() => {
    if (watchIdRef.current !== null) {
      navigator.geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  return { position, error, loading, getPosition, watchPosition, stopWatching };
}
