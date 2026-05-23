import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions, formatWaste } from 'shared/utils/format';
import Card from '../common/Card';
import Icons from '../common/Icons';

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
              { key: post.id, className: `card post-card glass-panel hover-lift ${post.status === 'claimed' ? 'claimed' : ''}` },
              React.createElement(
                'div',
                { className: 'flex justify-between align-center' },
                React.createElement('h4', { style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } }, 
                  React.createElement(Icons.Utensils, { size: 16, color: 'var(--primary-color)' }),
                  formatPortions(post.portions)
                ),
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
                  React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                    React.createElement(Icons.Calendar, { size: 12 }),
                    'Posted At'
                  ),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.createdAt))
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                    React.createElement(Icons.Calendar, { size: 12, color: 'var(--secondary-color)' }),
                    'Pickup By'
                  ),
                  React.createElement('span', { className: 'meta-value', style: { color: 'var(--secondary-color)' } }, formatDate(post.pickupBy))
                )
              ),
              React.createElement(
                'div',
                { className: 'waste-alert', style: { display: 'flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(76, 175, 80, 0.08)', border: '1px solid rgba(76, 175, 80, 0.15)', borderRadius: 'var(--radius-sm)' } },
                React.createElement(Icons.Leaf, { size: 16, color: 'var(--primary-color)' }),
                React.createElement('span', { className: 'waste-label', style: { flex: 1 } }, 'AI Waste Prediction Avoided:'),
                React.createElement('span', { className: 'waste-value', style: { fontWeight: '700', color: 'var(--primary-color)' } }, formatWaste(post.predictedWasteKg))
              ),
              post.status === 'claimed' && React.createElement(
                'p',
                { style: { fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem' } },
                React.createElement(Icons.CheckCircle, { size: 14 }),
                'Claimed by a volunteer and scheduled for pickup.'
              )
            )
          )
        )
  );
};
export default RestaurantDashboard;
