import React from 'react';
import AvailablePosts from '../components/shelter/AvailablePosts';
import ShelterDashboard from '../components/shelter/ShelterDashboard';

export const ShelterPage: React.FC = () => {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '0.5rem' } }, 'Shelter Dispatch Portal'),
    React.createElement(
      'p',
      { style: { color: 'var(--text-secondary)', marginBottom: '1.5rem' } },
      'Coordinate and claim hot surplus meals prepared by local restaurant partners.'
    ),
    React.createElement(
      'div',
      { className: 'dashboard-grid' },
      React.createElement(ShelterDashboard, null),
      React.createElement(AvailablePosts, null)
    )
  );
};
export default ShelterPage;
