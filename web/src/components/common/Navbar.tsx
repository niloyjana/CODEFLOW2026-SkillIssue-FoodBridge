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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
      { to: '/', className: 'navbar-brand', style: { padding: 0 } },
      React.createElement('img', { 
        src: '/logo.png', 
        alt: 'FoodBridge Logo', 
        style: { height: '40px', objectFit: 'contain' } 
      }),
      'Food',
      React.createElement('span', null, 'Bridge')
    ),
    React.createElement(
      'button',
      {
        className: 'navbar-toggle',
        onClick: () => setMobileMenuOpen(!mobileMenuOpen),
        style: {
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          color: 'var(--text-primary)',
          padding: '0.5rem',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 5100
        }
      },
      React.createElement(mobileMenuOpen ? Icons.X : Icons.Menu, { size: 24 })
    ),
    React.createElement(
      'div',
      { className: `navbar-links ${mobileMenuOpen ? 'mobile-open' : ''}` },
      user && user.type === 'restaurant' && React.createElement(
        NavLink,
        {
          to: '/restaurant',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`,
          onClick: () => setMobileMenuOpen(false)
        },
        'Dashboard'
      ),
      user && user.type === 'shelter' && React.createElement(
        NavLink,
        {
          to: '/shelter',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`,
          onClick: () => setMobileMenuOpen(false)
        },
        'Available Food'
      ),
      user && user.type === 'individual' && React.createElement(
        NavLink,
        {
          to: '/individual',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`,
          onClick: () => setMobileMenuOpen(false)
        },
        'Donate Food'
      ),
      React.createElement(
        NavLink,
        {
          to: '/leaderboard',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`,
          onClick: () => setMobileMenuOpen(false)
        },
        'Leaderboard'
      ),
      React.createElement(
        'a',
        {
          href: '/#about-us',
          onClick: (e: any) => { handleAboutClick(e); setMobileMenuOpen(false); },
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
            onClick: () => { handleLogout(); setMobileMenuOpen(false); }, 
            className: 'btn btn-secondary', 
            style: { padding: '0.4rem 0.8rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-heading)' } 
          },
          React.createElement(Icons.LogOut, { size: 14 }),
          'Logout'
        )
      ) : React.createElement(
        NavLink,
        {
          to: '/login',
          className: ({ isActive }) => `nav-link ${isActive ? 'active' : ''}`,
          onClick: () => setMobileMenuOpen(false)
        },
        'Sign in'
      )
    )
  );
};
export default Navbar;
