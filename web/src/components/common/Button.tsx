import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  fullWidth = false,
  className = '',
  ...props
}) => {
  const baseClass = 'btn';
  const variantClass = `btn-${variant}`;
  const widthClass = fullWidth ? 'w-full' : '';
  const combinedClassName = `${baseClass} ${variantClass} ${widthClass} ${className}`.trim();

  return React.createElement(
    'button',
    {
      className: combinedClassName,
      style: fullWidth ? { width: '100%' } : undefined,
      ...props,
    },
    children
  );
};
export default Button;
