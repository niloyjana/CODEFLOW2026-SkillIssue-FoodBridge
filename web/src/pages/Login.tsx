import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { UserType } from 'shared/types';
import Icons from '../components/common/Icons';
import Button from '../components/common/Button';

interface PupilProps {
  size?: number;
  maxDistance?: number;
  pupilColor?: string;
  forceLookX?: number;
  forceLookY?: number;
}

const Pupil: React.FC<PupilProps> = ({ 
  size = 8, 
  maxDistance = 3,
  pupilColor = "black",
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const pupilRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!pupilRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const pupil = pupilRef.current.getBoundingClientRect();
    const pupilCenterX = pupil.left + pupil.width / 2;
    const pupilCenterY = pupil.top + pupil.height / 2;

    const deltaX = mouseX - pupilCenterX;
    const deltaY = mouseY - pupilCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pupilPosition = calculatePupilPosition();

  return React.createElement('div', {
    ref: pupilRef,
    style: {
      width: `${size}px`,
      height: `${size}px`,
      backgroundColor: pupilColor,
      borderRadius: '50%',
      transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
      transition: 'transform 0.1s ease-out',
    }
  });
};

interface EyeBallProps {
  size?: number;
  pupilSize?: number;
  maxDistance?: number;
  eyeColor?: string;
  pupilColor?: string;
  isBlinking?: boolean;
  forceLookX?: number;
  forceLookY?: number;
}

const EyeBall: React.FC<EyeBallProps> = ({ 
  size = 12, 
  pupilSize = 4, 
  maxDistance = 3,
  eyeColor = "white",
  pupilColor = "black",
  isBlinking = false,
  forceLookX,
  forceLookY
}) => {
  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const eyeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  const calculatePupilPosition = () => {
    if (!eyeRef.current) return { x: 0, y: 0 };
    if (forceLookX !== undefined && forceLookY !== undefined) {
      return { x: forceLookX, y: forceLookY };
    }
    const eye = eyeRef.current.getBoundingClientRect();
    const eyeCenterX = eye.left + eye.width / 2;
    const eyeCenterY = eye.top + eye.height / 2;

    const deltaX = mouseX - eyeCenterX;
    const deltaY = mouseY - eyeCenterY;
    const distance = Math.min(Math.sqrt(deltaX ** 2 + deltaY ** 2), maxDistance);

    const angle = Math.atan2(deltaY, deltaX);
    return { x: Math.cos(angle) * distance, y: Math.sin(angle) * distance };
  };

  const pupilPosition = calculatePupilPosition();

  return React.createElement(
    'div',
    {
      ref: eyeRef,
      style: {
        width: `${size}px`,
        height: isBlinking ? '1px' : `${size}px`,
        backgroundColor: eyeColor,
        borderRadius: '50%',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'height 0.15s ease'
      }
    },
    !isBlinking && React.createElement('div', {
      style: {
        width: `${pupilSize}px`,
        height: `${pupilSize}px`,
        backgroundColor: pupilColor,
        borderRadius: '50%',
        transform: `translate(${pupilPosition.x}px, ${pupilPosition.y}px)`,
        transition: 'transform 0.1s ease-out',
      }
    })
  );
};

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<UserType>('restaurant');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [mouseX, setMouseX] = useState<number>(0);
  const [mouseY, setMouseY] = useState<number>(0);
  const [isPurpleBlinking, setIsPurpleBlinking] = useState(false);
  const [isBlackBlinking, setIsBlackBlinking] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isLookingAtEachOther, setIsLookingAtEachOther] = useState(false);
  const [isPurplePeeking, setIsPurplePeeking] = useState(false);

  const purpleRef = useRef<HTMLDivElement>(null);
  const blackRef = useRef<HTMLDivElement>(null);
  const yellowRef = useRef<HTMLDivElement>(null);
  const orangeRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMouseX(e.clientX);
      setMouseY(e.clientY);
    };
    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  // Blinking effects
  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsPurpleBlinking(true);
        setTimeout(() => {
          setIsPurpleBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const scheduleBlink = () => {
      const timeout = setTimeout(() => {
        setIsBlackBlinking(true);
        setTimeout(() => {
          setIsBlackBlinking(false);
          scheduleBlink();
        }, 150);
      }, Math.random() * 4000 + 3000);
      return timeout;
    };
    const t = scheduleBlink();
    return () => clearTimeout(t);
  }, []);

  // Look at each other when typing
  useEffect(() => {
    if (isTyping) {
      setIsLookingAtEachOther(true);
      const timer = setTimeout(() => {
        setIsLookingAtEachOther(false);
      }, 800);
      return () => clearTimeout(timer);
    } else {
      setIsLookingAtEachOther(false);
    }
  }, [isTyping]);

  // Sneaky peeking password eye interaction
  useEffect(() => {
    if (password.length > 0 && showPassword) {
      const schedulePeek = () => {
        const timeout = setTimeout(() => {
          setIsPurplePeeking(true);
          setTimeout(() => {
            setIsPurplePeeking(false);
          }, 800);
        }, Math.random() * 3000 + 2000);
        return timeout;
      };
      const t = schedulePeek();
      return () => clearTimeout(t);
    } else {
      setIsPurplePeeking(false);
    }
  }, [password, showPassword]);

  const calculatePosition = (ref: React.RefObject<HTMLDivElement | null>) => {
    if (!ref.current) return { faceX: 0, faceY: 0, bodySkew: 0 };
    const rect = ref.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 3;
    const deltaX = mouseX - centerX;
    const deltaY = mouseY - centerY;

    const faceX = Math.max(-8, Math.min(8, deltaX / 30));
    const faceY = Math.max(-6, Math.min(6, deltaY / 40));
    const bodySkew = Math.max(-3, Math.min(3, -deltaX / 180));

    return { faceX, faceY, bodySkew };
  };

  const purplePos = calculatePosition(purpleRef);
  const blackPos = calculatePosition(blackRef);
  const yellowPos = calculatePosition(yellowRef);
  const orangePos = calculatePosition(orangeRef);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, role);
      navigate('/#about-us');
    } catch (err) {
      console.error(err);
      alert('Login failed');
    } finally {
      setLoading(false);
    }
  };



  return React.createElement(
    'div',
    {
      style: {
        height: 'calc(100vh - 75px)', // locks exactly to screen minus global navigation bar height
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: '0',
        padding: '1rem'
      }
    },

    // DUAL CARD WRAPPER - SIDE BY SIDE WITH EQUAL HEIGHT STRETCH
    React.createElement(
      'div',
      {
        style: {
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'stretch', // ensures left green box and right form card align perfectly at same height
          justifyContent: 'center',
          gap: '2.5rem',
          width: '100%',
          maxWidth: '820px',
          height: '470px', // exact uniform locks to prevent any viewport scrolling
          boxSizing: 'border-box'
        }
      },

      // LEFT COLUMN: ILLUSTRATED GREEN CARD
      React.createElement(
        'div',
        {
          className: 'hidden lg:flex',
          style: {
            flex: '1',
            background: 'rgba(76, 175, 80, 0.05)',
            border: '1px solid rgba(76, 175, 80, 0.15)',
            borderRadius: 'var(--radius-lg)',
            flexDirection: 'column',
            justifyContent: 'space-between',
            padding: '1.5rem',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden',
            paddingTop: '2rem' // fits container header spacing cleanly
          }
        },
        
        // Brand logo
        React.createElement(
          'div',
          { style: { zIndex: '10', display: 'flex', alignItems: 'center', gap: '0.4rem' } },
          React.createElement(Icons.Logo, { size: 28 }),
          React.createElement('span', { style: { fontWeight: '700', fontSize: '1rem', color: 'var(--primary-color)' } }, 'FoodBridge')
        ),

        // Animated illustrated characters container
        React.createElement(
          'div',
          {
            style: {
              zIndex: '10',
              display: 'flex',
              alignItems: 'flex-end',
              justifyContent: 'center',
              height: '240px',
              position: 'relative',
              boxSizing: 'border-box',
              paddingTop: '3.5rem' // pushes Illustrated blob characters downward to sit closer to floor
            }
          },
          React.createElement(
            'div',
            { style: { position: 'relative', width: '280px', height: '180px' } },
            
            // Purple character
            React.createElement(
              'div',
              {
                ref: purpleRef,
                style: {
                  position: 'absolute',
                  bottom: '0',
                  left: '40px',
                  width: '90px',
                  height: (isTyping || (password.length > 0 && !showPassword)) ? '210px' : '190px',
                  backgroundColor: '#6C3FF5',
                  borderRadius: '8px 8px 0 0',
                  zIndex: '1',
                  transform: (password.length > 0 && showPassword)
                    ? 'skewX(0deg)'
                    : (isTyping || (password.length > 0 && !showPassword))
                      ? `skewX(${(purplePos.bodySkew || 0) - 8}deg) translateX(20px)`
                      : `skewX(${purplePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'height 0.4s ease, transform 0.4s ease'
                }
              },
              React.createElement(
                'div',
                {
                  style: {
                    position: 'absolute',
                    display: 'flex',
                    gap: '1.2rem',
                    left: (password.length > 0 && showPassword) ? '12px' : isLookingAtEachOther ? '25px' : `${20 + purplePos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? '15px' : isLookingAtEachOther ? '35px' : `${22 + purplePos.faceY}px`,
                    transition: 'left 0.4s ease, top 0.4s ease'
                  }
                },
                React.createElement(EyeBall, {
                  size: 10,
                  pupilSize: 3.5,
                  maxDistance: 2,
                  eyeColor: 'white',
                  pupilColor: '#2D2D2D',
                  isBlinking: isPurpleBlinking,
                  forceLookX: (password.length > 0 && showPassword) ? (isPurplePeeking ? 2.5 : -2.5) : isLookingAtEachOther ? 2 : undefined,
                  forceLookY: (password.length > 0 && showPassword) ? (isPurplePeeking ? 3 : -2.5) : isLookingAtEachOther ? 2.5 : undefined
                }),
                React.createElement(EyeBall, {
                  size: 10,
                  pupilSize: 3.5,
                  maxDistance: 2,
                  eyeColor: 'white',
                  pupilColor: '#2D2D2D',
                  isBlinking: isPurpleBlinking,
                  forceLookX: (password.length > 0 && showPassword) ? (isPurplePeeking ? 2.5 : -2.5) : isLookingAtEachOther ? 2 : undefined,
                  forceLookY: (password.length > 0 && showPassword) ? (isPurplePeeking ? 3 : -2.5) : isLookingAtEachOther ? 2.5 : undefined
                })
              )
            ),

            // Black character
            React.createElement(
              'div',
              {
                ref: blackRef,
                style: {
                  position: 'absolute',
                  bottom: '0',
                  left: '145px',
                  width: '65px',
                  height: '150px',
                  backgroundColor: '#2D2D2D',
                  borderRadius: '6px 6px 0 0',
                  zIndex: '2',
                  transform: (password.length > 0 && showPassword)
                    ? 'skewX(0deg)'
                    : isLookingAtEachOther
                      ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 4}deg) translateX(8px)`
                      : (isTyping || (password.length > 0 && !showPassword))
                        ? `skewX(${(blackPos.bodySkew || 0) * 1.5}deg)`
                        : `skewX(${blackPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.4s ease'
                }
              },
              React.createElement(
                'div',
                {
                  style: {
                    position: 'absolute',
                    display: 'flex',
                    gap: '0.8rem',
                    left: (password.length > 0 && showPassword) ? '6px' : isLookingAtEachOther ? '16px' : `${10 + blackPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? '12px' : isLookingAtEachOther ? '6px' : `${15 + blackPos.faceY}px`,
                    transition: 'left 0.4s ease, top 0.4s ease'
                  }
                },
                React.createElement(EyeBall, {
                  size: 9,
                  pupilSize: 3,
                  maxDistance: 1.5,
                  eyeColor: 'white',
                  pupilColor: '#2D2D2D',
                  isBlinking: isBlackBlinking,
                  forceLookX: (password.length > 0 && showPassword) ? -2.5 : isLookingAtEachOther ? 0 : undefined,
                  forceLookY: (password.length > 0 && showPassword) ? -2.5 : isLookingAtEachOther ? -2.5 : undefined
                }),
                React.createElement(EyeBall, {
                  size: 9,
                  pupilSize: 3,
                  maxDistance: 1.5,
                  eyeColor: 'white',
                  pupilColor: '#2D2D2D',
                  isBlinking: isBlackBlinking,
                  forceLookX: (password.length > 0 && showPassword) ? -2.5 : isLookingAtEachOther ? 0 : undefined,
                  forceLookY: (password.length > 0 && showPassword) ? -2.5 : isLookingAtEachOther ? -2.5 : undefined
                })
              )
            ),

            // Orange character
            React.createElement(
              'div',
              {
                ref: orangeRef,
                style: {
                  position: 'absolute',
                  bottom: '0',
                  left: '0px',
                  width: '120px',
                  height: '90px',
                  backgroundColor: '#FF9B6B',
                  borderRadius: '60px 60px 0 0',
                  zIndex: '3',
                  transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : `skewX(${orangePos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.4s ease'
                }
              },
              React.createElement(
                'div',
                {
                  style: {
                    position: 'absolute',
                    display: 'flex',
                    gap: '1rem',
                    left: (password.length > 0 && showPassword) ? '22px' : `${40 + orangePos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? '35px' : `${40 + orangePos.faceY}px`,
                    transition: 'left 0.4s ease, top 0.4s ease'
                  }
                },
                React.createElement(Pupil, { size: 6, maxDistance: 2, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -3 : undefined, forceLookY: (password.length > 0 && showPassword) ? -2 : undefined }),
                React.createElement(Pupil, { size: 6, maxDistance: 2, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -3 : undefined, forceLookY: (password.length > 0 && showPassword) ? -2 : undefined })
              )
            ),

            // Yellow character
            React.createElement(
              'div',
              {
                ref: yellowRef,
                style: {
                  position: 'absolute',
                  bottom: '0',
                  left: '185px',
                  width: '75px',
                  height: '110px',
                  backgroundColor: '#E8D754',
                  borderRadius: '35px 35px 0 0',
                  zIndex: '4',
                  transform: (password.length > 0 && showPassword) ? 'skewX(0deg)' : `skewX(${yellowPos.bodySkew || 0}deg)`,
                  transformOrigin: 'bottom center',
                  transition: 'transform 0.4s ease'
                }
              },
              React.createElement(
                'div',
                {
                  style: {
                    position: 'absolute',
                    display: 'flex',
                    gap: '0.8rem',
                    left: (password.length > 0 && showPassword) ? '8px' : `${20 + yellowPos.faceX}px`,
                    top: (password.length > 0 && showPassword) ? '18px' : `${20 + yellowPos.faceY}px`,
                    transition: 'left 0.4s ease, top 0.4s ease'
                  }
                },
                React.createElement(Pupil, { size: 6, maxDistance: 2, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -3 : undefined, forceLookY: (password.length > 0 && showPassword) ? -2 : undefined }),
                React.createElement(Pupil, { size: 6, maxDistance: 2, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -3 : undefined, forceLookY: (password.length > 0 && showPassword) ? -2 : undefined })
              ),
              React.createElement('div', {
                style: {
                  position: 'absolute',
                  width: '35px',
                  height: '3px',
                  backgroundColor: '#2D2D2D',
                  borderRadius: '2px',
                  left: (password.length > 0 && showPassword) ? '8px' : `${18 + yellowPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? '40px' : `${40 + yellowPos.faceY}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }
              })
            )
          )
        ),

        // Small footer text links
        React.createElement(
          'div',
          { style: { display: 'flex', gap: '0.8rem', fontSize: '0.7rem', color: 'var(--text-secondary)', justifyContent: 'center' } },
          React.createElement('span', null, 'Privacy Policy'),
          React.createElement('span', null, 'Terms of Service'),
          React.createElement('span', null, 'Support Center')
        )
      ),

      // RIGHT COLUMN: WHITE FORM CARD
      React.createElement(
        'div',
        {
          className: 'auth-card glass-panel hover-lift mask-reveal',
          style: {
            flex: '1',
            maxWidth: '380px',
            padding: '1.5rem',
            borderRadius: 'var(--radius-lg)',
            boxSizing: 'border-box',
            background: 'var(--glass-bg)',
            border: '1px solid var(--border-color)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            height: '100%' // stretches to full height of parent wrapper exactly
          }
        },
        React.createElement(
          'div',
          { className: 'auth-header', style: { textAlign: 'center', marginBottom: '1.2rem' } },
          React.createElement(Icons.Logo, { size: 36, style: { marginBottom: '0.4rem' } }),
          React.createElement('h2', { style: { fontSize: '1.5rem', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '0 0 0.2rem 0' } }, 'Welcome Back'),
          React.createElement('p', { style: { fontSize: '0.8rem', color: 'var(--text-secondary)', margin: '0' } }, 'Enter your credentials to access FoodBridge')
        ),

        React.createElement(
          'form',
          { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '0.9rem' } },
          
          // ROLE SELECTOR
          React.createElement(
            'div',
            { className: 'auth-toggle-role', style: { display: 'flex', gap: '0.4rem', padding: '4px', background: 'var(--border-light)', borderRadius: 'var(--radius-sm)' } },
            React.createElement(
              'button',
              {
                type: 'button',
                className: `role-tab ${role === 'restaurant' ? 'active' : ''}`,
                onClick: () => setRole('restaurant'),
                style: {
                  flex: '1',
                  padding: '0.4rem',
                  fontSize: '0.8rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: role === 'restaurant' ? 'var(--bg-primary)' : 'transparent',
                  color: role === 'restaurant' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: role === 'restaurant' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.3s ease'
                }
              },
              React.createElement(Icons.Utensils, { size: 12 }),
              'Restaurant'
            ),
            React.createElement(
              'button',
              {
                type: 'button',
                className: `role-tab ${role === 'individual' ? 'active' : ''}`,
                onClick: () => setRole('individual'),
                style: {
                  flex: '1',
                  padding: '0.4rem',
                  fontSize: '0.8rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: role === 'individual' ? 'var(--bg-primary)' : 'transparent',
                  color: role === 'individual' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: role === 'individual' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.3rem',
                  transition: 'all 0.3s ease'
                }
              },
              React.createElement(Icons.Heart, { size: 12 }),
              'Individual'
            )
          ),

          // EMAIL INPUT
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '0.3rem' } },
            React.createElement('label', { style: { fontSize: '0.8rem', fontWeight: '600' } }, 'Email Address'),
            React.createElement('input', {
              type: 'email',
              className: 'form-control glow-focus',
              value: email,
              placeholder: role === 'restaurant' ? 'restaurant@foodbridge.com' : 'individual@foodbridge.com',
              onChange: (e) => setEmail(e.target.value),
              onFocus: () => setIsTyping(true),
              onBlur: () => setIsTyping(false),
              required: true,
              style: {
                height: '38px',
                padding: '0 0.7rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                background: 'var(--bg-primary)'
              }
            })
          ),

          // PASSWORD INPUT
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '0.3rem' } },
            React.createElement('label', { style: { fontSize: '0.8rem', fontWeight: '600' } }, 'Password'),
            React.createElement(
              'div',
              { style: { position: 'relative' } },
              React.createElement('input', {
                type: showPassword ? 'text' : 'password',
                className: 'form-control glow-focus',
                value: password,
                placeholder: '••••••••',
                onChange: (e) => setPassword(e.target.value),
                onFocus: () => setIsTyping(true),
                onBlur: () => setIsTyping(false),
                required: true,
                style: {
                  height: '38px',
                  width: '100%',
                  padding: '0 2.2rem 0 0.7rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.85rem',
                  background: 'var(--bg-primary)',
                  boxSizing: 'border-box'
                }
              }),
              React.createElement(
                'button',
                {
                  type: 'button',
                  onClick: () => setShowPassword(!showPassword),
                  style: {
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    color: 'var(--text-secondary)',
                    padding: '0'
                  }
                },
                showPassword
                  ? React.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                      React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
                      React.createElement('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
                    )
                  : React.createElement('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                      React.createElement('path', { d: 'M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z' }),
                      React.createElement('circle', { cx: '12', cy: '12', r: '3' })
                    )
              )
            )
          ),

          // SUBMIT ACTION BUTTON
          React.createElement(
            Button,
            {
              type: 'submit',
              className: 'btn-premium',
              disabled: loading,
              style: { height: '38px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.85rem', fontWeight: '700', marginTop: '0.3rem' }
            },
            loading ? 'Verifying Account...' : 'Log In'
          )
        ),



        // REGISTER DIRECT LINK
        React.createElement(
          'div',
          { style: { textAlign: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '1rem' } },
          "Don't have an account yet? ",
          React.createElement('a', { href: '/register', style: { color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' } }, 'Register here')
        )
      )
    )
  );
};

export default Login;
