import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import IndividualDashboard from '../components/individual/IndividualDashboard';
import AvailablePosts from '../components/individual/AvailablePosts';

export const IndividualPage: React.FC = () => {
  const { user } = useAuth();
  const { posts } = usePosts();

  const claimedPosts = posts.filter(p => p.claimedBy === user?.id);
  const activePickups = claimedPosts.filter(p => p.status === 'claimed').length;
  const totalWasteSaved = claimedPosts.reduce((acc, p) => acc + p.predictedWasteKg, 0);

  return React.createElement(
    'div',
    null,
    // PORTAL HEADER BANNER
    React.createElement(
      'div',
      {
        className: 'glass-panel hover-lift shimmer-card mask-reveal delay-1',
        style: {
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(76,175,80,0.05) 0%, rgba(33,150,243,0.05) 100%)',
          border: '1px solid rgba(76,175,80,0.12)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }
      },
      React.createElement(
        'div',
        null,
        React.createElement('h1', { style: { fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.2rem' } }, `Welcome back, ${user?.name || 'Volunteer Partner'}!`),
        React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.95rem' } }, 'Coordinate claimed pickups and review your community impact metrics.')
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' } },
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(76,175,80,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'Active Pickups'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' } }, activePickups)
        ),
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(76,175,80,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'Points Earned'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--secondary-color)' } }, `${user?.points || 0} pts`)
        ),
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(76,175,80,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'Waste Saved'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' } }, `${totalWasteSaved.toFixed(1)} kg`)
        )
      )
    ),
    React.createElement(
      'div',
      { className: 'dashboard-grid mask-reveal delay-2' },
      React.createElement(IndividualDashboard, null),
      React.createElement(AvailablePosts, null)
    )
  );
};

export default IndividualPage;

