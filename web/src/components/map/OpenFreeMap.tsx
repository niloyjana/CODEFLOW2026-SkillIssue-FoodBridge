// OpenFreeMap component — MapLibre GL renderer with OpenFreeMap tiles
// No API key required. Tiles served from https://tiles.openfreemap.org

import React, { useEffect, useRef, useCallback, useImperativeHandle, forwardRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/liberty';

export interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  label: string;
  subLabel?: string;
  color?: 'green' | 'orange' | 'blue' | 'red' | 'purple';
  popupContent?: string;
}

interface OpenFreeMapProps {
  center?: [number, number]; // [lng, lat]
  zoom?: number;
  markers?: MapMarker[];
  routeGeometry?: Array<[number, number]>; // [lng, lat] pairs for polyline
  onMapLoad?: () => void;
  onBoundsChange?: (bounds: { north: number; south: number; east: number; west: number }) => void;
  onMapClick?: (lat: number, lng: number) => void;
  height?: string;
  selectedMarkerId?: string;
}

export interface OpenFreeMapHandle {
  flyTo: (center: [number, number], zoom?: number) => void;
  fitBounds: (bounds: [[number, number], [number, number]]) => void;
}

const MARKER_COLORS: Record<string, string> = {
  green: '#2e7d32',
  orange: '#f57c00',
  blue: '#1976d2',
  red: '#d32f2f',
  purple: '#7b1fa2',
};

const OpenFreeMapInner: React.ForwardRefRenderFunction<
  OpenFreeMapHandle,
  OpenFreeMapProps
> = (
  {
    center = [88.3639, 22.5726],
    zoom = 13,
    markers = [],
    routeGeometry,
    onMapLoad,
    onBoundsChange,
    onMapClick,
    height = '500px',
    selectedMarkerId,
  },
  ref
) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<maplibregl.Marker[]>([]);
  const boundsTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Expose flyTo and fitBounds via ref
  useImperativeHandle(
    ref,
    () => ({
      flyTo: (c: [number, number], z?: number) => {
        mapRef.current?.flyTo({ center: c, zoom: z || mapRef.current.getZoom(), duration: 1500 });
      },
      fitBounds: (bounds: [[number, number], [number, number]]) => {
        mapRef.current?.fitBounds(bounds, { padding: 60, duration: 1500 });
      },
    }),
    []
  );

  // Fire onBoundsChange debounced
  const emitBounds = useCallback(() => {
    if (!mapRef.current || !onBoundsChange) return;
    if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
    boundsTimerRef.current = setTimeout(() => {
      const b = mapRef.current!.getBounds();
      onBoundsChange({
        north: b.getNorth(),
        south: b.getSouth(),
        east: b.getEast(),
        west: b.getWest(),
      });
    }, 500);
  }, [onBoundsChange]);

  // Initialize map
  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const map = new maplibregl.Map({
      container: containerRef.current,
      style: MAP_STYLE,
      center,
      zoom,
    });

    map.addControl(new maplibregl.NavigationControl(), 'top-right');

    map.on('load', () => {
      onMapLoad?.();
      emitBounds();
    });

    map.on('moveend', emitBounds);

    if (onMapClick) {
      map.on('click', (e) => {
        onMapClick(e.lngLat.lat, e.lngLat.lng);
      });
    }

    mapRef.current = map;

    return () => {
      if (boundsTimerRef.current) clearTimeout(boundsTimerRef.current);
      map.remove();
      mapRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    markers.forEach((m) => {
      // Create marker element
      const el = document.createElement('div');
      el.className = 'map-marker-pin';
      const color = MARKER_COLORS[m.color || 'green'] || MARKER_COLORS.green;
      el.style.cssText = `
        width: 28px;
        height: 28px;
        border-radius: 50% 50% 50% 0;
        background: ${color};
        transform: rotate(-45deg);
        border: 2px solid white;
        box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        cursor: pointer;
        transition: transform 0.2s;
      `;

      if (selectedMarkerId === m.id) {
        el.style.width = '34px';
        el.style.height = '34px';
        el.style.zIndex = '10';
      }

      // Build popup HTML
      const popupHtml = m.popupContent
        ? m.popupContent
        : `<div style="font-family: var(--font-body, sans-serif); padding: 4px;">
            <strong style="color: ${color}; font-size: 14px;">${escapeHtml(m.label)}</strong>
            ${m.subLabel ? `<p style="margin: 4px 0 0; font-size: 12px; color: #666;">${escapeHtml(m.subLabel)}</p>` : ''}
          </div>`;

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: true,
        maxWidth: '260px',
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([m.lng, m.lat])
        .setPopup(popup)
        .addTo(map);

      markersRef.current.push(marker);
    });
  }, [markers, selectedMarkerId]);

  // Draw route polyline
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    const sourceId = 'route-line';
    const layerId = 'route-line-layer';

    // Wait for style to be loaded
    const drawRoute = () => {
      // Remove existing route
      if (map.getLayer(layerId)) map.removeLayer(layerId);
      if (map.getSource(sourceId)) map.removeSource(sourceId);

      if (!routeGeometry || routeGeometry.length < 2) return;

      map.addSource(sourceId, {
        type: 'geojson',
        data: {
          type: 'Feature',
          properties: {},
          geometry: {
            type: 'LineString',
            coordinates: routeGeometry,
          },
        },
      });

      map.addLayer({
        id: layerId,
        type: 'line',
        source: sourceId,
        layout: { 'line-join': 'round', 'line-cap': 'round' },
        paint: {
          'line-color': '#1976d2',
          'line-width': 4,
          'line-opacity': 0.8,
        },
      });
    };

    if (map.isStyleLoaded()) {
      drawRoute();
    } else {
      map.once('load', drawRoute);
    }
  }, [routeGeometry]);

  return React.createElement('div', {
    ref: containerRef,
    className: 'map-container',
    style: { width: '100%', height, borderRadius: '12px', overflow: 'hidden' },
  });
};

function escapeHtml(str: string): string {
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

export const OpenFreeMap = forwardRef(OpenFreeMapInner);
export default OpenFreeMap;
