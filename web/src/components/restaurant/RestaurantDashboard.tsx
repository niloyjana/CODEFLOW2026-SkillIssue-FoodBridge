import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions, formatWaste } from 'shared/utils/format';
import Card from '../common/Card';

export const RestaurantDashboard: React.FC = () => {
  const { posts, loading } = usePosts();
  const { user } = useAuth();

  // Filter posts created by the current restaurant
  const myPosts = posts.filter((post) => post.restaurantId === user?.id);

  if (loading && myPosts.length === 0) {
    return React.createElement('div', { className: 'text-center' }, 'Loading dashboard...');
  }

  return React.createElement(
    'div',
    null,
    React.createElement('h2', { className: 'mb-2' }, 'Active Food Posts'),
    myPosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'You have not posted any food donations yet. Use the form to submit one!')
        )
      : React.createElement(
          'div',
          { className: 'posts-list' },
          myPosts.map((post) =>
            React.createElement(
              'div',
              { key: post.id, className: `card post-card ${post.status === 'claimed' ? 'claimed' : ''}` },
              React.createElement(
                'div',
                { className: 'flex justify-between align-center' },
                React.createElement('h4', null, formatPortions(post.portions)),
                React.createElement(
                  'span',
                  { className: `badge badge-${post.status}` },
                  post.status.toUpperCase()
                )
              ),
              React.createElement(
                'div',
                { className: 'post-meta-grid' },
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Posted At'),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.createdAt))
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
                React.createElement('span', { className: 'waste-label' }, 'AI Waste Prediction Avoided:'),
                React.createElement('span', { className: 'waste-value' }, formatWaste(post.predictedWasteKg))
              ),
              post.status === 'claimed' && React.createElement(
                'p',
                { style: { fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: '600' } },
                'claimed by a volunteer and scheduled for pickup.'
              )
            )
          )
        )
  );
};
export default RestaurantDashboard;
