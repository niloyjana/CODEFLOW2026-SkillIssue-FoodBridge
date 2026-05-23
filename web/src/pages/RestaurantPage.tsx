import React from 'react';
import PostForm from '../components/restaurant/PostForm';
import RestaurantDashboard from '../components/restaurant/RestaurantDashboard';

export const RestaurantPage: React.FC = () => {
  return React.createElement(
    'div',
    null,
    React.createElement('h1', { style: { marginBottom: '0.5rem' } }, 'Restaurant Portal'),
    React.createElement(
      'p',
      { style: { color: 'var(--text-secondary)', marginBottom: '1.5rem' } },
      'Optimize surplus food disposal and submit predicted waste metrics.'
    ),
    React.createElement(
      'div',
      { className: 'dashboard-grid' },
      React.createElement(PostForm, null),
      React.createElement(RestaurantDashboard, null)
    )
  );
};
export default RestaurantPage;
