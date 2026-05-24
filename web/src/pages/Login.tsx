import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Button from '../components/common/Button';
import Icons from '../components/common/Icons';
import '../styles/login.css'; // We will create this for the animations

const AppInput = (props: any) => {
  const { label, placeholder, icon, ...rest } = props;
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const rect = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };

  return (
    <div className="app-input-container">
      {label && <label className="app-input-label">{label}</label>}
      <div className="app-input-wrapper">
        <input
          className="app-input"
          placeholder={placeholder}
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
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
        {icon && <div className="app-input-icon">{icon}</div>}
      </div>
    </div>
  );
};

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [loading, setLoading] = useState(false);

  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  const handleMouseMove = (e: React.MouseEvent) => {
    const leftSection = e.currentTarget.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - leftSection.left,
      y: e.clientY - leftSection.top
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, role);
      if (role === 'restaurant') navigate('/restaurant');
      else if (role === 'shelter') navigate('/shelter');
      else navigate('/individual');
    } catch (err) {
      alert('Login failed');
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

  return (
    <>
      <div 
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          backgroundImage: "url('/bg.png')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          zIndex: -1
        }}
      />
      <div className="login-page-wrapper">
        <div className="login-card-container">
        <div 
          className="login-left-section"
          onMouseMove={handleMouseMove}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
        >
          <div
            className={`login-cursor-glow ${isHovering ? 'active' : ''}`}
            style={{
              transform: `translate(${mousePosition.x - 250}px, ${mousePosition.y - 250}px)`
            }}
          />
          <div className="login-form-container">
            <form onSubmit={handleSubmit} className="login-form">
              <div className="login-header">
                <img src="/logo.png" alt="FoodBridge Logo" className="login-logo" />
                <h2 className="login-subtitle">Welcome Back</h2>
              </div>
              
              <div className="auth-toggle-role login-role-toggle">
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

              <div className="login-inputs">
                <AppInput 
                  placeholder={role === 'restaurant' ? 'restaurant@foodbridge.com' : role === 'shelter' ? 'shelter@foodbridge.com' : 'individual@foodbridge.com'}
                  type="email" 
                  value={email}
                  onChange={(e: any) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="login-actions">
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
                Don't have an account? <a href="/register" className="login-link">Register here</a>
              </div>
            </form>
          </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;
