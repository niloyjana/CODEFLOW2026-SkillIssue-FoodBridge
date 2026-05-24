import React, { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';
import Icons from '../components/common/Icons';
import { OpenFreeMap, OpenFreeMapHandle } from '../components/map/OpenFreeMap';
import SearchBar from '../components/map/SearchBar';
import { reverseGeocode } from '../services/geocoding';

export const Register: React.FC = () => {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  // Dynamic role-specific fields
  const [capacity, setCapacity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('22.5726');
  const [lng, setLng] = useState('88.3639');
  const [phone, setPhone] = useState('');
  const [locating, setLocating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Registration details submitted:', { name, email, role });
    setLoading(true);
    try {
      const extraFields: any = {
        address: address || undefined,
        phone: phone || undefined,
        lat: Number(lat) || undefined,
        lng: Number(lng) || undefined,
      };

      if (role === 'shelter') {
        extraFields.capacity = Number(capacity) || undefined;
        extraFields.licenseNumber = licenseNumber || undefined;
      }

      await register(name, email, role, extraFields);
      
      if (role === 'restaurant') {
        navigate('/restaurant');
      } else if (role === 'shelter') {
        navigate('/shelter');
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

  const mapRef = useRef<OpenFreeMapHandle>(null);

  const handleMapClick = useCallback(async (clickLat: number, clickLng: number) => {
    setLat(clickLat.toFixed(6));
    setLng(clickLng.toFixed(6));
    // Reverse geocode to fill address
    const result = await reverseGeocode(clickLat, clickLng);
    if (result) {
      setAddress(result.displayName.split(',').slice(0, 3).join(',').trim());
    }
  }, []);

  const handleLocateMe = useCallback(() => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const currentLat = position.coords.latitude;
        const currentLng = position.coords.longitude;
        setLat(currentLat.toFixed(6));
        setLng(currentLng.toFixed(6));
        
        // Center the map on user location
        mapRef.current?.flyTo([currentLng, currentLat], 16);
        
        // Reverse geocode to fill address
        const result = await reverseGeocode(currentLat, currentLng);
        if (result) {
          setAddress(result.displayName.split(',').slice(0, 3).join(',').trim());
        }
        setLocating(false);
      },
      (error) => {
        console.error('Error getting location:', error);
        alert(`Could not retrieve location: ${error.message}`);
        setLocating(false);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  }, []);

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
        React.createElement('h2', { style: { fontSize: '0.9rem', color: 'var(--text-secondary)' } }, 'Create Account')
      ),
      React.createElement(
        'form',
        { onSubmit: handleSubmit },
        
        // Role Tab Selectors (Restaurant, Shelter, Individual)
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

        // Shared Name Field
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'name' }, 'Organization or Volunteer Name'),
          React.createElement('input', {
            id: 'name',
            type: 'text',
            className: 'form-control glow-focus',
            placeholder: role === 'restaurant' ? 'e.g. Pizza Palace' : role === 'shelter' ? 'e.g. Hope Shelter' : 'e.g. Alex Volunteer',
            value: name,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value),
            required: true,
          })
        ),

        // Shared Email Field
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'email' }, 'Email Address'),
          React.createElement('input', {
            id: 'email',
            type: 'email',
            className: 'form-control glow-focus',
            placeholder: 'info@organization.com',
            value: email,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value),
            required: true,
          })
        ),

        // Role-specific field rendering
        role === 'shelter' && React.createElement(
          React.Fragment,
          null,
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement('label', { className: 'form-label', htmlFor: 'capacity' }, 'Capacity (People Served Daily)'),
            React.createElement('input', {
              id: 'capacity',
              type: 'number',
              className: 'form-control glow-focus',
              placeholder: 'e.g. 150',
              value: capacity,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setCapacity(e.target.value),
              required: true,
            })
          ),
          React.createElement(
            'div',
            { className: 'form-group' },
            React.createElement('label', { className: 'form-label', htmlFor: 'license' }, 'License / Certification Number'),
            React.createElement('input', {
              id: 'license',
              type: 'text',
              className: 'form-control glow-focus',
              placeholder: 'e.g. SHELTER-789-2026',
              value: licenseNumber,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLicenseNumber(e.target.value),
              required: true,
            })
          )
        ),

        role === 'individual' && React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'phone' }, 'Contact Phone Number'),
          React.createElement('input', {
            id: 'phone',
            type: 'text',
            className: 'form-control glow-focus',
            placeholder: 'e.g. +1 555-0199',
            value: phone,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPhone(e.target.value),
            required: true,
          })
        ),

        // Unified Location Picker for all roles
        React.createElement(
          'div',
          { className: 'form-group', style: { marginTop: '1.25rem' } },
          React.createElement(
            'label',
            {
              className: 'form-label',
              style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }
            },
            'Select Your Location on the Map',
            React.createElement(
              'button',
              {
                type: 'button',
                style: {
                  background: 'rgba(46, 125, 50, 0.08)',
                  border: '1px solid rgba(46, 125, 50, 0.2)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  padding: '3px 8px',
                  fontSize: '0.72rem',
                  fontWeight: 600,
                  color: 'var(--primary-color)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.2rem',
                },
                onClick: handleLocateMe,
                disabled: locating,
              },
              React.createElement(Icons.MapPin, { size: 10, color: 'var(--primary-color)' }),
              locating ? 'Locating...' : 'Locate Me'
            )
          ),
          React.createElement(SearchBar, {
            placeholder: 'Search for your address or neighborhood...',
            biasLat: parseFloat(lat) || 22.5726,
            biasLng: parseFloat(lng) || 88.3639,
            onLocationSelect: (searchLat: number, searchLng: number, displayName: string) => {
              setLat(searchLat.toFixed(6));
              setLng(searchLng.toFixed(6));
              setAddress(displayName.split(',').slice(0, 3).join(',').trim());
              mapRef.current?.flyTo([searchLng, searchLat], 16);
            },
          }),
          React.createElement(OpenFreeMap, {
            ref: mapRef,
            center: [parseFloat(lng) || 88.3639, parseFloat(lat) || 22.5726],
            zoom: 14,
            markers: lat && lng ? [{
              id: 'selected-location',
              lat: parseFloat(lat) || 22.5726,
              lng: parseFloat(lng) || 88.3639,
              label: name || 'Your Location',
              subLabel: address || 'Click the map to pin your location',
              color: 'green',
            }] : [],
            onMapClick: handleMapClick,
            height: '280px',
          }),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '0.5rem', marginTop: '0.5rem' } },
            React.createElement('input', {
              type: 'text',
              className: 'form-control glow-focus',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.8rem' },
              placeholder: 'Latitude',
              value: lat,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLat(e.target.value),
              readOnly: true,
            }),
            React.createElement('input', {
              type: 'text',
              className: 'form-control glow-focus',
              style: { flex: 1, padding: '0.4rem', fontSize: '0.8rem' },
              placeholder: 'Longitude',
              value: lng,
              onChange: (e: React.ChangeEvent<HTMLInputElement>) => setLng(e.target.value),
              readOnly: true,
            })
          ),
          React.createElement('p', {
            style: { fontSize: '0.7rem', color: 'var(--text-secondary)', marginTop: '0.3rem', fontStyle: 'italic' }
          }, 'Click on the map or search above to set your location')
        ),

        // Shared Address Field (rendered for all roles)
        React.createElement(
          'div',
          { className: 'form-group' },
          React.createElement('label', { className: 'form-label', htmlFor: 'address' }, 'Physical Address'),
          React.createElement('input', {
            id: 'address',
            type: 'text',
            className: 'form-control glow-focus',
            placeholder: 'e.g. 123 Main St, City',
            value: address,
            onChange: (e: React.ChangeEvent<HTMLInputElement>) => setAddress(e.target.value),
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
            style: { padding: '0.75rem 1rem', fontSize: '0.95rem', fontWeight: 600, marginTop: '1.5rem' }
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
