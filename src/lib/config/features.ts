/* 파일경로: src/lib/features.ts */
/**
 * Feature flags for A/B testing and gradual rollouts
 */

interface FeatureFlags {
  // UI/UX Features
  ENABLE_ONBOARDING_MODAL: boolean
  ENABLE_DARK_MODE: boolean
  ENABLE_ADVANCED_SEARCH: boolean
  ENABLE_ROOM_CLUSTERING: boolean
  ENABLE_EMOJI_PICKER: boolean
  ENABLE_VIDEO_CALL: boolean
  ENABLE_AVATAR_CROPPER: boolean

  // Growth Features
  ENABLE_REFERRAL_CODE: boolean
  ENABLE_PUSH_NOTIFICATIONS: boolean
  ENABLE_SOCIAL_LOGIN: boolean
  ENABLE_RECOMMENDATION_SLIDER: boolean
  ENABLE_LOCATION_FILTER: boolean

  // Premium Features
  ENABLE_PREMIUM_BADGES: boolean
  ENABLE_ANALYTICS_DASHBOARD: boolean
  ENABLE_USER_INSIGHTS: boolean
}

// Environment-based feature flags
const getFeatureFlags = (): FeatureFlags => {
  return {
    // UI/UX Features
    ENABLE_ONBOARDING_MODAL: process.env.NEXT_PUBLIC_FEATURE_ONBOARDING === 'true',
    ENABLE_DARK_MODE: process.env.NEXT_PUBLIC_FEATURE_DARK_MODE === 'true',
    ENABLE_ADVANCED_SEARCH: process.env.NEXT_PUBLIC_FEATURE_ADVANCED_SEARCH !== 'false', // default true
    ENABLE_ROOM_CLUSTERING: process.env.NEXT_PUBLIC_FEATURE_CLUSTERING !== 'false', // default true
    ENABLE_EMOJI_PICKER: process.env.NEXT_PUBLIC_FEATURE_EMOJI_PICKER !== 'false', // default true
    ENABLE_VIDEO_CALL: process.env.NEXT_PUBLIC_FEATURE_VIDEO_CALL === 'true', // default false
    ENABLE_AVATAR_CROPPER: process.env.NEXT_PUBLIC_FEATURE_AVATAR_CROPPER === 'true', // default false

    // Growth Features
    ENABLE_REFERRAL_CODE: process.env.NEXT_PUBLIC_FEATURE_REFERRAL === 'true',
    ENABLE_PUSH_NOTIFICATIONS: process.env.NEXT_PUBLIC_FEATURE_PUSH === 'true',
    ENABLE_SOCIAL_LOGIN: process.env.NEXT_PUBLIC_FEATURE_SOCIAL_LOGIN !== 'false', // default true
    ENABLE_RECOMMENDATION_SLIDER: process.env.NEXT_PUBLIC_FEATURE_RECOMMENDATIONS !== 'false', // default true
    ENABLE_LOCATION_FILTER: process.env.NEXT_PUBLIC_FEATURE_LOCATION !== 'false', // default true

    // Premium Features
    ENABLE_PREMIUM_BADGES: process.env.NEXT_PUBLIC_FEATURE_PREMIUM_BADGES !== 'false', // default true
    ENABLE_ANALYTICS_DASHBOARD: process.env.NEXT_PUBLIC_FEATURE_ANALYTICS === 'true',
    ENABLE_USER_INSIGHTS: process.env.NEXT_PUBLIC_FEATURE_USER_INSIGHTS === 'true',
  }
}

// Singleton pattern for feature flags
let _featureFlags: FeatureFlags | null = null

export const getFeatures = (): FeatureFlags => {
  if (!_featureFlags) {
    _featureFlags = getFeatureFlags()
  }
  return _featureFlags
}

// Individual feature checkers for convenience
export const isFeatureEnabled = (feature: keyof FeatureFlags): boolean => {
  return getFeatures()[feature]
}

// A/B testing helper
export const getVariant = (testName: string, variants: string[]): string => {
  // Simple hash-based assignment for consistent user experience
  if (typeof window !== 'undefined') {
    const userId = localStorage.getItem('meetpin-user-id') || 'anonymous'
    const hash = Array.from(testName + userId).reduce((hash, char) => {
      return (hash << 5) - hash + char.charCodeAt(0)
    }, 0)
    const index = Math.abs(hash) % variants.length
    return variants[index]
  }
  return variants[0] // default to first variant on server
}


