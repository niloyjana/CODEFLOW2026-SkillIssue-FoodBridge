// OptimizedRoutePlanner — multi-stop pickup route optimizer for shelters
// Runs nearest-neighbor algorithm on claimed donations and displays the result

import React, { useMemo } from 'react';
import {
  buildOptimizedRoute,
  OptimizationPoint,
  OptimizedRoute,
} from '../../services/routeOptimization';
import { openGoogleMapsDirections } from '../../services/routing';
import { FoodPost } from 'shared/types';
import Icons from '../common/Icons';
import Button from '../common/Button';

interface OptimizedRoutePlannerProps {
  claimedPosts: FoodPost[];
  userLat: number;
  userLng: number;
  userName: string;
  onViewRoute?: (route: OptimizedRoute) => void;
}

export const OptimizedRoutePlanner: React.FC<OptimizedRoutePlannerProps> = ({
  claimedPosts,
  userLat,
  userLng,
  userName,
  onViewRoute,
}) => {
  // Build optimization inputs from claimed posts that have coordinates
  const destinations: OptimizationPoint[] = useMemo(
    () =>
      claimedPosts
        .filter((p) => p.lat !== undefined && p.lng !== undefined)
        .map((p) => ({
          id: p.id,
          lat: p.lat!,
          lng: p.lng!,
          name: p.restaurantName,
        })),
    [claimedPosts]
  );

  const start: OptimizationPoint = useMemo(
    () => ({
      id: 'start',
      lat: userLat,
      lng: userLng,
      name: userName,
    }),
    [userLat, userLng, userName]
  );

  const optimizedRoute = useMemo(() => {
    if (destinations.length === 0) return null;
    return buildOptimizedRoute(start, destinations);
  }, [start, destinations]);

  if (!optimizedRoute || destinations.length === 0) {
    return null;
  }

  const handleViewRoute = () => {
    onViewRoute?.(optimizedRoute);
  };

  const handleStartNavigation = () => {
    if (optimizedRoute.stops.length > 0) {
      const firstStop = optimizedRoute.stops[0];
      openGoogleMapsDirections(
        { lat: userLat, lng: userLng },
        { lat: firstStop.lat, lng: firstStop.lng }
      );
    }
  };

  return React.createElement(
    'div',
    {
      className: 'glass-panel',
      style: {
        borderRadius: 'var(--radius-md, 12px)',
        border: '1px solid rgba(25,118,210,0.15)',
        overflow: 'hidden',
        marginTop: '1rem',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(156,39,176,0.04) 100%)',
          borderBottom: '1px solid rgba(0,0,0,0.06)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        },
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
        React.createElement(Icons.TrendingUp, { size: 16, color: '#1976d2' }),
        React.createElement(
          'span',
          { style: { fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary, #1a1a2e)' } },
          'Optimized Pickup Route'
        )
      ),
      React.createElement(
        'span',
        {
          style: {
            fontSize: '0.75rem',
            color: 'var(--text-secondary, #999)',
            fontWeight: 600,
          },
        },
        `${optimizedRoute.stops.length} stops · ${optimizedRoute.totalDistanceKm} km · ~${optimizedRoute.totalEstimatedMinutes} min`
      )
    ),
    // Stops list
    React.createElement(
      'div',
      { style: { padding: '0.5rem 1rem' } },
      // Start location
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            padding: '0.4rem 0',
          },
        },
        React.createElement(
          'span',
          {
            style: {
              width: '24px',
              height: '24px',
              borderRadius: '50%',
              background: '#4caf50',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.7rem',
              fontWeight: 700,
              flexShrink: 0,
            },
          },
          '★'
        ),
        React.createElement(
          'div',
          null,
          React.createElement(
            'div',
            { style: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #1a1a2e)' } },
            'Your Location'
          ),
          React.createElement(
            'div',
            { style: { fontSize: '0.7rem', color: 'var(--text-secondary, #999)' } },
            'Start point'
          )
        )
      ),
      // Each stop
      optimizedRoute.stops.map((stop, idx) =>
        React.createElement(
          'div',
          {
            key: stop.id,
            style: {
              display: 'flex',
              alignItems: 'center',
              gap: '0.6rem',
              padding: '0.5rem 0',
              borderTop: '1px solid rgba(0,0,0,0.04)',
            },
          },
          React.createElement(
            'span',
            {
              style: {
                width: '24px',
                height: '24px',
                borderRadius: '50%',
                background: '#1976d2',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.7rem',
                fontWeight: 700,
                flexShrink: 0,
              },
            },
            `${idx + 1}`
          ),
          React.createElement(
            'div',
            { style: { flex: 1 } },
            React.createElement(
              'div',
              { style: { fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary, #1a1a2e)' } },
              stop.name
            ),
            React.createElement(
              'div',
              { style: { fontSize: '0.7rem', color: 'var(--text-secondary, #999)' } },
              `+${stop.distanceFromPrevKm} km from previous · ~${stop.estimatedDurationMin} min total`
            )
          )
        )
      ),
      // Action buttons
      React.createElement(
        'div',
        {
          style: {
            display: 'flex',
            gap: '0.5rem',
            marginTop: '0.75rem',
            paddingTop: '0.5rem',
            borderTop: '1px solid rgba(0,0,0,0.06)',
          },
        },
        React.createElement(
          Button,
          {
            onClick: handleViewRoute,
            variant: 'secondary',
            style: {
              flex: 1,
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
              border: '1px solid var(--border-color, #e0e0e0)',
            },
          },
          React.createElement(Icons.MapPin, { size: 14, color: '#1976d2' }),
          'View on Map'
        ),
        React.createElement(
          Button,
          {
            onClick: handleStartNavigation,
            className: 'btn-premium',
            style: {
              flex: 1,
              padding: '0.5rem 0.75rem',
              fontSize: '0.8rem',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.3rem',
            },
          },
          React.createElement(Icons.TrendingUp, { size: 14 }),
          'Start Navigation'
        )
      )
    )
  );
};

export default OptimizedRoutePlanner;
