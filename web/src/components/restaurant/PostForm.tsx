import React, { useState } from 'react';
import Button from '../common/Button';
import Card from '../common/Card';
import Icons from '../common/Icons';

type MealTime = 'breakfast' | 'lunch' | 'dinner';
type VenueType = 'cafe' | 'restaurant' | 'fastfood';

interface PostFormProps {
  onCreatePost?: (postData: {
    portions: number;
    mealTime: 'breakfast' | 'lunch' | 'dinner';
    venueType: 'cafe' | 'restaurant' | 'fastfood';
    seatingCapacity: number;
  }) => Promise<void>;
  loading?: boolean;
}

export const PostForm: React.FC<PostFormProps> = ({ onCreatePost, loading = false }) => {
  const [portions, setPortions] = useState<number>(10);
  const [mealTime, setMealTime] = useState<MealTime>('lunch');
  const [venueType, setVenueType] = useState<VenueType>('restaurant');
  const [seatingCapacity, setSeatingCapacity] = useState<number>(30);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (portions <= 0 || seatingCapacity <= 0) {
      alert('Please enter valid portions and seating capacity.');
      return;
    }
    if (onCreatePost) {
      onCreatePost({
        portions,
        mealTime,
        venueType,
        seatingCapacity,
      });
    }
  };

  return React.createElement(
    Card,
    { 
      title: 'Predict & Post Surplus Food',
      className: 'glass-panel hover-lift' 
    },
    React.createElement(
      'form',
      { onSubmit: handleSubmit, className: 'mt-2' },
      React.createElement(
        'div',
        { className: 'form-group' },
        React.createElement('label', { className: 'form-label', htmlFor: 'portions' }, 'Portions Available'),
        React.createElement('input', {
          id: 'portions',
          type: 'number',
          className: 'form-control glow-focus',
          value: portions,
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setPortions(parseInt(e.target.value) || 0),
          min: 1,
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
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setMealTime(e.target.value as MealTime),
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
            onChange: (e: React.ChangeEvent<HTMLSelectElement>) => setVenueType(e.target.value as VenueType),
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
          onChange: (e: React.ChangeEvent<HTMLInputElement>) => setSeatingCapacity(parseInt(e.target.value) || 0),
          min: 1,
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
          style: { display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', padding: '0.65rem 1rem' }
        },
        React.createElement(Icons.Plus, { size: 18 }),
        loading ? 'Analyzing Waste & Posting...' : 'Post surplus with AI prediction'
      )
    )
  );
};
export default PostForm;
