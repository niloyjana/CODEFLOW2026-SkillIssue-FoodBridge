import React, { useState } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import Card from '../common/Card';
import Icons from '../common/Icons';

export const Leaderboard: React.FC = () => {
  const { restaurantLeaderboard, shelterLeaderboard, individualLeaderboard, loading } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'shelters' | 'individuals'>('restaurants');

  const currentLeaderboard = 
    activeTab === 'restaurants' ? restaurantLeaderboard :
    activeTab === 'shelters' ? shelterLeaderboard :
    individualLeaderboard;

  const getRankClass = (index: number) => {
    if (index === 0) return 'rank-1';
    if (index === 1) return 'rank-2';
    if (index === 2) return 'rank-3';
    return 'rank-other';
  };

  return React.createElement(
    'div',
    { className: 'leaderboard-container' },
    React.createElement('h1', { className: 'text-center mb-2' }, 'Community Impact Leaderboard'),
    React.createElement(
      'p',
      { className: 'text-center mb-2', style: { color: 'var(--text-secondary)' } },
      'Recognizing local heroes saving food waste and feeding our neighbors.'
    ),
    React.createElement(
      Card,
      { className: 'glass-panel hover-lift' },
      React.createElement(
        'div',
        { className: 'tabs-container' },
        React.createElement(
          'button',
          {
            className: `tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`,
            style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
            onClick: () => setActiveTab('restaurants')
          },
          React.createElement(Icons.Utensils, { size: 14 }),
          'Restaurants Leaderboard'
        ),
        React.createElement(
          'button',
          {
            className: `tab-btn ${activeTab === 'shelters' ? 'active' : ''}`,
            style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
            onClick: () => setActiveTab('shelters')
          },
          React.createElement(Icons.Heart, { size: 14, color: 'var(--secondary-color)' }),
          'Shelters Leaderboard'
        ),
        React.createElement(
          'button',
          {
            className: `tab-btn ${activeTab === 'individuals' ? 'active' : ''}`,
            style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
            onClick: () => setActiveTab('individuals')
          },
          React.createElement(Icons.User, { size: 14 }),
          'Individuals Leaderboard'
        )
      ),
      loading
        ? React.createElement('div', { className: 'text-center' }, 'Loading scores...')
        : React.createElement(
            'table',
            { className: 'leaderboard-table' },
            React.createElement(
              'thead',
              null,
              React.createElement(
                'tr',
                null,
                React.createElement('th', { style: { width: '80px' } }, 'Rank'),
                React.createElement('th', null, 'Name'),
                React.createElement('th', { style: { textAlign: 'right' } }, 'Pickups'),
                activeTab === 'restaurants' && React.createElement('th', { style: { textAlign: 'right' } }, 'Kg Saved'),
                activeTab === 'shelters' && React.createElement('th', { style: { textAlign: 'right' } }, 'People Served'),
                activeTab === 'individuals' && React.createElement('th', { style: { textAlign: 'left', paddingLeft: '2rem' } }, 'Badges'),
                React.createElement('th', { style: { textAlign: 'right', width: '120px' } }, 'Score')
              )
            ),
            React.createElement(
              'tbody',
              null,
              currentLeaderboard.map((entry, index) =>
                React.createElement(
                  'tr',
                  { key: entry.id, className: 'leaderboard-row' },
                  React.createElement(
                    'td',
                    null,
                    React.createElement(
                      'span',
                      { className: `rank-badge ${getRankClass(index)}` },
                      index + 1
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.4rem', height: '40px' } },
                    index === 0 && React.createElement(Icons.Trophy, { size: 16, color: '#ffd700' }),
                    index === 1 && React.createElement(Icons.Trophy, { size: 16, color: '#c0c0c0' }),
                    index === 2 && React.createElement(Icons.Trophy, { size: 16, color: '#cd7f32' }),
                    entry.name
                  ),
                  React.createElement(
                    'td',
                    { style: { textAlign: 'right' } },
                    entry.completedPickups || 0
                  ),
                  activeTab === 'restaurants' && React.createElement(
                    'td',
                    { style: { textAlign: 'right', color: 'var(--text-secondary)' } },
                    entry.totalKgSaved !== undefined ? `${entry.totalKgSaved.toFixed(1)} kg` : '0.0 kg'
                  ),
                  activeTab === 'shelters' && React.createElement(
                    'td',
                    { style: { textAlign: 'right', color: 'var(--text-secondary)' } },
                    entry.peopleServed || 0
                  ),
                  activeTab === 'individuals' && React.createElement(
                    'td',
                    { style: { textAlign: 'left', paddingLeft: '2rem' } },
                    React.createElement(
                      'div',
                      { style: { display: 'flex', gap: '0.25rem', flexWrap: 'wrap' } },
                      entry.badges && entry.badges.map((badge, bIdx) =>
                        React.createElement(
                          'span',
                          { key: bIdx, className: 'badge badge-active', style: { fontSize: '0.7rem', padding: '0.15rem 0.4rem' } },
                          badge
                        )
                      ),
                      (!entry.badges || entry.badges.length === 0) && React.createElement(
                        'span',
                        { style: { fontSize: '0.8rem', color: 'var(--text-light)', fontStyle: 'italic' } },
                        'No badges yet'
                      )
                    )
                  ),
                  React.createElement(
                    'td',
                    { style: { textAlign: 'right', fontWeight: 'bold', color: 'var(--primary-color)' } },
                    `${entry.points} pts`
                  )
                )
              )
            )
          )
    )
  );
};

export default Leaderboard;
