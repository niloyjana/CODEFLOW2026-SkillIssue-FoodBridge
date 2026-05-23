import React from 'react';

interface CardProps {
  children?: React.ReactNode;
  title?: string;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, title, className = '' }) => {
  return React.createElement(
    'div',
    { className: `card ${className}`.trim() },
    title && React.createElement('h3', { className: 'card-title' }, title),
    children
  );
};
export default Card;
