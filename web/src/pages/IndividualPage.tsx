import React from 'react';
import IndividualDashboard from '../components/individual/IndividualDashboard';
import AvailablePosts from '../components/individual/AvailablePosts';

export const IndividualPage: React.FC = () => {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '0.5rem' } }, 'Volunteer Hub'),
    React.createElement(
      'p',
      { style: { color: 'var(--text-secondary)', marginBottom: '1.5rem' } },
      'Browse, claim, and coordinate pickups for active surplus food posts.'
    ),
    React.createElement(
      'div',
      { className: 'dashboard-grid' },
      React.createElement(IndividualDashboard, null),
      React.createElement(AvailablePosts, null)
    )
  );
};
export default IndividualPage;
