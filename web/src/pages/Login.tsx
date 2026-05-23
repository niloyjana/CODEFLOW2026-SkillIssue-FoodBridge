import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login credentials submitted:', { email, role });
    setLoading(true);
    try {
      await login(email, role);
      if (role === 'restaurant') {
        navigate('/restaurant');
      } else {
        navigate('/individual');
      }
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserType, emailAddr: string) => {
    console.log('Quick login clicked:', { selectedRole, emailAddr });
    setLoading(true);
    try {
      await login(emailAddr, selectedRole);
      if (selectedRole === 'restaurant') {
        navigate('/restaurant');
      } else {
        navigate('/individual');
      }
    } catch (err) {
      console.error(err);
      alert('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    { className: 'auth-wrapper' },
    React.createElement(
      'div',
      { className: 'auth-card' },
      React.createElement(
        'div',
        { className: 'auth-header' },
        React.createElement('h1', { style: { fontFamily: 'var(--font-heading)' } }, 'FoodShare'),
        React.createElement('h2', null, 'Welcome Back')
      ),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement(
          'div',
          { className: 'auth-toggle-role' },
          React.createElement(
            'button',
            {
              type: 'button',
              className: `role-tab ${role === 'restaurant' ? 'active' : ''}`,
              onClick: () => setRole('restaurant')
            },
            'Restaurant'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: `role-tab ${role === 'individual' ? 'active' : ''}`,
              onClick: () => setRole('individual')
            },
            'Individual'
          )
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email Address'),
          React.createElement('input', {
            id: 'email',
            type: 'email',
            className: 'form-control',
            placeholder: role === 'restaurant' ? 'restaurant@foodshare.com' : 'individual@foodshare.com',
            value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            required: true,
          })
        ),
        React.createElement(
          Button,
          {
            type: 'submit',
            variant: 'primary',
            fullWidth: true,
            disabled: loading,
          },
          loading ? 'Logging In...' : 'Log In'
        )
      ),
      React.createElement(
        'div',
        { className: 'mt-2', style: { borderTop: '1px solid var(--border-light)', paddingTop: '1rem' } },
        React.createElement('p', { className: 'text-center form-label', style: { marginBottom: '0.5rem' } }, 'Quick Demo Logins'),
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '0.5rem' } },
          React.createElement(
            Button,
            {
              type: 'button',
              variant: 'secondary',
              className: 'role-tab',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.75rem' },
              onClick: () => handleQuickLogin('restaurant', 'restaurant@foodshare.com')
            },
            'As Restaurant'
          ),
          React.createElement(
            Button,
            {
              type: 'button',
              variant: 'secondary',
              className: 'role-tab',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.75rem' },
              onClick: () => handleQuickLogin('individual', 'individual@foodshare.com')
            },
            'As Individual'
          )
        )
      ),
      React.createElement(
        'div',
        { className: 'auth-footer' },
        "Don't have an account? ",
        React.createElement('a', { href: '/register', style: { color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' } }, 'Register here')
      )
    )
  );
};
export default Login;
