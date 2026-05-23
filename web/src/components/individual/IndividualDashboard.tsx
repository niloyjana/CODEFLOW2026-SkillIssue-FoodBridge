import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions } from 'shared/utils/format';
import Card from '../common/Card';

export const IndividualDashboard: React.FC = () => {
  const { posts } = usePosts();
  const { user } = useAuth();

  // Filter posts claimed by the current individual
  const claimedPosts = posts.filter((post) => post.claimedBy === user?.id);

  return React.createElement(
    'div',
    null,
    React.createElement(
      Card,
      { title: 'Volunteer Profile' },
      React.createElement(
        'div',
        { className: 'flex justify-between align-center mt-2' },
        React.createElement(
          'div',
          null,
          React.createElement('h4', { style: { fontSize: '1.4rem', color: 'var(--primary-color)' } }, user?.name),
          React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.9rem' } }, user?.email),
          user?.phone && React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } }, `Phone: ${user.phone}`),
          user?.address && React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } }, `Address: ${user.address}`)
        ),
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem' } }, 'Impact Points'),
          React.createElement('h4', { style: { fontSize: '1.8rem', color: 'var(--secondary-color)', fontWeight: 'bold' } }, `${user?.points || 0} pts`)
        )
      ),
      React.createElement('hr', { style: { margin: '1rem 0', borderColor: 'var(--border-light)', borderStyle: 'solid', borderWidth: '1px 0 0 0' } }),
      React.createElement(
        'div',
        null,
        React.createElement('p', { className: 'form-label', style: { marginBottom: '0.5rem' } }, 'Earned Badges'),
        React.createElement(
          'div',
          { className: 'flex gap-1', style: { flexWrap: 'wrap' } },
          claimedPosts.length >= 15 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#ffd700', color: '#5d4037' } }, '🏆 Surplus Savior'),
          claimedPosts.length >= 10 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#c0c0c0', color: '#333' } }, '🥇 Community Hero'),
          claimedPosts.length >= 5 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#cd7f32', color: '#fff' } }, '🥈 Consistent Packer'),
          claimedPosts.length > 0 && React.createElement('span', { className: 'badge badge-active' }, '🌟 First Step'),
          claimedPosts.length === 0 && React.createElement('span', { style: { fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' } }, 'Claim a pickup to earn badges!')
        )
      )
    ),
    React.createElement('h3', { className: 'mt-2 mb-2' }, 'Your Claimed Pickups'),
    claimedPosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'You have not claimed any pickups yet. Browse active posts on the right!')
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
                  post.status.toUpperCase()
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
                post.address && React.createElement(
                  'div',
                  { className: 'meta-item', style: { gridColumn: 'span 2' } },
                  React.createElement('span', { className: 'meta-label' }, 'Pickup Address'),
                  React.createElement('span', { className: 'meta-value' }, post.address)
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Pickup Deadline'),
                  React.createElement('span', { className: 'meta-value' }, formatDate(post.pickupBy))
                ),
                React.createElement(
                  'div',
                  { className: 'meta-item' },
                  React.createElement('span', { className: 'meta-label' }, 'Waste Saved'),
                  React.createElement('span', { className: 'meta-value' }, formatWaste(post.predictedWasteKg))
                )
              )
            )
          )
        )
  );
};

// Internal formatting utility for local mapping inside components if not loaded
const formatWaste = (kg: number): string => `${kg.toFixed(1)} kg`;

export default IndividualDashboard;
