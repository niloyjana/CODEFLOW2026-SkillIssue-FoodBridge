import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';
import Icons from '../components/common/Icons';
import { OpenFreeMap, OpenFreeMapHandle } from '../components/map/OpenFreeMap';
import SearchBar from '../components/map/SearchBar';
import { reverseGeocode } from '../services/geocoding';
import { auth as firebaseAuth } from '../config/firebase';
import '../styles/login.css';

const AppInput = (props: any) => {
  const { label, placeholder, icon, type, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  const isPasswordField = type === 'password';

  return (
    <div className="app-input-container">
      {label && <label className="app-input-label">{label}</label>}
      <div className="app-input-wrapper" style={{ position: 'relative' }}>
        <input
          className="app-input"
          placeholder={placeholder}
          type={isPasswordField && showPassword ? 'text' : type}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          style={isPasswordField ? { paddingRight: '2.5rem' } : undefined}
          {...rest}
        />
        {isHovering && (
          <>
            <div
              className="app-input-glow-top"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 0px, var(--primary-color) 0%, transparent 100%)`,
              }}
            />
            <div
              className="app-input-glow-bottom"
              style={{
                background: `radial-gradient(40px circle at ${mousePosition.x}px 2px, var(--primary-color) 0%, transparent 100%)`,
              }}
            />
          </>
        )}
        {isPasswordField ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '0.75rem',
              top: '50%',
              transform: 'translateY(-50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#444444',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0.25rem',
              zIndex: 100
            }}
          >
            {showPassword ? <Icons.EyeOff size={16} color="#444444" /> : <Icons.Eye size={16} color="#444444" />}
          </button>
        ) : (
          icon && <div className="app-input-icon">{icon}</div>
        )}
      </div>
    </div>
  );
};

interface LoginProps {
  initialMode?: 'login' | 'register';
}

export const Login: React.FC<LoginProps> = ({ initialMode = 'login' }) => {
  const { login, loginWithGoogle, register } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isRegister, setIsRegister] = useState(initialMode === 'register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  // Registration specific fields
  const [name, setName] = useState('');
  const [capacity, setCapacity] = useState('');
  const [licenseNumber, setLicenseNumber] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('22.5726');
  const [lng, setLng] = useState('88.3639');
  const [phone, setPhone] = useState('');
  const [locating, setLocating] = useState(false);
  const [isGoogleUser, setIsGoogleUser] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const mapRef = useRef<OpenFreeMapHandle>(null);

  // Sync mode with route changes
  useEffect(() => {
    setIsRegister(initialMode === 'register');
  }, [initialMode]);

  // Handle passed state from Google Login 404 redirections
  useEffect(() => {
    const state = location.state as { email?: string; name?: string } | undefined;
    if (state?.email) {
      setEmail(state.email);
      setName(state.name || '');
      setIsGoogleUser(true);
      setIsRegister(true);
    }
  }, [location.state]);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, role, password);
      if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'shelter') navigate('/shelter');
      else navigate('/individual');
    } catch (err: any) {
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Login failed. Please check your credentials.';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isGoogleUser && password.length < 6) {
      alert('Password must be at least 6 characters long.');
      return;
    }
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

      await register(name, email, role, extraFields, isGoogleUser ? undefined : password);
      
      if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'shelter') navigate('/shelter');
      else navigate('/individual');
    } catch (err: any) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Registration failed';
      alert(errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await loginWithGoogle(role);
      if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'shelter') navigate('/shelter');
      else navigate('/individual');
    } catch (err: any) {
      console.error(err);
      if (err.response?.status === 404 || err.message?.includes('404') || err.message?.includes('not found')) {
        alert('No profile found for this Google account. Switching to complete registration details...');
        setEmail(firebaseAuth.currentUser?.email || '');
        setName(firebaseAuth.currentUser?.displayName || '');
        setIsGoogleUser(true);
        setIsRegister(true);
      } else {
        const errMsg = err.response?.data?.error || err.response?.data?.message || err.message || 'Google Sign-In failed';
        alert(errMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (selectedRole: UserType, emailAddr: string) => {
    setLoading(true);
    try {
      await login(emailAddr, selectedRole);
      if (selectedRole === 'restaurant') navigate('/restaurant');
      else if (selectedRole === 'shelter') navigate('/shelter');
      else navigate('/individual');
    } catch (err) {
      alert('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleMapClick = useCallback(async (clickLat: number, clickLng: number) => {
    setLat(clickLat.toFixed(6));
    setLng(clickLng.toFixed(6));
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
        
        mapRef.current?.flyTo([currentLng, currentLat], 16);
        
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

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: "url('/bg.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}
      />
      <div className="login-page-wrapper">
        <div 
          className="login-card-container" 
          style={isRegister ? { maxWidth: '900px', width: '95%' } : { maxWidth: '450px', width: '100%' }}
        >
          <div 
            className="login-left-section"
            onMouseMove={handleMouseMove}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={isRegister ? { padding: '2.5rem 2rem' } : undefined}
          >
            <div
              className={`login-cursor-glow ${isHovering ? 'active' : ''}`}
              style={{
                transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`
              }}
            />
            
            <div className="login-form-container" style={isRegister ? { maxWidth: '100%' } : undefined}>
              
              {/* HEADER */}
              <div className="login-header">
                <img src="/logo.png" alt="FoodBridge Logo" className="login-logo" style={isRegister ? { height: '80px' } : undefined} />
                <h2 className="login-subtitle">{isRegister ? 'Create Your Account' : 'Welcome Back'}</h2>
              </div>

              {/* ROLE TOGGLE */}
              <div className="auth-toggle-role login-role-toggle" style={{ marginBottom: '1.25rem' }}>
                <button type="button" className={`role-tab ${role === 'restaurant' ? 'active' : ''}`} onClick={() => setRole('restaurant')}>
                  <Icons.Utensils size={14} /> Restaurant
                </button>
                <button type="button" className={`role-tab ${role === 'shelter' ? 'active' : ''}`} onClick={() => setRole('shelter')}>
                  <Icons.Award size={14} color="var(--secondary-color)" /> Shelter
                </button>
                <button type="button" className={`role-tab ${role === 'individual' ? 'active' : ''}`} onClick={() => setRole('individual')}>
                  <Icons.Heart size={14} /> Individual
                </button>
              </div>

              {/* SINGLE GOOGLE SIGN-IN BUTTON */}
              {!isGoogleUser ? (
                <>
                  <button 
                    type="button" 
                    onClick={handleGoogleLogin} 
                    disabled={loading} 
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.5rem',
                      width: '100%',
                      padding: '0.75rem 1rem',
                      background: '#ffffff',
                      border: '1px solid #dadce0',
                      borderRadius: 'var(--radius-sm, 6px)',
                      color: '#3c4043',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      marginBottom: '1.25rem',
                      boxShadow: '0 1px 2px 0 rgba(60,64,67,0.3), 0 1px 3px 1px rgba(60,64,67,0.15)',
                      transition: 'background-color 0.2s'
                    }}
                    onMouseOver={(e) => {
                      e.currentTarget.style.backgroundColor = '#f8f9fa';
                    }}
                    onMouseOut={(e) => {
                      e.currentTarget.style.backgroundColor = '#ffffff';
                    }}
                  >
                    <svg width="18" height="18" viewBox="0 0 18 18">
                      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.259h2.908c1.702-1.567 2.684-3.874 2.684-6.617z" fill="#4285F4"/>
                      <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z" fill="#34A853"/>
                      <path d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71s.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9s.347 2.827.957 4.041l3.007-2.33z" fill="#FBBC05"/>
                      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.896 11.427 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
                    </svg>
                    <span>{isRegister ? 'Sign up with Google' : 'Sign in with Google'}</span>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
                    <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-color, #e0e0e0)' }} />
                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>or use email</span>
                    <hr style={{ flex: 1, border: '0', borderTop: '1px solid var(--border-color, #e0e0e0)' }} />
                  </div>
                </>
              ) : (
                <div style={{
                  padding: '0.75rem 1rem',
                  background: 'rgba(46, 125, 50, 0.08)',
                  border: '1px solid rgba(46, 125, 50, 0.2)',
                  borderRadius: 'var(--radius-sm, 6px)',
                  color: 'var(--primary-color)',
                  fontWeight: 600,
                  fontSize: '0.9rem',
                  textAlign: 'center',
                  marginBottom: '1.25rem'
                }}>
                  Google Account Connected: {email}
                </div>
              )}

              {/* LOGIN MODE */}
              {!isRegister && (
                <form onSubmit={handleLoginSubmit} className="login-form">
                  <div className="login-inputs">
                    <div style={{ marginBottom: '1rem' }}>
                      <AppInput 
                        label="Email Address"
                        placeholder={role === 'restaurant' ? 'restaurant@foodbridge.com' : role === 'shelter' ? 'shelter@foodbridge.com' : 'individual@foodbridge.com'}
                        type="email" 
                        value={email}
                        onChange={(e: any) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    <div style={{ marginBottom: '1.25rem' }}>
                      <AppInput 
                        label="Password"
                        placeholder="••••••••"
                        type="password" 
                        value={password}
                        onChange={(e: any) => setPassword(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <div className="login-actions" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                    <button type="submit" disabled={loading} className="login-submit-btn group">
                      <span className="login-btn-text">{loading ? 'Logging In...' : 'Log In'}</span>
                      <div className="login-btn-shine">
                        <div className="login-btn-shine-bar" />
                      </div>
                    </button>
                  </div>

                  <div className="login-quick-demo">
                    <p>Quick Demo Logins</p>
                    <div className="quick-demo-buttons">
                      <Button type="button" variant="secondary" onClick={() => handleQuickLogin('restaurant', 'restaurant@foodbridge.com')}>
                        <Icons.Utensils size={11} />
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => handleQuickLogin('shelter', 'shelter@foodbridge.com')}>
                        <Icons.Award size={11} color="var(--secondary-color)" />
                      </Button>
                      <Button type="button" variant="secondary" onClick={() => handleQuickLogin('individual', 'individual@foodbridge.com')}>
                        <Icons.Heart size={11} />
                      </Button>
                    </div>
                  </div>

                  <div className="auth-footer">
                    Don't have an account?{' '}
                    <button 
                      type="button" 
                      onClick={() => { setIsRegister(true); navigate('/register'); }} 
                      className="login-link"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                    >
                      Register here
                    </button>
                  </div>
                </form>
              )}

              {/* REGISTER MODE */}
              {isRegister && (
                <form onSubmit={handleRegisterSubmit} className="login-form">
                  <div style={{ display: 'flex', gap: '2rem', flexDirection: 'row', flexWrap: 'wrap', width: '100%', textAlign: 'left' }}>
                    
                    {/* Left Column - User Form Details */}
                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      
                      <div className="form-group">
                        <label className="form-label" htmlFor="name">Organization or Volunteer Name</label>
                        <input
                          id="name"
                          type="text"
                          className="form-control glow-focus"
                          placeholder={role === 'restaurant' ? 'e.g. Pizza Palace' : role === 'shelter' ? 'e.g. Hope Shelter' : 'e.g. Alex Volunteer'}
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          required
                          disabled={isGoogleUser}
                        />
                      </div>

                      <div className="form-group">
                        <label className="form-label" htmlFor="email">Email Address</label>
                        <input
                          id="email"
                          type="email"
                          className="form-control glow-focus"
                          placeholder="info@organization.com"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          required
                          disabled={isGoogleUser}
                        />
                      </div>

                      {!isGoogleUser && (
                        <div className="form-group" style={{ position: 'relative' }}>
                          <label className="form-label" htmlFor="password">Password</label>
                          <div style={{ position: 'relative' }}>
                            <input
                              id="password"
                              type={showRegisterPassword ? 'text' : 'password'}
                              className="form-control glow-focus"
                              style={{ paddingRight: '2.5rem' }}
                              placeholder="••••••••"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                              style={{
                                position: 'absolute',
                                right: '0.75rem',
                                top: '50%',
                                transform: 'translateY(-50%)',
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#444444',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                padding: '0.25rem',
                                zIndex: 100
                              }}
                            >
                              {showRegisterPassword ? <Icons.EyeOff size={16} color="#444444" /> : <Icons.Eye size={16} color="#444444" />}
                            </button>
                          </div>
                        </div>
                      )}

                      {role === 'shelter' && (
                        <>
                          <div className="form-group">
                            <label className="form-label" htmlFor="capacity">Capacity (People Served Daily)</label>
                            <input
                              id="capacity"
                              type="number"
                              className="form-control glow-focus"
                              placeholder="e.g. 150"
                              value={capacity}
                              onChange={(e) => setCapacity(e.target.value)}
                              required
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label" htmlFor="license">License / Certification Number</label>
                            <input
                              id="license"
                              type="text"
                              className="form-control glow-focus"
                              placeholder="e.g. SHELTER-789-2026"
                              value={licenseNumber}
                              onChange={(e) => setLicenseNumber(e.target.value)}
                              required
                            />
                          </div>
                        </>
                      )}

                      {role === 'individual' && (
                        <div className="form-group">
                          <label className="form-label" htmlFor="phone">Contact Phone Number</label>
                          <input
                            id="phone"
                            type="text"
                            className="form-control glow-focus"
                            placeholder="e.g. +1 555-0199"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            required
                          />
                        </div>
                      )}

                      <div className="form-group">
                        <label className="form-label" htmlFor="address">Physical Address</label>
                        <input
                          id="address"
                          type="text"
                          className="form-control glow-focus"
                          placeholder="e.g. 123 Main St, City"
                          value={address}
                          onChange={(e) => setAddress(e.target.value)}
                          required
                        />
                      </div>
                    </div>

                    {/* Right Column - Map Location Picker */}
                    <div style={{ flex: 1, minWidth: '280px', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                      <div className="form-group">
                        <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                          Select Location on Map
                          <button
                            type="button"
                            style={{
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
                            }}
                            onClick={handleLocateMe}
                            disabled={locating}
                          >
                            <Icons.MapPin size={10} color="var(--primary-color)" />
                            {locating ? 'Locating...' : 'Locate Me'}
                          </button>
                        </label>

                        <SearchBar
                          placeholder="Search for address or neighborhood..."
                          biasLat={parseFloat(lat) || 22.5726}
                          biasLng={parseFloat(lng) || 88.3639}
                          onLocationSelect={(searchLat: number, searchLng: number, displayName: string) => {
                            setLat(searchLat.toFixed(6));
                            setLng(searchLng.toFixed(6));
                            setAddress(displayName.split(',').slice(0, 3).join(',').trim());
                            mapRef.current?.flyTo([searchLng, searchLat], 16);
                          }}
                        />

                        <OpenFreeMap
                          ref={mapRef}
                          center={[parseFloat(lng) || 88.3639, parseFloat(lat) || 22.5726]}
                          zoom={14}
                          markers={lat && lng ? [{
                            id: 'selected-location',
                            lat: parseFloat(lat) || 22.5726,
                            lng: parseFloat(lng) || 88.3639,
                            label: name || 'Your Location',
                            subLabel: address || 'Click the map to pin your location',
                            color: 'green',
                          }] : []}
                          onMapClick={handleMapClick}
                          height="230px"
                        />

                        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                          <input
                            type="text"
                            className="form-control glow-focus"
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                            placeholder="Latitude"
                            value={lat}
                            readOnly
                          />
                          <input
                            type="text"
                            className="form-control glow-focus"
                            style={{ flex: 1, padding: '0.4rem', fontSize: '0.8rem' }}
                            placeholder="Longitude"
                            value={lng}
                            readOnly
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%' }}>
                    <Button
                      type="submit"
                      className="btn-premium"
                      fullWidth
                      disabled={loading}
                      style={{ padding: '0.75rem 1rem', fontSize: '0.95rem', fontWeight: 600 }}
                    >
                      {loading ? 'Creating Account...' : 'Register'}
                    </Button>

                    <div className="auth-footer" style={{ marginTop: '0.5rem' }}>
                      Already have an account?{' '}
                      <button 
                        type="button" 
                        onClick={() => { setIsRegister(false); navigate('/login'); }} 
                        className="login-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                      >
                        Log in here
                      </button>
                    </div>
                  </div>
                </form>
              )}

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
