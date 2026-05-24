import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Icons from '../common/Icons';
import { apiService } from '../../services/api';

type MealTime = 'breakfast' | 'lunch' | 'dinner';
type VenueType = 'cafe' | 'restaurant' | 'fastfood';

interface PostFormProps {
  onCreatePost?: (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
    useAi: boolean;
  }) => Promise<void>;
  loading?: boolean;
  restaurantId?: string;
}

export const PostForm: React.FC<PostFormProps> = ({ onCreatePost, loading = false, restaurantId }) => {
  const [portions, setPortions] = useState<string>('');
  const [mealTime, setMealTime] = useState<MealTime>('lunch');
  const [venueType, setVenueType] = useState<VenueType>('restaurant');
  const [seatingCapacity, setSeatingCapacity] = useState<number>(30);
  const [aiRecommendation, setAiRecommendation] = useState<string | null>(null);
  const [predicting, setPredicting] = useState<boolean>(false);

  const handlePostClick = (e: React.MouseEvent) => {
    e.preventDefault();
    const portionsNum = parseInt(portions) || 0;
    if (portionsNum <= 0 || seatingCapacity <= 0) {
      alert('Please enter valid portions and seating capacity.');
      return;
    }
    if (onCreatePost) {
      onCreatePost({
        portions: portionsNum,
        mealTime,
        venueType,
        seatingCapacity,
        useAi: aiRecommendation !== null,
      });
      // Clear recommendation after posting
      setAiRecommendation(null);
    }
  };

  const handlePredict = async (e: React.MouseEvent) => {
    e.preventDefault();
    const portionsNum = parseInt(portions) || 0;
    if (portionsNum <= 0 || seatingCapacity <= 0) {
      alert('Please enter valid portions and seating capacity.');
      return;
    }
    setPredicting(true);
    setAiRecommendation(null);
    try {
      const result = await apiService.predictSurplus({
        portions: portionsNum,
        mealTime,
        venueType,
        seatingCapacity,
        restaurantId: restaurantId || '',
      });

      const avgSold = result.features?.avgSold;
      let surplusPortions = portionsNum;
      if (avgSold !== undefined && portionsNum > avgSold) {
        surplusPortions = Math.max(1, Math.round(portionsNum - avgSold));
      }
      const surplusKg = result.predictedSurplusKg;
      const feedPeopleMin = Math.max(1, Math.floor(surplusPortions * 0.5));
      const feedPeopleMax = Math.max(2, Math.ceil(surplusPortions * 0.6));
      const feedPeopleRange = `${feedPeopleMin}-${feedPeopleMax}`;

      setAiRecommendation(
        `Based on your sales history, you'll have ${surplusPortions} surplus portions tonight. That's ${surplusKg.toFixed(1)}kg of food that can feed ${feedPeopleRange} people. Post it on FoodBridge.`
      );
    } catch (err: any) {
      console.error(err);
      alert(`Prediction error: ${err.message || err}`);
    } finally {
      setPredicting(false);
    }
  };

  return React.createElement(
    Card,
    {
      title: 'Post Surplus Food',
      className: 'glass-panel hover-lift'
    },
    React.createElement(
      'form',
      { onSubmit: (e: React.FormEvent) => e.preventDefault(), className: 'mt-2' },
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { className: 'form-label', htmlFor: 'portions' }, 'Portions Available'),
        React.createElement('input', {
          id: 'portions',
          type: 'text',
          inputMode: 'numeric',
          pattern: '[0-9]*',
          placeholder: 'Enter number of surplus portions (e.g. 15)',
          className: 'form-control glow-focus',
          value: portions,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            const val = e.target.value;
            if (val === '' || /^\d+$/.test(val)) {
              setPortions(val);
              setAiRecommendation(null);
            }
          },
          required: true,
        })
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { className: 'form-label', htmlFor: 'mealTime' }, 'Meal Time'),
        React.createElement(
          'select',
          {
            id: 'mealTime',
            className: 'form-control glow-focus',
            value: mealTime,
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
              setMealTime(e.target.value as MealTime);
              setAiRecommendation(null);
            },
          },
          React.createElement('option', { value: 'breakfast' }, 'Breakfast'),
          React.createElement('option', { value: 'lunch' }, 'Lunch'),
          React.createElement('option', { value: 'dinner' }, 'Dinner')
        )
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { className: 'form-label', htmlFor: 'venueType' }, 'Venue Type'),
        React.createElement(
          'select',
          {
            id: 'venueType',
            className: 'form-control glow-focus',
            value: venueType,
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => {
              setVenueType(e.target.value as VenueType);
              setAiRecommendation(null);
            },
          },
          React.createElement('option', { value: 'restaurant' }, 'Restaurant'),
          React.createElement('option', { value: 'cafe' }, 'Cafe'),
          React.createElement('option', { value: 'fastfood' }, 'Fast Food')
        )
      ),
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { className: 'form-label', htmlFor: 'seatingCapacity' }, 'Seating Capacity'),
        React.createElement('input', {
          id: 'seatingCapacity',
          type: 'number',
          className: 'form-control glow-focus',
          value: seatingCapacity,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => {
            setSeatingCapacity(parseInt(e.target.value) || 0);
            setAiRecommendation(null);
          },
          min: 1,
          required: true,
        })
      ),
      aiRecommendation && React.createElement(
        'div',
        {
          className: 'glass-panel hover-lift',
          style: {
            marginTop: '1.25rem',
            padding: '1rem',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid rgba(76, 175, 80, 0.25)',
            background: 'linear-gradient(135deg, rgba(76, 175, 80, 0.04) 0%, rgba(139, 195, 74, 0.04) 100%)',
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.6rem'
          }
        },
        React.createElement(Icons.Leaf, { size: 18, color: 'var(--primary-color)', style: { marginTop: '0.1rem' } }),
        React.createElement(
          'div',
          null,
          React.createElement('span', { style: { fontWeight: '700', color: 'var(--primary-color)', fontSize: '0.9rem', display: 'block', marginBottom: '0.2rem' } }, 'AI Surplus Suggestion'),
          React.createElement('p', { style: { fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: '1.4' } }, aiRecommendation)
        )
      ),
      React.createElement(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '0.8rem', marginTop: '1.5rem' } },
        React.createElement(
          Button,
          {
            type: 'button',
            variant: 'primary',
            fullWidth: true,
            disabled: loading,
            onClick: handlePostClick,
            style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }
          },
          React.createElement(Icons.Plus, { size: 18 }),
          loading ? 'Posting...' : 'Post Surplus Food'
        ),
        React.createElement(
          Button,
          {
            type: 'button',
            variant: 'secondary',
            fullWidth: true,
            disabled: predicting || loading,
            onClick: handlePredict,
            style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem 1rem', border: '1px solid var(--primary-color)', color: 'var(--primary-color)', background: 'transparent' }
          },
          React.createElement(Icons.Leaf, { size: 18, color: 'var(--primary-color)' }),
          predicting ? 'Predicting...' : 'Predict with AI'
        )
      )
    )
  );
};

export default PostForm;
