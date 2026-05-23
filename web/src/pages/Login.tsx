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
  size = 12, 
  maxDistance = 5,
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
  size = 16, 
  pupilSize = 6, 
  maxDistance = 4,
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

  useEffect(() => {
    const originalBodyStyle = document.body.style.overflow;
    const originalHtmlStyle = document.documentElement.style.overflow;
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalBodyStyle;
      document.documentElement.style.overflow = originalHtmlStyle;
    };
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

    const faceX = Math.max(-12, Math.min(12, deltaX / 20));
    const faceY = Math.max(-10, Math.min(10, deltaY / 30));
    const bodySkew = Math.max(-4, Math.min(4, -deltaX / 140));

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

  const handleQuickLogin = async (selectedRole: UserType, emailAddr: string) => {
    setRole(selectedRole);
    setEmail(emailAddr);
    setLoading(true);
    try {
      await login(emailAddr, selectedRole);
      navigate('/#about-us');
    } catch (err) {
      console.error(err);
      alert('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return React.createElement(
    'div',
    {
      style: {
        height: 'calc(100vh - 70px)', // matches exactly viewport height below the global navigation bar
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'row',
        background: 'var(--bg-primary)',
        overflow: 'hidden',
        boxSizing: 'border-box',
        margin: '0',
        padding: '0'
      }
    },

    // LEFT HALF: TALL BACKDROP PANEL WITH PROMINENT CHARACTERS
    React.createElement(
      'div',
      {
        className: 'hidden lg:flex',
        style: {
          flex: '1',
          background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.05) 0%, rgba(139, 195, 74, 0.05) 100%)',
          borderRight: '1px solid var(--border-light)',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '3rem',
          position: 'relative',
          overflow: 'hidden',
          height: '100%',
          boxSizing: 'border-box'
        }
      },
      
      // Branding Header
      React.createElement(
        'div',
        { style: { zIndex: '10', display: 'flex', alignItems: 'center', gap: '0.6rem' } },
        React.createElement(Icons.Logo, { size: 36 }),
        React.createElement('span', { style: { fontWeight: '700', fontSize: '1.2rem', color: 'var(--primary-color)' } }, 'FoodBridge')
      ),

      // Character assembly standing directly on the floor
      React.createElement(
        'div',
        {
          style: {
            zIndex: '10',
            display: 'flex',
            alignItems: 'flex-end',
            justifyContent: 'center',
            height: '420px',
            position: 'absolute',
            bottom: '20px',
            left: '0',
            right: '0',
            boxSizing: 'border-box'
          }
        },
        React.createElement(
          'div',
          {
            style: {
              position: 'relative',
              width: '480px',
              height: '360px',
              transform: 'scale(1.4)',
              transformOrigin: 'bottom center'
            }
          },
          
          // Purple character
          React.createElement(
            'div',
            {
              ref: purpleRef,
              style: {
                position: 'absolute',
                bottom: '0',
                left: '60px',
                width: '160px',
                height: (isTyping || (password.length > 0 && !showPassword)) ? '390px' : '350px',
                backgroundColor: '#6C3FF5',
                borderRadius: '10px 10px 0 0',
                zIndex: '1',
                transform: (password.length > 0 && showPassword)
                  ? 'skewX(0deg)'
                  : (isTyping || (password.length > 0 && !showPassword))
                    ? `skewX(${(purplePos.bodySkew || 0) - 10}deg) translateX(30px)`
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
                  gap: '2rem',
                  left: (password.length > 0 && showPassword) ? '20px' : isLookingAtEachOther ? '50px' : `${40 + purplePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? '30px' : isLookingAtEachOther ? '55px' : `${35 + purplePos.faceY}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }
              },
              React.createElement(EyeBall, {
                size: 16,
                pupilSize: 6,
                maxDistance: 4,
                eyeColor: 'white',
                pupilColor: '#2D2D2D',
                isBlinking: isPurpleBlinking,
                forceLookX: (password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined,
                forceLookY: (password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
              }),
              React.createElement(EyeBall, {
                size: 16,
                pupilSize: 6,
                maxDistance: 4,
                eyeColor: 'white',
                pupilColor: '#2D2D2D',
                isBlinking: isPurpleBlinking,
                forceLookX: (password.length > 0 && showPassword) ? (isPurplePeeking ? 4 : -4) : isLookingAtEachOther ? 3 : undefined,
                forceLookY: (password.length > 0 && showPassword) ? (isPurplePeeking ? 5 : -4) : isLookingAtEachOther ? 4 : undefined
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
                left: '210px',
                width: '110px',
                height: '280px',
                backgroundColor: '#2D2D2D',
                borderRadius: '8px 8px 0 0',
                zIndex: '2',
                transform: (password.length > 0 && showPassword)
                  ? 'skewX(0deg)'
                  : isLookingAtEachOther
                    ? `skewX(${(blackPos.bodySkew || 0) * 1.5 + 8}deg) translateX(15px)`
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
                  gap: '1.5rem',
                  left: (password.length > 0 && showPassword) ? '10px' : isLookingAtEachOther ? '28px' : `${22 + blackPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? '25px' : isLookingAtEachOther ? '12px' : `${28 + blackPos.faceY}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }
              },
              React.createElement(EyeBall, {
                size: 14,
                pupilSize: 5,
                maxDistance: 3,
                eyeColor: 'white',
                pupilColor: '#2D2D2D',
                isBlinking: isBlackBlinking,
                forceLookX: (password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined,
                forceLookY: (password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined
              }),
              React.createElement(EyeBall, {
                size: 14,
                pupilSize: 5,
                maxDistance: 3,
                eyeColor: 'white',
                pupilColor: '#2D2D2D',
                isBlinking: isBlackBlinking,
                forceLookX: (password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? 0 : undefined,
                forceLookY: (password.length > 0 && showPassword) ? -4 : isLookingAtEachOther ? -4 : undefined
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
                width: '210px',
                height: '170px',
                backgroundColor: '#FF9B6B',
                borderRadius: '100px 100px 0 0',
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
                  gap: '2rem',
                  left: (password.length > 0 && showPassword) ? '40px' : `${70 + orangePos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? '75px' : `${80 + orangePos.faceY}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }
              },
              React.createElement(Pupil, { size: 10, maxDistance: 4, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -5 : undefined, forceLookY: (password.length > 0 && showPassword) ? -4 : undefined }),
              React.createElement(Pupil, { size: 10, maxDistance: 4, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -5 : undefined, forceLookY: (password.length > 0 && showPassword) ? -4 : undefined })
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
                left: '270px',
                width: '130px',
                height: '200px',
                backgroundColor: '#E8D754',
                borderRadius: '60px 60px 0 0',
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
                  gap: '1.5rem',
                  left: (password.length > 0 && showPassword) ? '15px' : `${45 + yellowPos.faceX}px`,
                  top: (password.length > 0 && showPassword) ? '30px' : `${35 + yellowPos.faceY}px`,
                  transition: 'left 0.4s ease, top 0.4s ease'
                }
              },
              React.createElement(Pupil, { size: 10, maxDistance: 4, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -5 : undefined, forceLookY: (password.length > 0 && showPassword) ? -4 : undefined }),
              React.createElement(Pupil, { size: 10, maxDistance: 4, pupilColor: '#2D2D2D', forceLookX: (password.length > 0 && showPassword) ? -5 : undefined, forceLookY: (password.length > 0 && showPassword) ? -4 : undefined })
            ),
            React.createElement('div', {
              style: {
                position: 'absolute',
                width: '70px',
                height: '4px',
                backgroundColor: '#2D2D2D',
                borderRadius: '2px',
                left: (password.length > 0 && showPassword) ? '10px' : `${35 + yellowPos.faceX}px`,
                top: (password.length > 0 && showPassword) ? '78px' : `${78 + yellowPos.faceY}px`,
                transition: 'left 0.4s ease, top 0.4s ease'
              }
            })
          )
        )
      ),


    ),

    // RIGHT HALF: CLEAN VERTICALLY CENTERED LOGIN FORM (NO CARD BOX OR BORDERS)
    React.createElement(
      'div',
      {
        style: {
          flex: '1',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '3rem',
          height: '100%',
          boxSizing: 'border-box',
          overflow: 'hidden'
        }
      },
      React.createElement(
        'div',
        {
          style: {
            width: '100%',
            maxWidth: '380px',
            boxSizing: 'border-box',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }
        },
        React.createElement(
          'div',
          { className: 'auth-header', style: { textAlign: 'center' } },
          React.createElement(Icons.Logo, { size: 42, style: { marginBottom: '0.6rem' } }),
          React.createElement('h2', { style: { fontSize: '1.8rem', fontWeight: '800', fontFamily: 'var(--font-heading)', margin: '0 0 0.3rem 0' } }, 'Welcome Back'),
          React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)', margin: '0' } }, 'Enter your credentials to access FoodBridge')
        ),

        React.createElement(
          'form',
          { onSubmit: handleSubmit, style: { display: 'flex', flexDirection: 'column', gap: '1.1rem' } },
          
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
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: role === 'restaurant' ? 'var(--bg-primary)' : 'transparent',
                  color: role === 'restaurant' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: role === 'restaurant' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.3s ease'
                }
              },
              React.createElement(Icons.Utensils, { size: 14 }),
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
                  padding: '0.5rem',
                  fontSize: '0.85rem',
                  border: 'none',
                  borderRadius: '6px',
                  background: role === 'individual' ? 'var(--bg-primary)' : 'transparent',
                  color: role === 'individual' ? 'var(--primary-color)' : 'var(--text-secondary)',
                  fontWeight: role === 'individual' ? '700' : '500',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '0.4rem',
                  transition: 'all 0.3s ease'
                }
              },
              React.createElement(Icons.Heart, { size: 14 }),
              'Individual'
            )
          ),

          // EMAIL INPUT
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '0.4rem' } },
            React.createElement('label', { style: { fontSize: '0.85rem', fontWeight: '600' } }, 'Email Address'),
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
                height: '42px',
                padding: '0 0.8rem',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)',
                fontSize: '0.9rem',
                background: 'var(--bg-primary)'
              }
            })
          ),

          // PASSWORD INPUT
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '0.4rem' } },
            React.createElement('label', { style: { fontSize: '0.85rem', fontWeight: '600' } }, 'Password'),
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
                  height: '42px',
                  width: '100%',
                  padding: '0 2.5rem 0 0.8rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
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
                    right: '10px',
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
                  ? React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                      React.createElement('path', { d: 'M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24' }),
                      React.createElement('line', { x1: '1', y1: '1', x2: '23', y2: '23' })
                    )
                  : React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
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
              style: { height: '42px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.92rem', fontWeight: '700', marginTop: '0.5rem' }
            },
            loading ? 'Verifying Account...' : 'Log In'
          )
        ),

        // QUICK DEMO LOGINS BLOCK
        React.createElement(
          'div',
          { style: { borderTop: '1px solid var(--border-light)', marginTop: '1.2rem', paddingTop: '1rem' } },
          React.createElement('p', { style: { fontSize: '0.8rem', color: 'var(--text-secondary)', textAlign: 'center', marginBottom: '0.6rem', fontWeight: '600' } }, 'Quick Demo Accounts'),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '0.5rem' } },
            React.createElement(
              Button,
              {
                type: 'button',
                variant: 'secondary',
                style: { flex: '1', fontSize: '0.75rem', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' },
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
                style: { flex: '1', fontSize: '0.75rem', height: '32px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.3rem' },
                onClick: () => handleQuickLogin('individual', 'individual@foodbridge.com')
              },
              React.createElement(Icons.Heart, { size: 11 }),
              'As Individual'
            )
          )
        ),

        // REGISTER DIRECT LINK
        React.createElement(
          'div',
          { style: { textAlign: 'center', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '1.2rem' } },
          "Don't have an account yet? ",
          React.createElement('a', { href: '/register', style: { color: 'var(--primary-color)', fontWeight: '700', textDecoration: 'none' } }, 'Register here')
        )
      )
    )
  );
};

export default Login;
