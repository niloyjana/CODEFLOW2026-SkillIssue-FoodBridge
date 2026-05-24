// DirectionsPanel — collapsible panel showing route directions
// Displays distance, ETA, turn-by-turn instructions, and Google Maps fallback

import React, { useState } from 'react';
import { DirectionsResult, RoutePoint, formatDistance, formatDuration, openGoogleMapsDirections } from '../../services/routing';
import Icons from '../common/Icons';
import Button from '../common/Button';

interface DirectionsPanelProps {
  directions: DirectionsResult;
  from: RoutePoint;
  to: RoutePoint;
  fromLabel?: string;
  toLabel?: string;
  onClose: () => void;
}

export const DirectionsPanel: React.FC<DirectionsPanelProps> = ({
  directions,
  from,
  to,
  fromLabel = 'Your location',
  toLabel = 'Destination',
  onClose,
}) => {
  const [collapsed, setCollapsed] = useState(false);

  return React.createElement(
    'div',
    {
      className: 'directions-panel glass-panel',
      style: {
        borderRadius: 'var(--radius-md, 12px)',
        border: '1px solid var(--border-color, #e0e0e0)',
        overflow: 'hidden',
        marginTop: '0.75rem',
        animation: 'slideUp 0.3s ease',
      },
    },
    // Header
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.75rem 1rem',
          background: 'linear-gradient(135deg, rgba(25,118,210,0.08) 0%, rgba(25,118,210,0.02) 100%)',
          borderBottom: collapsed ? 'none' : '1px solid rgba(0,0,0,0.06)',
          cursor: 'pointer',
        },
        onClick: () => setCollapsed(!collapsed),
      },
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '0.5rem' } },
        React.createElement(Icons.MapPin, { size: 16, color: '#1976d2' }),
        React.createElement(
          'span',
          { style: { fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary, #1a1a2e)' } },
          'Directions'
        ),
        React.createElement(
          'span',
          {
            style: {
              background: '#1976d2',
              color: 'white',
              padding: '2px 8px',
              borderRadius: '12px',
              fontSize: '0.75rem',
              fontWeight: 600,
            },
          },
          `${formatDistance(directions.distance)} · ${formatDuration(directions.duration)}`
        )
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', alignItems: 'center', gap: '0.25rem' } },
        React.createElement(
          'button',
          {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              setCollapsed(!collapsed);
            },
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: 'var(--text-secondary, #999)',
              padding: '2px 6px',
            },
            title: collapsed ? 'Expand' : 'Collapse',
          },
          collapsed ? '▼' : '▲'
        ),
        React.createElement(
          'button',
          {
            onClick: (e: React.MouseEvent) => {
              e.stopPropagation();
              onClose();
            },
            style: {
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: '1.1rem',
              color: 'var(--text-secondary, #999)',
              padding: '2px 6px',
            },
            title: 'Close directions',
          },
          '✕'
        )
      )
    ),
    // Body (collapsible)
    !collapsed &&
      React.createElement(
        'div',
        { style: { padding: '0.75rem 1rem' } },
        // From/To labels
        React.createElement(
          'div',
          { style: { marginBottom: '0.75rem' } },
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #999)',
                marginBottom: '0.3rem',
              },
            },
            React.createElement('span', {
              style: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#4caf50',
                flexShrink: 0,
              },
            }),
            fromLabel
          ),
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                fontSize: '0.8rem',
                color: 'var(--text-secondary, #999)',
              },
            },
            React.createElement('span', {
              style: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: '#d32f2f',
                flexShrink: 0,
              },
            }),
            toLabel
          )
        ),
        // Instructions list
        directions.instructions.length > 0 &&
          React.createElement(
            'div',
            {
              style: {
                maxHeight: '200px',
                overflowY: 'auto',
                borderTop: '1px solid rgba(0,0,0,0.06)',
                paddingTop: '0.5rem',
              },
            },
            React.createElement(
              'p',
              {
                style: {
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  color: 'var(--text-secondary, #999)',
                  marginBottom: '0.4rem',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                },
              },
              'Turn-by-turn'
            ),
            directions.instructions.map((instruction, idx) =>
              React.createElement(
                'div',
                {
                  key: idx,
                  style: {
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: '0.5rem',
                    padding: '0.3rem 0',
                    fontSize: '0.8rem',
                    color: 'var(--text-primary, #1a1a2e)',
                    borderBottom:
                      idx < directions.instructions.length - 1
                        ? '1px solid rgba(0,0,0,0.04)'
                        : 'none',
                  },
                },
                React.createElement(
                  'span',
                  {
                    style: {
                      width: '20px',
                      height: '20px',
                      borderRadius: '50%',
                      background: 'rgba(25,118,210,0.1)',
                      color: '#1976d2',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '0.65rem',
                      fontWeight: 700,
                      flexShrink: 0,
                    },
                  },
                  `${idx + 1}`
                ),
                React.createElement('span', null, instruction)
              )
            )
          ),
        // Action button
        React.createElement(
          'div',
          { style: { marginTop: '0.75rem' } },
          React.createElement(
            Button,
            {
              onClick: () => openGoogleMapsDirections(from, to),
              className: 'btn-premium',
              fullWidth: true,
              style: {
                padding: '0.55rem 1rem',
                fontSize: '0.85rem',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.4rem',
              },
            },
            React.createElement(Icons.MapPin, { size: 14 }),
            'Open in Google Maps'
          )
        )
      )
  );
};

export default DirectionsPanel;
