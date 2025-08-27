import type { ThemeDefinition } from './types';

const darkTheme: ThemeDefinition = {
  id: 'dark',
  label: 'Dark',
  version: 1,
  mode: 'dark',
  semantic: {
    primary: '#00A86B',
    primaryHover: '#34D399',
    primaryActive: '#047857',
    textPrimary: '#F9FAFB',
    textSecondary: '#D1D5DB',
    textMuted: '#9CA3AF',
    textInverse: '#111827',
    textBrand: '#34D399',
    bgPrimary: '#111827',
    bgSecondary: '#1F2937',
    bgMuted: '#374151',
    surfaceSubtleHover: 'rgba(55,65,81,0.85)',
    surfaceInverse: '#374151',
    surfaceInverseAlt: '#4B5563',
    border: '#374151',
    borderFocus: '#00A86B',
    borderError: '#F87171',
    focusRing: '#00A86B',
    success: '#22C55E',
    successBg: '#064E3B',
    warning: '#F59E0B',
    warningBg: '#78350F',
    error: '#EF4444',
    errorBg: '#7F1D1D',
  },
  description: 'Dark theme tuned for contrast.',
};

export default darkTheme;
