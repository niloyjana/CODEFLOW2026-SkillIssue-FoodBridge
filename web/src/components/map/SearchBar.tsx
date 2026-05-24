// SearchBar — geocoding search input with autocomplete dropdown
// Uses Nominatim via the geocoding service with debounced input

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { searchLocation, GeocodingResult, debounce } from '../../services/geocoding';
import Icons from '../common/Icons';

interface SearchBarProps {
  onLocationSelect: (lat: number, lng: number, displayName: string) => void;
  placeholder?: string;
  biasLat?: number;
  biasLng?: number;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  onLocationSelect,
  placeholder = 'Search for a location...',
  biasLat,
  biasLng,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Debounced search function (300ms)
  const debouncedSearchRef = useRef(
    debounce(async (q: string, bLat?: number, bLng?: number) => {
      if (q.trim().length < 2) {
        setResults([]);
        setShowDropdown(false);
        setLoading(false);
        return;
      }
      setLoading(true);
      const data = await searchLocation(q, bLat, bLng);
      setResults(data);
      setShowDropdown(data.length > 0);
      setLoading(false);
    }, 300)
  );

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setQuery(value);
      if (value.trim().length >= 2) {
        setLoading(true);
      }
      debouncedSearchRef.current(value, biasLat, biasLng);
    },
    [biasLat, biasLng]
  );

  const handleSelect = useCallback(
    (result: GeocodingResult) => {
      setQuery(result.displayName.split(',')[0]);
      setShowDropdown(false);
      setResults([]);
      onLocationSelect(result.lat, result.lon, result.displayName);
    },
    [onLocationSelect]
  );

  const handleClear = useCallback(() => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return React.createElement(
    'div',
    {
      ref: containerRef,
      className: 'search-bar-container',
      style: { position: 'relative', width: '100%', marginBottom: '0.75rem' },
    },
    // Input row
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          background: 'rgba(255,255,255,0.85)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--border-color, #e0e0e0)',
          borderRadius: 'var(--radius-sm, 8px)',
          padding: '0.5rem 0.75rem',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        },
      },
      React.createElement(Icons.MapPin, {
        size: 16,
        color: 'var(--primary-color, #2e7d32)',
      }),
      React.createElement('input', {
        type: 'text',
        value: query,
        onChange: handleChange,
        placeholder,
        style: {
          flex: 1,
          border: 'none',
          outline: 'none',
          background: 'transparent',
          fontSize: '0.9rem',
          fontFamily: 'inherit',
          color: 'var(--text-primary, #1a1a2e)',
        },
      }),
      loading &&
        React.createElement('span', {
          className: 'search-spinner',
          style: {
            width: '16px',
            height: '16px',
            border: '2px solid #ccc',
            borderTopColor: 'var(--primary-color, #2e7d32)',
            borderRadius: '50%',
            animation: 'spin 0.6s linear infinite',
            flexShrink: 0,
          },
        }),
      query.length > 0 &&
        React.createElement(
          'button',
          {
            onClick: handleClear,
            type: 'button',
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1rem',
              color: 'var(--text-secondary, #999)',
              padding: '0 4px',
              lineHeight: 1,
            },
            title: 'Clear search',
          },
          '✕'
        )
    ),
    // Dropdown
    showDropdown &&
      results.length > 0 &&
      React.createElement(
        'div',
        {
          className: 'search-results-dropdown',
          style: {
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            background: 'rgba(255,255,255,0.97)',
            backdropFilter: 'blur(12px)',
            border: '1px solid var(--border-color, #e0e0e0)',
            borderTop: 'none',
            borderRadius: '0 0 var(--radius-sm, 8px) var(--radius-sm, 8px)',
            boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
            maxHeight: '240px',
            overflowY: 'auto',
            zIndex: 1000,
          },
        },
        results.map((result, idx) =>
          React.createElement(
            'button',
            {
              key: `${result.osmId}_${idx}`,
              onClick: () => handleSelect(result),
              type: 'button',
              style: {
                display: 'flex',
                alignItems: 'flex-start',
                gap: '0.5rem',
                width: '100%',
                padding: '0.6rem 0.75rem',
                border: 'none',
                borderBottom:
                  idx < results.length - 1
                    ? '1px solid rgba(0,0,0,0.06)'
                    : 'none',
                background: 'transparent',
                cursor: 'pointer',
                textAlign: 'left',
                fontFamily: 'inherit',
                transition: 'background 0.15s',
              },
              onMouseEnter: (e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'rgba(46,125,50,0.06)';
              },
              onMouseLeave: (e: React.MouseEvent<HTMLButtonElement>) => {
                (e.currentTarget as HTMLButtonElement).style.background =
                  'transparent';
              },
            },
            React.createElement(Icons.MapPin, {
              size: 14,
              color: 'var(--primary-color, #2e7d32)',
              style: { marginTop: '2px', flexShrink: 0 },
            }),
            React.createElement(
              'div',
              { style: { flex: 1, minWidth: 0 } },
              React.createElement(
                'div',
                {
                  style: {
                    fontSize: '0.85rem',
                    fontWeight: 600,
                    color: 'var(--text-primary, #1a1a2e)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  },
                },
                result.displayName.split(',')[0]
              ),
              React.createElement(
                'div',
                {
                  style: {
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary, #999)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    marginTop: '1px',
                  },
                },
                result.displayName.split(',').slice(1).join(',').trim()
              )
            )
          )
        )
      )
  );
};

export default SearchBar;
