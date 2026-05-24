import React from 'react';
import { createPortal } from 'react-dom';
import { useAuth } from '../../hooks/useAuth';
import { formatDate, formatPortions, formatSurplus } from 'shared/utils/format';
import Card from '../common/Card';
import Button from '../common/Button';
import Icons from '../common/Icons';

interface RestaurantDashboardProps {
  posts: any[];
  loading: boolean;
  onDeletePost?: (postId: string, reason: string) => Promise<void>;
}

export const RestaurantDashboard: React.FC<RestaurantDashboardProps> = ({ posts, loading, onDeletePost }) => {
  const { user } = useAuth();
  const [deletePostId, setDeletePostId] = React.useState<string | null>(null);
  const [deleteReason, setDeleteReason] = React.useState<string>('Food no longer available');
  const [customReason, setCustomReason] = React.useState<string>('');
  const [deleting, setDeleting] = React.useState<boolean>(false);

  // Filter posts created by the current restaurant (excl. deleted)
  const myPosts = posts.filter((post) => post.restaurantId === user?.id && post.status !== 'deleted');

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
                React.createElement('span', { className: 'waste-label', style: { flex: 1 } }, 'AI Surplus Saved:'),
                React.createElement('span', { className: 'waste-value', style: { fontWeight: '700', color: 'var(--primary-color)' } }, formatSurplus(post.predictedSurplusKg))
              ),
              post.status === 'claimed' && React.createElement(
                'p',
                { style: { fontSize: '0.85rem', color: 'var(--secondary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem' } },
                React.createElement(Icons.CheckCircle, { size: 14 }),
                'Claimed by a volunteer and scheduled for pickup.'
              ),
              post.status === 'active' && React.createElement(
                'div',
                { style: { marginTop: '1rem', display: 'flex', justifyContent: 'flex-end' } },
                React.createElement(
                  Button,
                  {
                    variant: 'danger',
                    onClick: () => {
                      setDeletePostId(post.id);
                      setDeleteReason('Food no longer available');
                      setCustomReason('');
                    },
                    style: { display: 'inline-flex', alignItems: 'center', gap: '0.3rem', padding: '0.4rem 0.8rem', fontSize: '0.85rem' }
                  },
                  React.createElement(Icons.Trash, { size: 14 }),
                  'Delete Post'
                )
              )
            )
          )
        ),
    deletePostId && createPortal(
      React.createElement(
        'div',
        {
          style: {
            position: 'fixed',
            top: 0,
            left: 0,
            width: '100vw',
            height: '100vh',
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(5px)',
          zIndex: 99999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center'
        }
      },
      React.createElement(
        'div',
        {
          className: 'glass-panel',
          style: {
            background: 'var(--surface-light)',
            borderRadius: 'var(--radius-md)',
            padding: '2rem',
            border: '1px solid var(--border-light)',
            maxWidth: '420px',
            width: '90%',
            boxShadow: 'var(--shadow-lg)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }
        },
        React.createElement('h3', { style: { fontFamily: 'var(--font-heading)', color: 'var(--danger)', fontSize: '1.4rem' } }, 'Delete Food Donation'),
        React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.95rem' } }, 'Are you sure you want to delete this donation post? This action will reverse points and cannot be undone.'),
        
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'deleteReason' }, 'Reason for deletion'),
          React.createElement(
            'select',
            {
              id: 'deleteReason',
              className: 'form-control glow-focus',
              value: deleteReason,
              onChange: (e: any) => setDeleteReason(e.target.value)
            },
            React.createElement('option', { value: 'Food no longer available' }, 'Food no longer available'),
            React.createElement('option', { value: 'Incorrect details entered' }, 'Incorrect details entered'),
            React.createElement('option', { value: 'Restaurant closed early' }, 'Restaurant closed early'),
            React.createElement('option', { value: 'Other' }, 'Other')
          )
        ),
        
        deleteReason === 'Other' && React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'customReason' }, 'Please specify the reason'),
          React.createElement('textarea', {
            id: 'customReason',
            className: 'form-control glow-focus',
            style: { minHeight: '80px', resize: 'vertical' },
            placeholder: 'Type your deletion reason here...',
            value: customReason,
            onChange: (e: any) => setCustomReason(e.target.value),
            required: true
          })
        ),
        
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '0.5rem' } },
          React.createElement(
            Button,
            {
              variant: 'secondary',
              onClick: () => setDeletePostId(null),
              disabled: deleting
            },
            'Cancel'
          ),
          React.createElement(
            Button,
            {
              variant: 'danger',
              disabled: deleting || (deleteReason === 'Other' && !customReason.trim()),
              onClick: async () => {
                const finalReason = deleteReason === 'Other' ? customReason.trim() : deleteReason;
                if (!finalReason) return;
                setDeleting(true);
                try {
                  if (onDeletePost) {
                    await onDeletePost(deletePostId, finalReason);
                  }
                  setDeletePostId(null);
                } catch (err) {
                  console.error(err);
                } finally {
                  setDeleting(false);
                }
              }
            },
            deleting ? 'Deleting...' : 'Confirm Delete'
          )
        )
      )
    ),
    document.body
  )
);
};

export default RestaurantDashboard;
