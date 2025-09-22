/**
 * 밋핀 프리미엄 디자인 시스템
 * 고급스럽고 매력적인 UI/UX를 위한 확장된 테마 시스템
 */

export const premiumColors = {
  // Sophisticated Primary Palette
  primary: {
    50: '#F0FDF9',
    100: '#CCFBEF',
    200: '#99F6E0',
    300: '#5EEACA',
    400: '#22D3AA',
    500: '#10B981', // 기존 primary
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
    950: '#022C22',
  },

  // Luxury Gradients
  gradients: {
    primary: 'linear-gradient(135deg, #10B981 0%, #059669 100%)',
    warm: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
    cool: 'linear-gradient(135deg, #3B82F6 0%, #1D4ED8 100%)',
    sunset: 'linear-gradient(135deg, #F97316 0%, #EA580C 100%)',
    aurora: 'linear-gradient(135deg, #8B5CF6 0%, #7C3AED 100%)',
    glass: 'linear-gradient(135deg, rgba(255,255,255,0.25) 0%, rgba(255,255,255,0.1) 100%)',
  },

  // Advanced Neutral System
  neutral: {
    0: '#FFFFFF',
    50: '#FAFAFA',
    100: '#F5F5F5',
    200: '#E5E5E5',
    300: '#D4D4D4',
    400: '#A3A3A3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0A0A0A',
  },

  // Semantic Colors with depth
  semantic: {
    success: {
      light: '#DCFCE7',
      main: '#22C55E',
      dark: '#15803D',
    },
    warning: {
      light: '#FEF3C7',
      main: '#F59E0B',
      dark: '#D97706',
    },
    error: {
      light: '#FEE2E2',
      main: '#EF4444',
      dark: '#DC2626',
    },
    info: {
      light: '#DBEAFE',
      main: '#3B82F6',
      dark: '#1D4ED8',
    },
  },

  // Glass & Blur effects
  glass: {
    white: 'rgba(255, 255, 255, 0.25)',
    dark: 'rgba(0, 0, 0, 0.25)',
    primary: 'rgba(16, 185, 129, 0.25)',
  },
}

export const premiumShadows = {
  xs: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  sm: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)',
  md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -2px rgba(0, 0, 0, 0.1)',
  lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
  xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)',
  '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Custom premium shadows
  glow: '0 0 20px rgba(16, 185, 129, 0.3)',
  card: '0 4px 20px rgba(0, 0, 0, 0.08)',
  float: '0 8px 30px rgba(0, 0, 0, 0.12)',
  dramatic: '0 32px 64px rgba(0, 0, 0, 0.2)',
}

