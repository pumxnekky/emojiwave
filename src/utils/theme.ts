export const Colors = {
  // Brand
  primary: '#7C3AED',
  primaryLight: '#A78BFA',
  primaryDark: '#5B21B6',
  primaryBg: '#1A0533',

  // Accent
  wave: '#06B6D4',
  waveBg: '#0E3A45',

  // Backgrounds
  bg: '#0D0D1A',
  surface: '#16162A',
  surfaceHigh: '#1E1E38',
  surfaceBorder: '#2A2A4A',

  // Text
  textPrimary: '#F0EEFF',
  textSecondary: '#8B8BB0',
  textMuted: '#4A4A6A',

  // Semantic
  success: '#10B981',
  successBg: '#052E1C',
  danger: '#EF4444',
  dangerBg: '#2D0E0E',
  warning: '#F59E0B',

  // Emoji palette
  emojiGlow: 'rgba(124, 58, 237, 0.4)',
};

export const Typography = {
  display: { fontSize: 32, fontWeight: '700' as const, letterSpacing: -0.5 },
  title: { fontSize: 22, fontWeight: '700' as const, letterSpacing: -0.3 },
  heading: { fontSize: 18, fontWeight: '600' as const },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 22 },
  label: { fontSize: 13, fontWeight: '500' as const },
  caption: { fontSize: 11, fontWeight: '400' as const },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  full: 999,
};

export const Shadow = {
  glow: {
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 16,
    elevation: 12,
  },
  card: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
};
