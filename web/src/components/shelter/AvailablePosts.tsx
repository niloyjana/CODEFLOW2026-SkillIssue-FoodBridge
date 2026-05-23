import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { formatDate, formatPortions, formatWaste, capitalize } from 'shared/utils/format';
import Card from '../common/Card';
import Button from '../common/Button';

export const AvailablePosts: React.FC = () => {
  const { posts, claimPost, loading } = usePosts();

  const availablePosts = posts.filter((post) => post.status === 'active');

  if (loading && availablePosts.length === 0) {
    return React.createElement('div', { className: 'text-center' }, 'Loading available donations...');
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h2', { className: 'mb-2' }, 'Available Donations'),
    availablePosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'No active food posts available right now. Check back soon!')
        )
      : React.createElement(
          'div',
          { className: 'posts-list posts-list-grid', style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' } },
          availablePosts.map((post) =>
            React.createElement(
              'div',
              { key: post.id, className: 'card post-card' },
              React.createElement(
                'div',
                { className: 'flex justify-between align-center' },
                React.createElement('h3', { style: { fontSize: '1.2rem', color: 'var(--primary-color)' } }, post.restaurantName),
                React.createElement(
                  'span',
                  { className: 'badge badge-active' },
                  'ACTIVE'
                )
              ),
              React.createElement(
                'p',
                { style: { fontWeight: '600', margin: '0.5rem 0', fontSize: '1.1rem' } },
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
                  React.createElement('span', { className: 'meta-label' }, 'Venue'),
                  React.createElement('span', { className: 'meta-value' }, capitalize(post.venueType))
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Seating Capacity'),
                  React.createElement('span', { className: 'meta-value' }, post.seatingCapacity)
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Pickup By'),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.pickupBy))
                )
              ),
              React.createElement(
                'div',
                { className: 'waste-alert' },
                React.createElement('span', { className: 'waste-label' }, 'Est. Waste Saved:'),
                React.createElement('span', { className: 'waste-value' }, formatWaste(post.predictedWasteKg))
              ),
              React.createElement(
                Button,
                {
                  variant: 'primary',
                  fullWidth: true,
                  onClick: () => claimPost(post.id),
                  disabled: loading,
                },
                'Claim Pickup'
              )
            )
          )
        )
  );
};
export default AvailablePosts;
