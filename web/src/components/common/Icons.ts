import React from 'react';

interface IconProps {
  className?: string;
  size?: number;
  color?: string;
  style?: React.CSSProperties;
}

const createSvg = (
  pathData: React.ReactNode,
  size = 24,
  color = 'currentColor',
  className = '',
  style: React.CSSProperties = {}
) => {
  return React.createElement(
    'svg',
    {
      xmlns: 'http://www.w3.org/2000/svg',
      width: size,
      height: size,
      viewBox: '0 0 24 24',
      fill: 'none',
      stroke: color,
      strokeWidth: '2',
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      className: `svg-animated ${className}`,
      style,
    },
    pathData
  );
};

export const Icons = {
  Logo: ({ size = 28, color = 'var(--primary-color)', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M16 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
        React.createElement('path', { d: 'M18 6.5a2.5 2.5 0 1 1 3.5 3.5L12 19l-4 1 1-4Z' })
      ),
      size,
      color,
      className,
      style
    ),

  Leaf: ({ size = 20, color = 'var(--primary-color)', className = '', style }: IconProps) =>
    createSvg(
      React.createElement('path', { d: 'M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.58 0 8a7 7 0 0 1-8 10Z' }),
      size,
      color,
      className,
      style
    ),

  Plus: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
        React.createElement('line', { x1: '5', y1: '12', x2: '19', y2: '12' })
      ),
      size,
      color,
      className,
      style
    ),

  User: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2' }),
        React.createElement('circle', { cx: '12', cy: '7', r: '4' })
      ),
      size,
      color,
      className,
      style
    ),

  Trophy: ({ size = 24, color = 'var(--secondary-color)', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M6 9H4.5a2.5 2.5 0 0 1 0-5H6' }),
        React.createElement('path', { d: 'M18 9h1.5a2.5 2.5 0 0 0 0-5H18' }),
        React.createElement('path', { d: 'M4 22h16' }),
        React.createElement('path', { d: 'M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34' }),
        React.createElement('path', { d: 'M12 2a15 15 0 0 1 6 12H6a15 15 0 0 1 6-12Z' })
      ),
      size,
      color,
      className,
      style
    ),

  MapPin: ({ size = 16, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z' }),
        React.createElement('circle', { cx: '12', cy: '10', r: '3' })
      ),
      size,
      color,
      className,
      style
    ),

  Calendar: ({ size = 16, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('rect', { x: '3', y: '4', width: '18', height: '18', rx: '2', ry: '2' }),
        React.createElement('line', { x1: '16', y1: '2', x2: '16', y2: '6' }),
        React.createElement('line', { x1: '8', y1: '2', x2: '8', y2: '6' }),
        React.createElement('line', { x1: '3', y1: '10', x2: '21', y2: '10' })
      ),
      size,
      color,
      className,
      style
    ),

  LogOut: ({ size = 18, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4' }),
        React.createElement('polyline', { points: '16 17 21 12 16 7' }),
        React.createElement('line', { x1: '21', y1: '12', x2: '9', y2: '12' })
      ),
      size,
      color,
      className,
      style
    ),

  Award: ({ size = 16, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('circle', { cx: '12', cy: '8', r: '7' }),
        React.createElement('polyline', { points: '8.21 13.89 7 23 12 20 17 23 15.79 13.88' })
      ),
      size,
      color,
      className,
      style
    ),

  Utensils: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M4 3v7a6 6 0 0 0 4 5.65v5.35a1 1 0 0 0 2 0v-5.35A6 6 0 0 0 14 10V3' }),
        React.createElement('path', { d: 'M9 3v4' }),
        React.createElement('path', { d: 'M18 8v12a1 1 0 0 1-2 0V3s3 0 3 5Z' })
      ),
      size,
      color,
      className,
      style
    ),

  Heart: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement('path', { d: 'M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z' }),
      size,
      color,
      className,
      style
    ),

  TrendingUp: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('polyline', { points: '23 6 13.5 15.5 8.5 10.5 1 18' }),
        React.createElement('polyline', { points: '17 6 23 6 23 12' })
      ),
      size,
      color,
      className,
      style
    ),

  CheckCircle: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M22 11.08V12a10 10 0 1 1-5.93-9.14' }),
        React.createElement('polyline', { points: '22 4 12 14.01 9 11.01' })
      ),
      size,
      color,
      className,
      style
    ),

  Bell: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9Z' }),
        React.createElement('path', { d: 'M13.73 21a2 2 0 0 1-3.46 0' })
      ),
      size,
      color,
      className,
      style
    ),

  Trash: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('polyline', { points: '3 6 5 6 21 6' }),
        React.createElement('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' }),
        React.createElement('line', { x1: '10', y1: '11', x2: '10', y2: '17' }),
        React.createElement('line', { x1: '14', y1: '11', x2: '14', y2: '17' })
      ),
      size,
      color,
      className,
      style
    ),

  Upload: ({ size = 20, color = 'currentColor', className = '', style }: IconProps) =>
    createSvg(
      React.createElement(React.Fragment, null,
        React.createElement('path', { d: 'M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4' }),
        React.createElement('polyline', { points: '17 8 12 3 7 8' }),
        React.createElement('line', { x1: '12', y1: '3', x2: '12', y2: '15' })
      ),
      size,
      color,
      className,
      style
    ),
};

export default Icons;
