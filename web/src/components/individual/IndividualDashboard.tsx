import React from 'react';
import { usePosts } from '../../hooks/usePosts';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions } from 'shared/utils/format';
import Card from '../common/Card';
import Icons from '../common/Icons';

export const IndividualDashboard: React.FC = () => {
  const { posts, loading } = usePosts();
  const { user } = useAuth();

  // Filter posts created by the current individual volunteer
  const myPosts = posts.filter((post) => post.restaurantId === user?.id);

  if (loading && myPosts.length === 0) {
    return React.createElement('div', { className: 'text-center' }, 'Loading dashboard...');
  }

  return React.createElement(
    'div',
    null,
    React.createElement(
      Card,
      { 
        title: 'Volunteer Profile',
        className: 'glass-panel hover-lift'
      },
      React.createElement(
        'div',
        { className: 'flex justify-between align-center mt-2' },
        React.createElement(
          'div',
          null,
          React.createElement('h4', { style: { fontSize: '1.4rem', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } }, 
            React.createElement(Icons.User, { size: 20 }),
            user?.name
          ),
          React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' } }, user?.email),
          user?.phone && React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' } }, `Phone: ${user.phone}`),
          user?.address && React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.2rem' } }, 
            React.createElement(Icons.MapPin, { size: 14, color: 'var(--primary-color)' }),
            `Address: ${user.address}`
          )
        ),
        React.createElement(
          'div',
          { className: 'text-center' },
          React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.2rem', justifyContent: 'center' } }, 
            React.createElement(Icons.Award, { size: 14, color: 'var(--secondary-color)' }),
            'Impact Points'
          ),
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
          myPosts.length >= 15 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#ffd700', color: '#5d4037' } }, '🏆 Surplus Savior'),
          myPosts.length >= 10 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#c0c0c0', color: '#333' } }, '🥇 Community Hero'),
          myPosts.length >= 5 && React.createElement('span', { className: 'badge', style: { backgroundColor: '#cd7f32', color: '#fff' } }, '🥈 Consistent Packer'),
          myPosts.length > 0 && React.createElement('span', { className: 'badge badge-active' }, '🌟 First Step'),
          myPosts.length === 0 && React.createElement('span', { style: { fontSize: '0.85rem', color: 'var(--text-light)', fontStyle: 'italic' } }, 'Post a donation to earn badges!')
        )
      )
    ),
    React.createElement('h3', { className: 'mt-2 mb-2' }, 'Your Excess Food Posts'),
    myPosts.length === 0
      ? React.createElement(
          Card,
          null,
          React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'You have not posted any food donations yet. Use the form above to submit one!')
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
                post.claimedByName ? `Claimed by ${post.claimedByName} shelter.` : 'Claimed by a shelter and scheduled for pickup.'
              )
            )
          )
        )
  );
};

const formatWaste = (kg: number): string => `${kg.toFixed(1)} kg`;

export default IndividualDashboard;
