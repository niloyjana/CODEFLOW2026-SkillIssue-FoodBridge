import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';
import Icons from '../components/common/Icons';

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
      if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'shelter') navigate('/shelter');
      else navigate('/individual');
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
      if (selectedRole === 'restaurant') navigate('/restaurant');
      else if (selectedRole === 'shelter') navigate('/shelter');
      else navigate('/individual');
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
      { className: 'auth-card glass-panel hover-lift' },
      React.createElement(
        'div',
        { className: 'auth-header' },
        React.createElement(Icons.Logo, { size: 48, style: { marginBottom: '0.8rem', filter: 'drop-shadow(0 4px 6px rgba(46,125,50,0.15))' } }),
        React.createElement('h1', { style: { fontFamily: 'var(--font-heading)', fontSize: '2rem', marginBottom: '0.2rem' } }, 'FoodBridge'),
        React.createElement('h2', { style: { fontSize: '0.9rem', color: 'var(--text-secondary)' } }, 'Welcome Back')
      ),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        React.createElement(
          'div',
          { className: 'auth-toggle-role', style: { display: 'flex', gap: '0.35rem', marginBottom: '1.25rem', background: 'rgba(0,0,0,0.03)', padding: '0.25rem', borderRadius: 'var(--radius-sm)' } },
          React.createElement(
            'button',
            {
              type: 'button',
              className: `role-tab ${role === 'restaurant' ? 'active' : ''}`,
              style: { flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', border: '0', background: 'transparent', cursor: 'pointer' },
              onClick: () => setRole('restaurant')
            },
            React.createElement(Icons.Utensils, { size: 14 }),
            'Restaurant'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: `role-tab ${role === 'shelter' ? 'active' : ''}`,
              style: { flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', border: '0', background: 'transparent', cursor: 'pointer' },
              onClick: () => setRole('shelter')
            },
            React.createElement(Icons.Award, { size: 14, color: 'var(--secondary-color)' }),
            'Shelter'
          ),
          React.createElement(
            'button',
            {
              type: 'button',
              className: `role-tab ${role === 'individual' ? 'active' : ''}`,
              style: { flex: 1, padding: '0.5rem 0.25rem', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem', border: '0', background: 'transparent', cursor: 'pointer' },
              onClick: () => setRole('individual')
            },
            React.createElement(Icons.Heart, { size: 14 }),
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
            className: 'form-control glow-focus',
            placeholder: role === 'restaurant' ? 'restaurant@foodbridge.com' : role === 'shelter' ? 'shelter@foodbridge.com' : 'individual@foodbridge.com',
            value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            required: true,
          })
        ),
        React.createElement(
          Button,
          {
            type: 'submit',
            className: 'btn-premium',
            fullWidth: true,
            disabled: loading,
            style: { padding: '0.75rem 1rem', fontSize: '0.95rem', fontWeight: 600 }
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
              style: { flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' },
              onClick: () => handleQuickLogin('restaurant', 'restaurant@foodbridge.com')
            },
            React.createElement(Icons.Utensils, { size: 11 }),
            'As Restaurant'
          ),
          React.createElement(
            Button,
            {
              type: 'button',
              variant: 'secondary',
              className: 'role-tab',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' },
              onClick: () => handleQuickLogin('shelter', 'shelter@foodbridge.com')
            },
            React.createElement(Icons.Award, { size: 11, color: 'var(--secondary-color)' }),
            'As Shelter'
          ),
          React.createElement(
            Button,
            {
              type: 'button',
              variant: 'secondary',
              className: 'role-tab',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.75rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' },
              onClick: () => handleQuickLogin('individual', 'individual@foodbridge.com')
            },
            React.createElement(Icons.Heart, { size: 11 }),
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
