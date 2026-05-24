import React, { useState, useRef } from 'react';
import { useAuth } from '../hooks/useAuth';
import { usePosts } from '../hooks/usePosts';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { formatDate, formatPortions } from 'shared/utils/format';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Icons from '../components/common/Icons';
import { OpenFreeMap, OpenFreeMapHandle, MapMarker } from '../components/map/OpenFreeMap';
import SearchBar from '../components/map/SearchBar';
import OptimizedRoutePlanner from '../components/map/OptimizedRoutePlanner';
import { OptimizedRoute } from '../services/routeOptimization';
import { DirectionsResult } from '../services/routing';
import DirectionsPanel from '../components/map/DirectionsPanel';

export const ShelterPage: React.FC = () => {
  const { user } = useAuth();
  const { posts, claimBulkOrder, completePost, loading } = usePosts();
  const { shelterLeaderboard } = useLeaderboard();
  
  // Portions selection state indexed by post ID
  const [selectedPortions, setSelectedPortions] = useState<Record<string, number>>({});
  const [routeGeometry, setRouteGeometry] = useState<Array<[number, number]> | undefined>(undefined);
  const [directionsResult, setDirectionsResult] = useState<DirectionsResult | null>(null);
  const [directionsTarget, setDirectionsTarget] = useState<{ lat: number; lng: number; name?: string } | null>(null);
  const mapRef = useRef<OpenFreeMapHandle>(null);

  // Active bulk posts available for claim
  const availablePosts = posts.filter(p => p.status === 'active' && p.portions > 0);

  // Posts claimed by this shelter
  const myClaimedPosts = posts.filter(p => p.claimedBy === user?.id);

  // Compute stats
  const shelterRank = shelterLeaderboard.findIndex(e => e.id === user?.id) + 1 || '-';
  const peopleServed = user?.peopleServed || 0;

  const handlePortionsChange = (postId: string, val: number, max: number) => {
    const num = Math.min(max, Math.max(1, val));
    setSelectedPortions(prev => ({ ...prev, [postId]: num }));
  };

  const handleClaim = async (postId: string, maxPortions: number) => {
    const portionsToClaim = selectedPortions[postId] || maxPortions;
    await claimBulkOrder(postId, portionsToClaim);
  };

  return React.createElement(
    'div',
    null,
    // STATS HEADER BANNER
    React.createElement(
      'div',
      {
        className: 'glass-panel hover-lift shimmer-card mask-reveal delay-1',
        style: {
          borderRadius: 'var(--radius-md)',
          padding: '2rem',
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(33, 150, 243, 0.05) 0%, rgba(156, 39, 176, 0.05) 100%)',
          border: '1px solid rgba(33, 150, 243, 0.15)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem'
        }
      },
      React.createElement(
        'div',
        null,
        React.createElement('h1', { style: { fontFamily: 'var(--font-heading)', color: 'var(--primary-color)', fontSize: '2rem', marginBottom: '0.2rem' } }, `Welcome back, ${user?.name || 'Shelter Partner'}!`),
        React.createElement('p', { style: { color: 'var(--text-secondary)', fontSize: '0.95rem' } }, 'Claim bulk food donations, manage distribution, and track community impact.')
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', gap: '1.5rem', flexWrap: 'wrap' } },
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(33,150,243,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'People Served'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' } }, peopleServed)
        ),
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(33,150,243,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'Shelter Points'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--secondary-color)' } }, `${user?.points || 0} pts`)
        ),
        React.createElement(
          'div',
          { style: { textAlign: 'center', minWidth: '95px', padding: '0.5rem', background: 'rgba(255,255,255,0.4)', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(33,150,243,0.1)' } },
          React.createElement('span', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '0.2rem', fontWeight: 600 } }, 'Leaderboard Rank'),
          React.createElement('span', { style: { fontSize: '1.35rem', fontWeight: '800', color: 'var(--primary-color)' } }, shelterRank > 0 ? `#${shelterRank}` : '-')
        )
      )
    ),

    // MAP SECTION
    React.createElement(
      'div',
      { className: 'map-section mask-reveal delay-2' },
      React.createElement(SearchBar, {
        placeholder: 'Search for restaurants near you...',
        onLocationSelect: (lat: number, lng: number, _name: string) => {
          mapRef.current?.flyTo([lng, lat], 15);
        },
      }),
      React.createElement(OpenFreeMap, {
        ref: mapRef,
        center: user?.lng && user?.lat ? [user.lng, user.lat] : [88.3639, 22.5726],
        zoom: 13,
        markers: availablePosts
          .filter(p => p.lat !== undefined && p.lng !== undefined)
          .map((p): MapMarker => ({
            id: p.id,
            lat: p.lat!,
            lng: p.lng!,
            label: p.restaurantName,
            subLabel: `${p.portions} portions · Pickup by ${formatDate(p.pickupBy)}`,
            color: 'green',
          })),
        routeGeometry: routeGeometry,
        height: '420px',
      }),
      // Optimized route planner for claimed posts
      myClaimedPosts.length > 0 && React.createElement(OptimizedRoutePlanner, {
        claimedPosts: myClaimedPosts.filter(p => p.status === 'claimed'),
        userLat: user?.lat || 40.7128,
        userLng: user?.lng || -74.006,
        userName: user?.name || 'Shelter',
        onViewRoute: (route: OptimizedRoute) => {
          // Build a polyline from the route stops
          const coords: Array<[number, number]> = [
            [user?.lng || -74.006, user?.lat || 40.7128],
            ...route.stops.map(s => [s.lng, s.lat] as [number, number]),
          ];
          setRouteGeometry(coords);
          if (mapRef.current && coords.length >= 2) {
            const lngs = coords.map(c => c[0]);
            const lats = coords.map(c => c[1]);
            mapRef.current.fitBounds([
              [Math.min(...lngs) - 0.01, Math.min(...lats) - 0.01],
              [Math.max(...lngs) + 0.01, Math.max(...lats) + 0.01],
            ]);
          }
        },
      }),
      // Directions panel
      directionsResult && directionsTarget && React.createElement(DirectionsPanel, {
        directions: directionsResult,
        from: { lat: user?.lat || 40.7128, lng: user?.lng || -74.006 },
        to: directionsTarget,
        fromLabel: user?.name || 'Your location',
        toLabel: directionsTarget.name || 'Restaurant',
        onClose: () => { setDirectionsResult(null); setDirectionsTarget(null); },
      })
    ),

    // MAIN DASHBOARD GRID
    React.createElement(
      'div',
      { className: 'dashboard-grid mask-reveal delay-3' },
      
      // LEFT SIDE: AVAILABLE BULK FOOD
      React.createElement(
        'div',
        null,
        React.createElement('h2', { className: 'mb-2' }, 'Available Bulk Food Posts'),
        availablePosts.length === 0
          ? React.createElement(
              Card,
              null,
              React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'No active bulk food posts available right now. Check back later!')
            )
          : React.createElement(
              'div',
              { className: 'posts-list' },
              availablePosts.map((post) => {
                const targetPortions = selectedPortions[post.id] || post.portions;
                const projectedPoints = targetPortions * 5;

                return React.createElement(
                  'div',
                  { key: post.id, className: 'card post-card glass-panel hover-lift' },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between align-center' },
                    React.createElement('h3', { style: { fontSize: '1.25rem', color: 'var(--primary-color)', display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } }, 
                      React.createElement(Icons.Utensils, { size: 18, color: 'var(--primary-color)' }),
                      post.restaurantName
                    ),
                    React.createElement(
                      'span',
                      { className: 'badge badge-active' },
                      'ACTIVE'
                    )
                  ),
                  React.createElement(
                    'p',
                    { style: { fontWeight: '600', margin: '0.5rem 0', fontSize: '1.1rem' } },
                    `Available Portions: ${post.portions}`
                  ),
                  React.createElement(
                    'div',
                    { className: 'post-meta-grid' },
                    post.address && React.createElement(
                      'div',
                      { className: 'meta-item', style: { gridColumn: 'span 2' } },
                      React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                        React.createElement(Icons.MapPin, { size: 12 }),
                        'Location Address'
                      ),
                      React.createElement('span', { className: 'meta-value' }, post.address)
                    ),
                    React.createElement(
                      'div',
                      { className: 'meta-item' },
                      React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                        React.createElement(Icons.Calendar, { size: 12, color: 'var(--secondary-color)' }),
                        'Pickup By'
                      ),
                      React.createElement('span', { className: 'meta-value', style: { color: 'var(--secondary-color)' } }, formatDate(post.pickupBy))
                    ),
                    React.createElement(
                      'div',
                      { className: 'meta-item' },
                      React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                        React.createElement(Icons.Leaf, { size: 12, color: 'var(--primary-color)' }),
                        'Est. Waste Saved'
                      ),
                      React.createElement('span', { className: 'meta-value', style: { color: 'var(--primary-color)', fontWeight: '600' } }, `${post.predictedWasteKg} kg`)
                    )
                  ),
                  
                  // Portion Claim Selector and Action Button
                  React.createElement(
                    'div',
                    { style: { marginTop: '1rem', display: 'flex', gap: '1rem', alignItems: 'center' } },
                    React.createElement(
                      'div',
                      { style: { display: 'flex', flexDirection: 'column', gap: '0.2rem', width: '120px' } },
                      React.createElement('label', { style: { fontSize: '0.75rem', color: 'var(--text-secondary)', fontWeight: 600 } }, 'Portions to Claim'),
                      React.createElement('input', {
                        type: 'number',
                        className: 'form-control glow-focus',
                        style: { padding: '0.4rem', fontSize: '0.9rem' },
                        min: 1,
                        max: post.portions,
                        value: targetPortions,
                        onChange: (e) => handlePortionsChange(post.id, Number(e.target.value), post.portions)
                      })
                    ),
                    React.createElement(
                      Button,
                      {
                        className: 'btn-premium',
                        style: { flex: 1, alignSelf: 'flex-end', height: '40px', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem' },
                        onClick: () => handleClaim(post.id, post.portions),
                        disabled: loading
                      },
                      React.createElement(Icons.CheckCircle, { size: 16 }),
                      `Claim for Shelter (+${projectedPoints} pts)`
                    )
                  )
                );
              })
            )
      ),

      // RIGHT SIDE: CLAIMED ORDERS & DISTRIBUTION
      React.createElement(
        'div',
        null,
        React.createElement('h2', { className: 'mb-2' }, 'Your Claimed Orders'),
        myClaimedPosts.length === 0
          ? React.createElement(
              Card,
              null,
              React.createElement('p', { className: 'text-center', style: { color: 'var(--text-secondary)' } }, 'You do not have any claimed orders. Browse and claim active posts on the left!')
            )
          : React.createElement(
              'div',
              { className: 'posts-list' },
              myClaimedPosts.map((post) =>
                React.createElement(
                  'div',
                  { key: post.id, className: `card post-card glass-panel hover-lift ${post.status === 'claimed' ? 'claimed' : 'completed'}` },
                  React.createElement(
                    'div',
                    { className: 'flex justify-between align-center' },
                    React.createElement('h4', { style: { display: 'inline-flex', alignItems: 'center', gap: '0.4rem' } }, 
                      React.createElement(Icons.Utensils, { size: 16, color: 'var(--primary-color)' }),
                      post.restaurantName
                    ),
                    React.createElement(
                      'span',
                      { className: `badge badge-${post.status}` },
                      post.status.toUpperCase()
                    )
                  ),
                  React.createElement(
                    'p',
                    { style: { margin: '0.5rem 0', fontWeight: '600' } },
                    formatPortions(post.portions)
                  ),
                  React.createElement(
                    'div',
                    { className: 'post-meta-grid', style: { marginBottom: '0.5rem' } },
                    post.address && React.createElement(
                      'div',
                      { className: 'meta-item', style: { gridColumn: 'span 2' } },
                      React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                        React.createElement(Icons.MapPin, { size: 12 }),
                        'Pickup Address'
                      ),
                      React.createElement('span', { className: 'meta-value' }, post.address)
                    ),
                    React.createElement(
                      'div',
                      { className: 'meta-item' },
                      React.createElement('span', { className: 'meta-label', style: { display: 'flex', alignItems: 'center', gap: '0.2rem' } }, 
                        React.createElement(Icons.Calendar, { size: 12 }),
                        'Pickup Deadline'
                      ),
                      React.createElement('span', { className: 'meta-value' }, formatDate(post.pickupBy))
                    )
                  ),
                  post.status === 'claimed'
                    ? React.createElement(
                        Button,
                        {
                          variant: 'secondary',
                          className: 'role-tab',
                          style: { width: '100%', padding: '0.5rem 1rem', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', border: '1px solid var(--border-color)' },
                          onClick: () => completePost(post.id),
                          disabled: loading
                        },
                        React.createElement(Icons.CheckCircle, { size: 14, color: 'var(--primary-color)' }),
                        'Mark as Distributed'
                      )
                    : React.createElement(
                        'p',
                        { style: { fontSize: '0.85rem', color: 'var(--primary-color)', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '0.6rem' } },
                        React.createElement(Icons.CheckCircle, { size: 14 }),
                        'Distributed to neighbors successfully!'
                      )
                )
              )
            )
      )
    )
  );
};

export default ShelterPage;
