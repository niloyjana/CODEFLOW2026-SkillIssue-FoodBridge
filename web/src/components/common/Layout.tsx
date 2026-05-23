import React from 'react';
import { useLocation } from 'react-router-dom';
import Navbar from './Navbar';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  return React.createElement(
    'div',
    { className: 'app-container' },
    React.createElement(Navbar, null),
    React.createElement(
      'main',
      {
        className: isAuthPage ? '' : 'main-content',
        style: isAuthPage ? { width: '100%', maxWidth: '100%', padding: '0', margin: '0' } : undefined
      },
      children
    )
  );
};

export default Layout;
