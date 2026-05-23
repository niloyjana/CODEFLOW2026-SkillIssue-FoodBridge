import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration details submitted:', { name, email, role });
    setLoading(true);
    try {
      await register(name, email, role);
      if (role === 'restaurant') {
        navigate('/restaurant');
      } else {
        navigate('/individual');
      }
    } catch (err) {
      console.error(err);
      alert('Registration failed');
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
        React.createElement('h2', null, 'Create Account')
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
          React.createElement('label', { className: 'form-label', htmlFor: 'name' }, 'Organization or Volunteer Name'),
          React.createElement('input', {
            id: 'name',
            type: 'text',
            className: 'form-control',
            placeholder: role === 'restaurant' ? 'e.g. Pizza Palace' : 'e.g. Alex Volunteer',
            value: name,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
            required: true,
          })
        ),
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email Address'),
          React.createElement('input', {
            id: 'email',
            type: 'email',
            className: 'form-control',
            placeholder: 'info@organization.com',
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
          loading ? 'Creating Account...' : 'Register'
        )
      ),
      React.createElement(
        'div',
        { className: 'auth-footer' },
        'Already have an account? ',
        React.createElement('a', { href: '/login', style: { color: 'var(--primary-color)', fontWeight: '600', textDecoration: 'none' } }, 'Log in here')
      )
    )
  );
};
export default Register;
