import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions, capitalize } from 'shared/utils/format';
import Card from '../common/Card';

export const ShelterDashboard: React.FC = () => {
  const { posts } = usePosts();
  const { user } = useAuth();

  // Filter posts claimed by the current shelter
  const claimedPosts = posts.filter((post) => post.claimedBy === user?.id);

  return React.createElement(
    'div',
    null,
    React.createElement(
      Card,
      { title: 'Shelter Overview' },
      React.createElement(
        'div',
        { className: 'flex justify-between align-center mt-2' },
        React.createElement(
          'div',
          null,
          React.createElement('p', { style: { color: 'var(--text-secondary)' } }, 'Logged in as'),
          React.createElement('h4', { style: { fontSize: '1.25rem', color: 'var(--primary-color)' } }, user?.name)
        ),
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('p', { style: { color: 'var(--text-secondary)' } }, 'Impact Points'),
          React.createElement('h4', { style: { fontSize: '1.75rem', color: 'var(--secondary-color)' } }, `${user?.points} pts`)
        )
      )
    ),
    React.createElement('h3', { className: 'mt-2 mb-2' }, 'Your Claimed Pickups'),
    claimedPosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'You have not claimed any pickups yet. Start claiming above!')
        )
      : React.createElement(
          'div',
          { className: 'posts-list' },
          claimedPosts.map((post) =>
            React.createElement(
              'div',
              { key: post.id, className: 'card post-card claimed' },
              React.createElement(
                'div',
                { className: 'flex justify-between align-center' },
                React.createElement('h4', null, post.restaurantName),
                React.createElement(
                  'span',
                  { className: 'badge badge-claimed' },
                  'CLAIMED'
                )
              ),
              React.createElement(
                'p',
                { style: { margin: '0.5rem 0', fontWeight: '600' } },
                formatPortions(post.portions)
              ),
              React.createElement(
                'div',
                { className: 'post-meta-grid' },
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Meal Time'),
                  React.createElement('span', { className: 'meta-value' }, capitalize(post.mealTime))
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Pickup Time limit'),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.pickupBy))
                )
              )
            )
          )
        )
  );
};
export default ShelterDashboard;
