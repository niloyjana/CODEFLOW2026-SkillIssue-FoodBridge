import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantPage from './pages/RestaurantPage';
import ShelterPage from './pages/ShelterPage';
import LeaderboardPage from './pages/LeaderboardPage';

// Guard for authenticated users
const ProtectedRoute: React.FC<{ children?: React.ReactNode }> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return React.createElement('div', { className: 'text-center', style: { padding: '5rem' } }, 'Loading session...');
  }

  if (!user) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  return React.createElement(React.Fragment, null, children);
};

// Guard for role specific routes
const RoleRoute: React.FC<{ children?: React.ReactNode; allowedRole: 'restaurant' | 'shelter' }> = ({
  children,
  allowedRole,
}) => {
  const { user } = useAuth();

  if (!user) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  if (user.type !== allowedRole) {
    return React.createElement(Navigate, {
      to: user.type === 'restaurant' ? '/restaurant' : '/shelter',
      replace: true,
    });
  }

  return React.createElement(React.Fragment, null, children);
};

// Root redirect router
const RootRedirect: React.FC = () => {
  const { user } = useAuth();

  if (!user) {
    return React.createElement(Navigate, { to: '/login', replace: true });
  }

  return React.createElement(Navigate, {
    to: user.type === 'restaurant' ? '/restaurant' : '/shelter',
    replace: true,
  });
};

export const AppRoutes: React.FC = () => {
  return React.createElement(
    Routes,
    null,
    // Public routes (Auth) outside Layout or inside? Let's render everything inside Layout for styling consistency
    React.createElement(
      Route,
      {
        path: '/login',
        element: React.createElement(Layout, null, React.createElement(Login, null))
      }
    ),
    React.createElement(
      Route,
      {
        path: '/register',
        element: React.createElement(Layout, null, React.createElement(Register, null))
      }
    ),

    // Protected application routes
    React.createElement(
      Route,
      {
        path: '/',
        element: React.createElement(
          ProtectedRoute,
          null,
          React.createElement(RootRedirect, null)
        )
      }
    ),
    React.createElement(
      Route,
      {
        path: '/restaurant',
        element: React.createElement(
          ProtectedRoute,
          null,
          React.createElement(
            RoleRoute,
            { allowedRole: 'restaurant' },
            React.createElement(Layout, null, React.createElement(RestaurantPage, null))
          )
        )
      }
    ),
    React.createElement(
      Route,
      {
        path: '/shelter',
        element: React.createElement(
          ProtectedRoute,
          null,
          React.createElement(
            RoleRoute,
            { allowedRole: 'shelter' },
            React.createElement(Layout, null, React.createElement(ShelterPage, null))
          )
        )
      }
    ),
    React.createElement(
      Route,
      {
        path: '/leaderboard',
        element: React.createElement(Layout, null, React.createElement(LeaderboardPage, null))
      }
    ),

    // Fallback redirect
    React.createElement(
      Route,
      {
        path: '*',
        element: React.createElement(Navigate, { to: '/', replace: true })
      }
    )
  );
};
export default AppRoutes;
