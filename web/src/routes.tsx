import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/common/Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import RestaurantPage from './pages/RestaurantPage';
import IndividualPage from './pages/IndividualPage';
import ShelterPage from './pages/ShelterPage';
import LeaderboardPage from './pages/LeaderboardPage';
import LandingPage from './pages/LandingPage';
import RoleRoute from './components/common/RoleRoute';

export const AppRoutes: React.FC = () => {
  return React.createElement(
    Routes,
    null,
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
        element: React.createElement(Layout, null, React.createElement(LandingPage, null))
      }
    ),
    React.createElement(
      Route,
      {
        path: '/restaurant',
        element: React.createElement(
          RoleRoute,
          { allowedTypes: ['restaurant'] },
          React.createElement(Layout, null, React.createElement(RestaurantPage, null))
        )
      }
    ),
    React.createElement(
      Route,
      {
        path: '/shelter',
        element: React.createElement(
          RoleRoute,
          { allowedTypes: ['shelter'] },
          React.createElement(Layout, null, React.createElement(ShelterPage, null))
        )
      }
    ),
    React.createElement(
      Route,
      {
        path: '/individual',
        element: React.createElement(
          RoleRoute,
          { allowedTypes: ['individual'] },
          React.createElement(Layout, null, React.createElement(IndividualPage, null))
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
