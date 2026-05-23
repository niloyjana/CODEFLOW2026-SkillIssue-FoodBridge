import React, { useState } from 'react';
import { usePosts } from '../../hooks/usePosts';
import Button from '../common/Button';
import Card from '../common/Card';

type MealTime = 'breakfast' | 'lunch' | 'dinner';
type VenueType = 'cafe' | 'restaurant' | 'fastfood';

export const PostForm: React.FC = () => {
  const { createPost, loading } = usePosts();
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
    createPost({
      portions,
      mealTime,
      venueType,
      seatingCapacity,
    });
  };

  return React.createElement(
    Card,
    { title: 'Predict & Post Surplus Food' },
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
          className: 'form-control',
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
            className: 'form-control',
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
            className: 'form-control',
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
          className: 'form-control',
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
          variant: 'primary',
          fullWidth: true,
          disabled: loading,
        },
        loading ? 'Analyzing Waste & Posting...' : 'Post surplus with AI prediction'
      )
    )
  );
};
export default PostForm;
