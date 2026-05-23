import React, { useState } from 'react';
import { useLeaderboard } from '../../hooks/useLeaderboard';
import Card from '../common/Card';

export const Leaderboard: React.FC = () => {
  const { restaurantLeaderboard, shelterLeaderboard, loading } = useLeaderboard();
  const [activeTab, setActiveTab] = useState<'restaurants' | 'shelters'>('restaurants');

  const currentLeaderboard = activeTab === 'restaurants' ? restaurantLeaderboard : shelterLeaderboard;

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
      null,
      React.createElement(
        'div',
        { className: 'tabs-container' },
        React.createElement(
          'button',
          {
            className: `tab-btn ${activeTab === 'restaurants' ? 'active' : ''}`,
            onClick: () => setActiveTab('restaurants')
          },
          'Restaurants Leaderboard'
        ),
        React.createElement(
          'button',
          {
            className: `tab-btn ${activeTab === 'shelters' ? 'active' : ''}`,
            onClick: () => setActiveTab('shelters')
          },
          'Shelters Leaderboard'
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
                React.createElement('th', { style: { textAlign: 'right' } }, activeTab === 'restaurants' ? 'Posts' : 'Claims'),
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
                    { style: { fontWeight: '600' } },
                    entry.name
                  ),
                  React.createElement(
                    'td',
                    { style: { textAlign: 'right' } },
                    entry.completedPickups || 0
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
