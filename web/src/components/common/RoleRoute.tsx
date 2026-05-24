import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { UserType } from 'shared/types';

interface RoleRouteProps {
  children?: React.ReactNode;
  allowedTypes: UserType[];
}

export const RoleRoute: React.FC<RoleRouteProps> = ({ children, allowedTypes }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement(
      'div',
      { className: 'text-center', style: { padding: '5rem', color: 'var(--text-secondary)' } },
      'Loading session...'
    );
  }

  if (!user) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  if (!allowedTypes.includes(user.type)) {
    let redirectPath = '/';
    if (user.type === 'restaurant') redirectPath = '/restaurant';
    else if (user.type === 'shelter') redirectPath = '/shelter';
    else if (user.type === 'individual') redirectPath = '/individual';
    
    return React.createElement(Navigate, { to: redirectPath, replace: true });
  }

  return React.createElement(React.Fragment, null, children);
};

export default RoleRoute;
