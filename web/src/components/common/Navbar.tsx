import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icons from './Icons';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const handleAboutClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (window.location.pathname === '/') {
      const el = document.getElementById('about-us');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    } else {
      navigate('/#about-us');
    }
  };

  return React.createElement(
    'nav',
    {
      className: 'navbar nav-mask-reveal',
      style: {
        background: 'rgba(255, 255, 255, 0.75)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderBottom: '1px solid rgba(76, 175, 80, 0.1)',
        padding: '0.8rem 2rem'
      }
    },
    React.createElement(
      NavLink,
      { to: '/', className: 'navbar-brand' },
      React.createElement(Icons.Logo, { size: 28, style: { marginRight: '0.4rem', filter: 'drop-shadow(0 2px 4px rgba(46,125,50,0.25))' } }),
      'Food',
      React.createElement('span', null, 'Bridge')
    ),
    React.createElement(
      'div',
      { className: 'navbar-links' },
      user ? React.createElement(
        React.Fragment,
        null,
        user.type === 'restaurant' && React.createElement(
          NavLink,
          {
            to: '/restaurant',
            className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
          },
          'Dashboard'
        ),
        user.type === 'individual' && React.createElement(
          NavLink,
          {
            to: '/individual',
            className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
          },
          'Dashboard'
        ),
        React.createElement(
          NavLink,
          {
            to: '/leaderboard',
            className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
          },
          'Leaderboard'
        ),
        React.createElement(
          'a',
          {
            href: '/#about-us',
            onClick: handleAboutClick,
            className: 'nav-link',
            style: { cursor: 'pointer' }
          },
          'About Us'
        ),
        React.createElement(
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
            {
              onClick: handleLogout,
              className: 'btn btn-secondary',
              style: { padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' }
            },
            React.createElement(Icons.LogOut, { size: 14 }),
            'Logout'
          )
        )
      ) : React.createElement(
        NavLink,
        {
          to: '/login',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Login'
      )
    )
  );
};

export default Navbar;
