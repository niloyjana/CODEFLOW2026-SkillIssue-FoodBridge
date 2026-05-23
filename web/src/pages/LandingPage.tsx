import React from 'react';
import { useNavigate } from 'react-router-dom';
import Icons from '../components/common/Icons';
import Button from '../components/common/Button';

const caseStudiesData = [
  {
    id: "case-bakery",
    title: "Green Crust: Diverting 95% Bakery Waste",
    description: "Discover how Green Crust Bakery automated surplus posting to rescue over 1,200kg of organic bread packages with local volunteers.",
    href: "#",
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "case-shelter",
    title: "Hope Center: Fast Hot Meal Rescues",
    description: "Learn how active coordinate maps helped local volunteers deliver 450 hot dinner portions to shelters in under 30 minutes.",
    href: "#",
    image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "case-market",
    title: "Organic Fresh: 2.5 Ton Produce Rescue",
    description: "See how community members partnered to rescue 2.5 tons of fresh seasonal produce, preventing regional landfill emissions.",
    href: "#",
    image: "https://images.unsplash.com/photo-1488459718432-01055e67e18a?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "case-campus",
    title: "Student Food Link: Dining Surplus Grid",
    description: "Read about the university initiative that synchronized dining hall leftovers with local community pantries.",
    href: "#",
    image: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=600&auto=format&fit=crop",
  },
  {
    id: "case-bistro",
    title: "Bistro Eco-Grid: Dining Waste Avoidance",
    description: "Explore how a popular metropolitan dining venue integrated real-time posts to cut leftover waste by 80%.",
    href: "#",
    image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=600&auto=format&fit=crop",
  }
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = React.useState(0);

  const scrollPrev = () => {
    setCurrentSlide(prev => Math.max(prev - 1, 0));
  };

  const scrollNext = () => {
    setCurrentSlide(prev => Math.min(prev + 1, caseStudiesData.length - 1));
  };

  React.useEffect(() => {
    const el = document.getElementById('about-us');
    if (el) {
      setTimeout(() => el.scrollIntoView({ behavior: 'smooth' }), 200);
    }
  }, []);

  return React.createElement(
    'div',
    { className: 'landing-container mask-reveal', style: { width: '100%', maxWidth: '1200px', margin: '0 auto', padding: '2rem 1rem' } },
    
    // HERO SECTION
    React.createElement(
      'section',
      {
        className: 'glass-panel hover-lift shimmer-card mask-reveal delay-1',
        style: {
          borderRadius: 'var(--radius-lg)',
          padding: '4rem 2rem',
          textAlign: 'center',
          background: 'linear-gradient(135deg, rgba(46, 125, 50, 0.08) 0%, rgba(139, 195, 74, 0.08) 100%)',
          border: '1px solid rgba(46, 125, 50, 0.15)',
          marginBottom: '3rem',
          position: 'relative',
          overflow: 'hidden',
        }
      },
      // Decorative glowing green dots
      React.createElement('div', {
        style: {
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(76,175,80,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }
      }),
      React.createElement('div', {
        style: {
          position: 'absolute',
          bottom: '-10%',
          left: '-10%',
          width: '300px',
          height: '300px',
          background: 'radial-gradient(circle, rgba(139,195,74,0.1) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none'
        }
      }),


      React.createElement(
        'h1',
        {
          style: {
            fontSize: '3rem',
            fontFamily: 'var(--font-heading)',
            fontWeight: '800',
            lineHeight: '1.15',
            color: 'var(--text-primary)',
            maxWidth: '850px',
            margin: '0 auto 1.5rem auto',
          }
        },
        'Bridging the Gap Between ',
        React.createElement('span', { className: 'text-gradient' }, 'Surplus Food'),
        ' and ',
        React.createElement('span', { className: 'text-gradient' }, 'Communities')
      ),
      React.createElement(
        'p',
        {
          style: {
            fontSize: '1.2rem',
            color: 'var(--text-secondary)',
            maxWidth: '750px',
            margin: '0 auto 2.5rem auto',
            lineHeight: '1.6'
          }
        },
        'Optimize surplus meals, minimize environmental footprints, and distribute package claims instantly with local volunteers. Powered by predictive analytics.'
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' } },
        React.createElement(
          Button,
          {
            className: 'btn-premium',
            style: { padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: '600', minWidth: '180px' },
            onClick: () => navigate('/login')
          },
          'Get Started Now'
        ),
        React.createElement(
          Button,
          {
            variant: 'secondary',
            style: { padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: '600', minWidth: '180px', border: '1px solid var(--border-color)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
            onClick: () => navigate('/leaderboard')
          },
          React.createElement(Icons.Award, { size: 18, color: 'var(--secondary-color)' }),
          'Explore Leaderboard'
        )
      )
    ),

    // STATS METRICS GRID
    React.createElement(
      'section',
      { style: { marginBottom: '4rem' } },
      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1.5rem',
          }
        },
        React.createElement(
          'div',
          { className: 'card glass-panel hover-lift shimmer-card mask-reveal delay-2', style: { padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--primary-color)' } },
          React.createElement('h3', { style: { fontSize: '2.5rem', color: 'var(--primary-color)', fontWeight: '800', marginBottom: '0.5rem' } }, '2,480 kg'),
          React.createElement('h4', { style: { fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' } }, 'Surplus Saved'),
          React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)' } }, 'Clean ecological metric representing predicted food waste successfully diverted from local landfills.')
        ),
        React.createElement(
          'div',
          { className: 'card glass-panel hover-lift shimmer-card mask-reveal delay-2', style: { padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--secondary-color)' } },
          React.createElement('h3', { style: { fontSize: '2.5rem', color: 'var(--secondary-color)', fontWeight: '800', marginBottom: '0.5rem' } }, '9,820+'),
          React.createElement('h4', { style: { fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' } }, 'Portions Distributed'),
          React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)' } }, 'Fresh surplus meals successfully claimed, picked up, and delivered to local individuals.')
        ),
        React.createElement(
          'div',
          { className: 'card glass-panel hover-lift shimmer-card mask-reveal delay-2', style: { padding: '2rem', textAlign: 'center', borderTop: '4px solid var(--accent-color)' } },
          React.createElement('h3', { style: { fontSize: '2.5rem', color: 'var(--accent-color)', fontWeight: '800', marginBottom: '0.5rem' } }, '98.6%'),
          React.createElement('h4', { style: { fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '0.5rem' } }, 'Coordination Success'),
          React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)' } }, 'High-efficiency fulfillment rate of active claims completed within the designated pickup deadlines.')
        )
      )
    ),

    // HOW IT WORKS / ABOUT SECTION
    React.createElement(
      'section',
      {
        id: 'about-us',
        className: 'mask-reveal delay-3',
        style: { padding: '4rem 0', display: 'flex', flexDirection: 'column', gap: '2.5rem' }
      },
      React.createElement(
        'div',
        { style: { textAlign: 'center', marginBottom: '1rem' } },
        React.createElement(
          'div',
          { style: { display: 'inline-flex', alignItems: 'center', background: 'var(--primary-glow)', padding: '0.4rem 0.8rem', borderRadius: '50px', marginBottom: '1rem', border: '1px solid rgba(76, 175, 80, 0.1)' } },
          React.createElement('span', { style: { fontSize: '0.8rem', fontWeight: '700', color: 'var(--primary-color)' } }, 'Operational Workflow')
        ),
        React.createElement('h2', { style: { fontSize: '2.2rem', fontFamily: 'var(--font-heading)', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.6rem' } }, 'How FoodBridge Works'),
        React.createElement('p', { style: { color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto', fontSize: '0.98rem' } }, 'Learn how we bridge excess food resources directly to community needs through active volunteer action.')
      ),

      React.createElement(
        'div',
        {
          style: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2.5rem',
            alignItems: 'stretch'
          }
        },
        
        // LEFT COLUMN: MISSION & GRAPHICS
        React.createElement(
          'div',
          {
            className: 'glass-panel hover-lift shimmer-card',
            style: {
              borderRadius: 'var(--radius-lg)',
              padding: '2.5rem',
              background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.03) 0%, rgba(33, 150, 243, 0.03) 100%)',
              border: '1px solid rgba(76, 175, 80, 0.15)',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              position: 'relative',
              overflow: 'hidden'
            }
          },
          React.createElement('div', {
            style: {
              position: 'absolute',
              top: '-10%',
              right: '-10%',
              width: '200px',
              height: '200px',
              background: 'radial-gradient(circle, rgba(76,175,80,0.06) 0%, rgba(255,255,255,0) 70%)',
              pointerEvents: 'none'
            }
          }),
          React.createElement('h3', { style: { fontSize: '1.4rem', fontWeight: '800', marginBottom: '1rem', color: 'var(--text-primary)' } }, 'Our Ecological Core Mission'),
          React.createElement(
            'p',
            { style: { color: 'var(--text-secondary)', fontSize: '0.95rem', lineHeight: '1.6', marginBottom: '2rem' } },
            'FoodBridge is a hyper-local logistical network designed to combat regional food insecurity and environmental waste. By utilizing coordinated volunteer networks and transparent gamified metrics, we turn restaurant surplus into vital local community support instantly.'
          ),
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '1.5rem', alignItems: 'center' } },
            React.createElement(
              'div',
              { style: { width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(76, 175, 80, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Icons.Leaf, { size: 20, color: 'var(--primary-color)' })
            ),
            React.createElement(
              'div',
              { style: { width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(33, 150, 243, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Icons.MapPin, { size: 20, color: '#2196f3' })
            ),
            React.createElement(
              'div',
              { style: { width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255, 193, 7, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' } },
              React.createElement(Icons.Trophy, { size: 20, color: 'var(--secondary-color)' })
            )
          )
        ),

        // RIGHT COLUMN: CHRONOLOGICAL STEPS STACK
        React.createElement(
          'div',
          { style: { display: 'flex', flexDirection: 'column', gap: '1.2rem', justifyContent: 'center' } },
          
          // STEP 1
          React.createElement(
            'div',
            { className: 'glass-panel hover-lift shimmer-card', style: { padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' } },
            React.createElement(
              'span',
              { style: { fontSize: '1.2rem', fontWeight: '800', color: 'var(--primary-color)', background: 'var(--primary-glow)', padding: '0.3rem 0.6rem', borderRadius: '6px' } },
              '01'
            ),
            React.createElement(
              'div',
              null,
              React.createElement('h4', { style: { fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.3rem', color: 'var(--text-primary)' } }, 'Restaurants Share Surplus'),
              React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' } }, 'Venues easily specify meal packaging, active quantities, and pickup window deadlines in seconds.')
            )
          ),

          // STEP 2
          React.createElement(
            'div',
            { className: 'glass-panel hover-lift shimmer-card', style: { padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' } },
            React.createElement(
              'span',
              { style: { fontSize: '1.2rem', fontWeight: '800', color: '#2196f3', background: 'rgba(33, 150, 243, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' } },
              '02'
            ),
            React.createElement(
              'div',
              null,
              React.createElement('h4', { style: { fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.3rem', color: 'var(--text-primary)' } }, 'Volunteers Claim & Co-ordinate'),
              React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' } }, 'Local volunteers review claims on their dashboard map and instantly coordinate transit details.')
            )
          ),

          // STEP 3
          React.createElement(
            'div',
            { className: 'glass-panel hover-lift shimmer-card', style: { padding: '1.5rem', borderRadius: 'var(--radius-md)', display: 'flex', gap: '1rem', alignItems: 'flex-start' } },
            React.createElement(
              'span',
              { style: { fontSize: '1.2rem', fontWeight: '800', color: 'var(--secondary-color)', background: 'rgba(255, 193, 7, 0.1)', padding: '0.3rem 0.6rem', borderRadius: '6px' } },
              '03'
            ),
            React.createElement(
              'div',
              null,
              React.createElement('h4', { style: { fontSize: '1.05rem', fontWeight: '700', marginBottom: '0.3rem', color: 'var(--text-primary)' } }, 'Mutual Community Impact Earned'),
              React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' } }, 'Successful claims accumulate points, elevating volunteers and restaurants up our gamified leaderboard.')
            )
          )
        )
      ),

      // DIVIDER LINE
      React.createElement('div', {
        style: {
          width: '100%',
          height: '1px',
          background: 'rgba(76, 175, 80, 0.15)',
          margin: '3.5rem 0 3rem 0'
        }
      }),

      // CAROUSEL SECTION CONTAINER
      React.createElement(
        'div',
        { className: 'carousel-section', style: { width: '100%', overflow: 'hidden' } },
        
        // CAROUSEL HEADER
        React.createElement(
          'div',
          {
            style: {
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-end',
              marginBottom: '2rem',
              gap: '1.5rem',
              flexWrap: 'wrap'
            }
          },
          React.createElement(
            'div',
            { style: { display: 'flex', flexDirection: 'column', gap: '0.4rem' } },
            React.createElement('h3', { style: { fontSize: '1.6rem', fontWeight: '800', color: 'var(--text-primary)' } }, 'Impact Case Studies'),
            React.createElement('p', { style: { color: 'var(--text-secondary)', maxWidth: '600px', fontSize: '0.9rem', lineHeight: '1.5' } }, 'Discover how leading local venues and volunteer organizations are leveraging FoodBridge to combat daily waste and build direct neighborhood support.')
          ),
          
          // CONTROL BUTTONS
          React.createElement(
            'div',
            { style: { display: 'flex', gap: '0.6rem' } },
            React.createElement(
              'button',
              {
                className: 'btn btn-secondary',
                onClick: scrollPrev,
                disabled: currentSlide === 0,
                style: {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentSlide === 0 ? '0.4' : '1',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }
              },
              React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                React.createElement('line', { x1: '19', y1: '12', x2: '5', y2: '12' }),
                React.createElement('polyline', { points: '12 19 5 12 12 5' })
              )
            ),
            React.createElement(
              'button',
              {
                className: 'btn btn-secondary',
                onClick: scrollNext,
                disabled: currentSlide === caseStudiesData.length - 1,
                style: {
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0',
                  cursor: currentSlide === caseStudiesData.length - 1 ? 'not-allowed' : 'pointer',
                  opacity: currentSlide === caseStudiesData.length - 1 ? '0.4' : '1',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--border-color)',
                  transition: 'all 0.2s ease'
                }
              },
              React.createElement('svg', { width: '18', height: '18', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2', strokeLinecap: 'round', strokeLinejoin: 'round' },
                React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
                React.createElement('polyline', { points: '12 5 19 12 12 19' })
              )
            )
          )
        ),

        // CAROUSEL VIEWPORT
        React.createElement(
          'div',
          { style: { width: '100%', overflow: 'hidden', padding: '0.5rem 0' } },
          React.createElement(
            'div',
            {
              style: {
                display: 'flex',
                gap: '1.5rem',
                transition: 'transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                transform: `translateX(-${currentSlide * 300}px)`
              }
            },
            caseStudiesData.map((item) =>
              React.createElement(
                'div',
                {
                  key: item.id,
                  style: { flex: '0 0 auto', width: '280px' }
                },
                React.createElement(
                  'a',
                  {
                    href: item.href,
                    className: 'group rounded-xl shimmer-card hover-lift',
                    style: { textDecoration: 'none', display: 'block', borderRadius: '12px', overflow: 'hidden' }
                  },
                  React.createElement(
                    'div',
                    {
                      className: 'glass-panel',
                      style: {
                        position: 'relative',
                        height: '380px',
                        borderRadius: '12px',
                        overflow: 'hidden',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'flex-end',
                        background: 'var(--glass-bg)',
                        border: '1px solid var(--border-color)'
                      }
                    },
                    // Background Image
                    React.createElement('img', {
                      src: item.image,
                      alt: item.title,
                      style: {
                        position: 'absolute',
                        top: '0',
                        left: '0',
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        zIndex: '1',
                        transition: 'transform 0.4s ease'
                      },
                      className: 'svg-animated'
                    }),
                    // Gradient Overlay
                    React.createElement('div', {
                      style: {
                        position: 'absolute',
                        inset: '0',
                        background: 'linear-gradient(rgba(0,0,0,0) 20%, rgba(0,0,0,0.5) 60%, rgba(0,0,0,0.9) 100%)',
                        zIndex: '2'
                      }
                    }),
                    // Content
                    React.createElement(
                      'div',
                      {
                        style: {
                          position: 'relative',
                          zIndex: '3',
                          padding: '1.5rem',
                          color: '#ffffff',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.6rem'
                        }
                      },
                      React.createElement('h4', { style: { fontSize: '1.1rem', fontWeight: '800', margin: '0', color: '#ffffff', lineHeight: '1.3' } }, item.title),
                      React.createElement('p', { style: { fontSize: '0.8rem', opacity: '0.85', margin: '0', lineHeight: '1.4', color: '#f0f0f0' } }, item.description),
                      React.createElement(
                        'div',
                        {
                          style: {
                            display: 'inline-flex',
                            alignItems: 'center',
                            fontSize: '0.85rem',
                            fontWeight: '600',
                            color: 'var(--primary-color)',
                            marginTop: '0.4rem',
                            gap: '0.3rem'
                          }
                        },
                        'Read more',
                        React.createElement('svg', { width: '14', height: '14', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: '2.5', strokeLinecap: 'round', strokeLinejoin: 'round' },
                          React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' }),
                          React.createElement('polyline', { points: '12 5 19 12 12 19' })
                        )
                      )
                    )
                  )
                )
              )
            )
          )
        ),

        // INDICATOR DOTS
        React.createElement(
          'div',
          { style: { display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1.5rem' } },
          caseStudiesData.map((_, index) =>
            React.createElement('button', {
              key: index,
              onClick: () => setCurrentSlide(index),
              style: {
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                border: 'none',
                padding: '0',
                cursor: 'pointer',
                background: currentSlide === index ? 'var(--primary-color)' : 'rgba(76, 175, 80, 0.2)',
                transition: 'background 0.3s ease'
              },
              'aria-label': `Go to slide ${index + 1}`
            })
          )
        )
      )
    ),

    // FOOTER ABOUT BLOCK
    React.createElement('hr', { style: { border: '0', height: '1px', background: 'var(--border-light)', margin: '3rem 0' } }),
    React.createElement(
      'footer',
      { style: { textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem', paddingBottom: '2rem' } },
      React.createElement('p', { style: { marginBottom: '0.5rem' } }, 'FoodBridge © 2026. Made with 💚 to protect our environment and support our neighbors.'),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '1rem', justifyContent: 'center', marginTop: '0.5rem' } },
        React.createElement('span', null, 'AI Waste Engine v1.2'),
        React.createElement('span', { style: { color: 'var(--border-color)' } }, '|'),
        React.createElement('span', null, 'Zero Hunger Initiative')
      )
    )
  );
};

export default LandingPage;

