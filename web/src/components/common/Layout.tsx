import React from 'react';
import Navbar from './Navbar';

interface LayoutProps {
  children?: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return React.createElement(
    'div',
    { className: 'app-container' },
    React.createElement(Navbar, null),
    React.createElement('main', { className: 'main-content' }, children)
  );
};
export default Layout;
