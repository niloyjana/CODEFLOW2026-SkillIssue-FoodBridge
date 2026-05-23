import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { formatDate, formatPortions } from 'shared/utils/format';
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
    React.createElement('h2', { className: 'mb-2' }, 'Available Food Donations'),
    availablePosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'No active food posts available right now. Check back later!')
        )
      : React.createElement(
          'div',
          { className: 'posts-list' },
          availablePosts.map((post) =>
            React.createElement(
              'div',
              { key: post.id, className: 'card post-card' },
              React.createElement(
                'div',
                { className: 'flex justify-between align-center' },
                React.createElement('h3', { style: { fontSize: '1.25rem', color: 'var(--primary-color)' } }, post.restaurantName),
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
                post.address && React.createElement(
                  'div',
                  { className: 'meta-item', style: { gridColumn: 'span 2' } },
                  React.createElement('span', { className: 'meta-label' }, 'Location Address'),
                  React.createElement('span', { className: 'meta-value' }, post.address)
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Pickup By'),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.pickupBy))
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Est. Waste Saved'),
                  React.createElement('span', { className: 'meta-value' }, `${post.predictedWasteKg} kg`)
                )
              ),
              React.createElement(
                Button,
                {
                  variant: 'primary',
                  fullWidth: true,
                  onClick: () => claimPost(post.id),
                  disabled: loading,
                },
                'Claim for Pickup'
              )
            )
          )
        )
  );
};
export default AvailablePosts;
