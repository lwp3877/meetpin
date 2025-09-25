// 동의 기반 분석 시스템 내보내기
export { default as AnalyticsManager, useAnalytics, AnalyticsEvents } from './AnalyticsManager'
export {
  default as GoogleAnalytics,
  useGoogleAnalytics,
  trackEvent,
  trackPageView,
} from './GoogleAnalytics'
export {
  default as PlausibleAnalytics,
  usePlausibleAnalytics,
  PlausibleEvents,
} from './PlausibleAnalytics'
export { default as ConsentGuard, AnalyticsGuard, MarketingGuard } from './ConsentGuard'
