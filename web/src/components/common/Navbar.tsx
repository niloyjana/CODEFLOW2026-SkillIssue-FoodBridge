import React, { useState, useEffect, useRef } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import Icons from './Icons';
import { useNotifications } from '../../hooks/useNotifications';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    if (dropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [dropdownOpen]);

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
    { className: 'navbar nav-mask-reveal' },
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
      user && user.type === 'restaurant' && React.createElement(
        NavLink,
        {
          to: '/restaurant',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Dashboard'
      ),
      user && user.type === 'shelter' && React.createElement(
        NavLink,
        {
          to: '/shelter',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Available Food'
      ),
      user && user.type === 'individual' && React.createElement(
        NavLink,
        {
          to: '/individual',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`
        },
        'Donate Food'
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
      user ? React.createElement(
        'div',
        { className: 'nav-user-info' },
        // Notification bell dropdown for donators
        (user.type === 'restaurant' || user.type === 'individual') && React.createElement(
          'div',
          { 
            ref: dropdownRef,
            style: { position: 'relative', display: 'flex', alignItems: 'center' }
          },
          React.createElement(
            'div',
            {
              className: 'notification-bell-container',
              onClick: () => setDropdownOpen(!dropdownOpen),
              title: 'Notifications'
            },
            React.createElement(Icons.Bell, { size: 20 }),
            unreadCount > 0 && React.createElement(
              'span',
              { className: 'notification-badge' },
              unreadCount
            )
          ),
          dropdownOpen && React.createElement(
            'div',
            { className: 'notification-dropdown glass-panel' },
            React.createElement(
              'div',
              { className: 'notification-dropdown-header' },
              React.createElement('h4', null, 'Notifications'),
              unreadCount > 0 && React.createElement(
                'button',
                { className: 'btn-mark-all', onClick: () => { markAllAsRead(); } },
                'Mark all as read'
              )
            ),
            React.createElement(
              'div',
              { className: 'notification-list' },
              notifications.length === 0 ? React.createElement(
                'div',
                { className: 'notification-empty' },
                'No notifications yet'
              ) : notifications.map(n => React.createElement(
                'div',
                {
                  key: n.id,
                  className: `notification-item ${n.read ? '' : 'unread'}`,
                  onClick: () => { if (!n.read) markAsRead(n.id); }
                },
                React.createElement(
                  'span',
                  { className: 'notification-item-title' },
                  n.title
                ),
                React.createElement(
                  'span',
                  { className: 'notification-item-message' },
                  n.message
                ),
                React.createElement(
                  'span',
                  { className: 'notification-item-time' },
                  new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ' · ' + new Date(n.createdAt).toLocaleDateString()
                )
              ))
            )
          )
        ),
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
