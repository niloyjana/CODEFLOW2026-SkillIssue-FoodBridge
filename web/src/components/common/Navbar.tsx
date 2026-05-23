import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return React.createElement(
    'nav',
    { className: 'navbar' },
    React.createElement(
      NavLink,
      { to: '/', className: 'navbar-brand' },
      'FoodShare',
      React.createElement('span', null, 'Hackathon')
    ),
    React.createElement(
      'div',
      { className: 'navbar-links' },
      user && user.type === 'restaurant' && React.createElement(
        NavLink,
        {
          to: '/restaurant',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Restaurant'
      ),
      user && user.type === 'shelter' && React.createElement(
        NavLink,
        {
          to: '/shelter',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Shelter'
      ),
      React.createElement(
        NavLink,
        {
          to: '/leaderboard',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Leaderboard'
      ),
      user ? React.createElement(
        'div',
        { className: 'nav-user-info' },
        React.createElement(
          'span',
          { className: 'user-badge' },
          user.type
        ),
        React.createElement(
          'span',
          { className: 'user-points' },
          `${user.points} pts`
        ),
        React.createElement(
          'button',
          { onClick: handleLogout, className: 'btn btn-secondary', style: { padding: '0.4rem 0.8rem', fontSize: '0.8rem' } },
          'Logout'
        )
      ) : React.createElement(
        React.Fragment,
        null,
        React.createElement(
          NavLink,
          {
            to: '/login',
            className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
          },
          'Login'
        ),
        React.createElement(
          NavLink,
          {
            to: '/register',
            className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
          },
          'Register'
        )
      )
    )
  );
};
export default Navbar;