export const premiumTypography = {
  // Font stacks
  fontFamily: {
    display: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol', 'sans-serif'],
    body: ['Pretendard Variable', 'Pretendard', '-apple-system', 'BlinkMacSystemFont', 'system-ui', 'Roboto', 'Helvetica Neue', 'Segoe UI', 'Apple SD Gothic Neo', 'Noto Sans KR', 'Malgun Gothic', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Inconsolata', 'Roboto Mono', 'Consolas', 'monospace'],
  },

  // Scale with Korean optimization
  fontSize: {
    xs: ['0.75rem', { lineHeight: '1rem' }],
    sm: ['0.875rem', { lineHeight: '1.25rem' }],
    base: ['1rem', { lineHeight: '1.5rem' }],
    lg: ['1.125rem', { lineHeight: '1.75rem' }],
    xl: ['1.25rem', { lineHeight: '1.75rem' }],
    '2xl': ['1.5rem', { lineHeight: '2rem' }],
    '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
    '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
    '5xl': ['3rem', { lineHeight: '1' }],
    '6xl': ['3.75rem', { lineHeight: '1' }],
    '7xl': ['4.5rem', { lineHeight: '1' }],
    '8xl': ['6rem', { lineHeight: '1' }],
    '9xl': ['8rem', { lineHeight: '1' }],
  },

  // Korean-optimized line heights
  lineHeight: {
    none: '1',
    tight: '1.25',
    snug: '1.375',
    normal: '1.5',
    relaxed: '1.625',
    loose: '2',
  },
}

export const premiumSpacing = {
  // Enhanced spacing scale
  px: '1px',
  0: '0px',
  0.5: '0.125rem',
  1: '0.25rem',
  1.5: '0.375rem',
  2: '0.5rem',
  2.5: '0.625rem',
  3: '0.75rem',
  3.5: '0.875rem',
  4: '1rem',
  5: '1.25rem',
  6: '1.5rem',
  7: '1.75rem',
  8: '2rem',
  9: '2.25rem',
  10: '2.5rem',
  11: '2.75rem',
  12: '3rem',
  14: '3.5rem',
  16: '4rem',
  20: '5rem',
  24: '6rem',
  28: '7rem',
  32: '8rem',
  36: '9rem',
  40: '10rem',
  44: '11rem',
  48: '12rem',
  52: '13rem',
  56: '14rem',
  60: '15rem',
  64: '16rem',
  72: '18rem',
  80: '20rem',
  96: '24rem',
}

export const premiumBorderRadius = {
  none: '0px',
  sm: '0.125rem',
  base: '0.25rem',
  md: '0.375rem',
  lg: '0.5rem',
  xl: '0.75rem',
  '2xl': '1rem',
  '3xl': '1.5rem',
  full: '9999px',
}

export const premiumAnimations = {
  // Smooth transitions
  transition: {
    none: 'none',
    all: 'all 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    colors: 'color 150ms cubic-bezier(0.4, 0, 0.2, 1), background-color 150ms cubic-bezier(0.4, 0, 0.2, 1), border-color 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    opacity: 'opacity 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    shadow: 'box-shadow 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    transform: 'transform 150ms cubic-bezier(0.4, 0, 0.2, 1)',
    smooth: 'all 300ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    bounce: 'all 500ms cubic-bezier(0.68, -0.55, 0.265, 1.55)',
  },

  // Premium keyframes
  keyframes: {
    fadeIn: {
      '0%': { opacity: '0', transform: 'translateY(10px)' },
      '100%': { opacity: '1', transform: 'translateY(0)' },
    },
    slideUp: {
      '0%': { transform: 'translateY(100%)' },
      '100%': { transform: 'translateY(0)' },
    },
    scaleIn: {
      '0%': { opacity: '0', transform: 'scale(0.9)' },
      '100%': { opacity: '1', transform: 'scale(1)' },
    },
    shimmer: {
      '0%': { transform: 'translateX(-100%)' },
      '100%': { transform: 'translateX(100%)' },
    },
    pulse: {
      '0%, 100%': { opacity: '1' },
      '50%': { opacity: '0.5' },
    },
    bounce: {
      '0%, 100%': { transform: 'translateY(-25%)', animationTimingFunction: 'cubic-bezier(0.8, 0, 1, 1)' },
      '50%': { transform: 'translateY(0)', animationTimingFunction: 'cubic-bezier(0, 0, 0.2, 1)' },
    },
  },
}

// Component-specific design tokens
export const componentTokens = {
  button: {
    height: {
      sm: '2rem',
      md: '2.5rem',
      lg: '3rem',
      xl: '3.5rem',
    },
    padding: {
      sm: '0.5rem 1rem',
      md: '0.75rem 1.5rem',
      lg: '1rem 2rem',
      xl: '1.25rem 2.5rem',
    },
  },
  
  card: {
    padding: {
      sm: '1rem',
      md: '1.5rem',
      lg: '2rem',
      xl: '2.5rem',
    },
    radius: '1rem',
    shadow: premiumShadows.card,
  },

  input: {
    height: {
      sm: '2.25rem',
      md: '2.75rem',
      lg: '3.25rem',
    },
    padding: {
      sm: '0.5rem 0.75rem',
      md: '0.75rem 1rem',
      lg: '1rem 1.25rem',
    },
  },
}

// Export comprehensive theme
export const premiumTheme = {
  colors: premiumColors,
  shadows: premiumShadows,
  typography: premiumTypography,
  spacing: premiumSpacing,
  borderRadius: premiumBorderRadius,
  animations: premiumAnimations,
  components: componentTokens,
}

export default premiumTheme