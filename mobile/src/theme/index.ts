export const Colors = {
  primary: '#2E7D32',
  primaryLight: '#4CAF50',
  primaryGlow: 'rgba(46, 125, 50, 0.08)',
  secondary: '#FFC107',
  secondaryLight: '#FFD54F',
  accent: '#2196F3',
  accentLight: 'rgba(33, 150, 243, 0.1)',

  background: '#F8FAF8',
  surface: '#FFFFFF',
  surfaceElevated: 'rgba(255, 255, 255, 0.95)',

  textPrimary: '#1A2E1A',
  textSecondary: '#6B7B6B',
  textLight: '#9CA89C',

  border: 'rgba(46, 125, 50, 0.12)',
  borderLight: 'rgba(0, 0, 0, 0.06)',

  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',

  gold: '#FFD700',
  silver: '#C0C0C0',
  bronze: '#CD7F32',

  cardGradientStart: 'rgba(46, 125, 50, 0.05)',
  cardGradientEnd: 'rgba(139, 195, 74, 0.05)',
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  full: 9999,
};

export const FontSize = {
  xs: 11,
  sm: 13,
  md: 15,
  lg: 17,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  hero: 36,
};

export const FontWeight = {
  regular: '400' as const,
  medium: '500' as const,
  semibold: '600' as const,
  bold: '700' as const,
  extrabold: '800' as const,
};

export const Shadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 16,
    elevation: 8,
  },
};
