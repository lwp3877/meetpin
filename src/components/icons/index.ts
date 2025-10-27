/* src/components/icons/index.ts */
// 🎯 중앙 집중식 아이콘 관리 시스템
// Tree-shaking 최적화를 위한 개별 import + Re-export 패턴

// === Core UI Icons ===
export { default as Bell } from 'lucide-react/dist/esm/icons/bell'
export { default as BellOff } from 'lucide-react/dist/esm/icons/bell-off'
export { default as X } from 'lucide-react/dist/esm/icons/x'
export { default as Check } from 'lucide-react/dist/esm/icons/check'
export { default as CheckCircle } from 'lucide-react/dist/esm/icons/check-circle'
export { default as ChevronDown } from 'lucide-react/dist/esm/icons/chevron-down'
export { default as ChevronUp } from 'lucide-react/dist/esm/icons/chevron-up'
export { default as ChevronRight } from 'lucide-react/dist/esm/icons/chevron-right'
export { default as Loader2 } from 'lucide-react/dist/esm/icons/loader-2'

// === Map & Navigation Icons ===
export { default as MapPin } from 'lucide-react/dist/esm/icons/map-pin'
export { default as Navigation } from 'lucide-react/dist/esm/icons/navigation'
export { default as Search } from 'lucide-react/dist/esm/icons/search'
export { default as Filter } from 'lucide-react/dist/esm/icons/filter'
export { default as SlidersHorizontal } from 'lucide-react/dist/esm/icons/sliders-horizontal'

// === User & Profile Icons ===
export { default as User } from 'lucide-react/dist/esm/icons/user'
export { default as Users } from 'lucide-react/dist/esm/icons/users'
export { default as LogOut } from 'lucide-react/dist/esm/icons/log-out'
export { default as Settings } from 'lucide-react/dist/esm/icons/settings'

// === Communication Icons ===
export { default as Mail } from 'lucide-react/dist/esm/icons/mail'
export { default as MessageCircle } from 'lucide-react/dist/esm/icons/message-circle'
export { default as MessageSquare } from 'lucide-react/dist/esm/icons/message-square'
export { default as Send } from 'lucide-react/dist/esm/icons/send'
export { default as Phone } from 'lucide-react/dist/esm/icons/phone'

// === Action Icons ===
export { default as Plus } from 'lucide-react/dist/esm/icons/plus'
export { default as Edit } from 'lucide-react/dist/esm/icons/edit'
export { default as Upload } from 'lucide-react/dist/esm/icons/upload'
export { default as Download } from 'lucide-react/dist/esm/icons/download'
export { default as Share2 } from 'lucide-react/dist/esm/icons/share-2'
export { default as RefreshCw } from 'lucide-react/dist/esm/icons/refresh-cw'

// === Status & Alert Icons ===
export { default as AlertCircle } from 'lucide-react/dist/esm/icons/alert-circle'
export { default as AlertTriangle } from 'lucide-react/dist/esm/icons/alert-triangle'
export { default as Info } from 'lucide-react/dist/esm/icons/info'
export { default as HelpCircle } from 'lucide-react/dist/esm/icons/help-circle'
export { default as XCircle } from 'lucide-react/dist/esm/icons/x-circle'

// === Time & Calendar Icons ===
export { default as Calendar } from 'lucide-react/dist/esm/icons/calendar'
export { default as Clock } from 'lucide-react/dist/esm/icons/clock'

// === Media Icons ===
export { default as ImageIcon } from 'lucide-react/dist/esm/icons/image'
export { default as Camera } from 'lucide-react/dist/esm/icons/camera'

// === Payment Icons ===
export { default as DollarSign } from 'lucide-react/dist/esm/icons/dollar-sign'
export { default as CreditCard } from 'lucide-react/dist/esm/icons/credit-card'
export { default as TrendingUp } from 'lucide-react/dist/esm/icons/trending-up'
export { default as Zap } from 'lucide-react/dist/esm/icons/zap'

// === Engagement Icons ===
export { default as Star } from 'lucide-react/dist/esm/icons/star'
export { default as Heart } from 'lucide-react/dist/esm/icons/heart'
export { default as Gift } from 'lucide-react/dist/esm/icons/gift'
export { default as Trophy } from 'lucide-react/dist/esm/icons/trophy'
export { default as Award } from 'lucide-react/dist/esm/icons/award'

// === Theme Icons ===
export { default as Sun } from 'lucide-react/dist/esm/icons/sun'
export { default as Moon } from 'lucide-react/dist/esm/icons/moon'

// === PWA & Device Icons ===
export { default as Smartphone } from 'lucide-react/dist/esm/icons/smartphone'
export { default as Wifi } from 'lucide-react/dist/esm/icons/wifi'
export { default as WifiOff } from 'lucide-react/dist/esm/icons/wifi-off'
export { default as Volume2 } from 'lucide-react/dist/esm/icons/volume-2'
export { default as VolumeX } from 'lucide-react/dist/esm/icons/volume-x'
export { default as Vibrate } from 'lucide-react/dist/esm/icons/vibrate'

// === Security Icons ===
export { default as Shield } from 'lucide-react/dist/esm/icons/shield'

// === Misc Icons ===
export { default as Home } from 'lucide-react/dist/esm/icons/home'
export { default as Activity } from 'lucide-react/dist/esm/icons/activity'
export { default as Bug } from 'lucide-react/dist/esm/icons/bug'
export { default as Circle } from 'lucide-react/dist/esm/icons/circle'
export { default as Shuffle } from 'lucide-react/dist/esm/icons/shuffle'
export { default as ArrowLeft } from 'lucide-react/dist/esm/icons/arrow-left'
export { default as ArrowRight } from 'lucide-react/dist/esm/icons/arrow-right'

/**
 * 사용 가이드:
 *
 * // Before (개별 파일마다 import)
 * import Bell from 'lucide-react/dist/esm/icons/bell'
 * import X from 'lucide-react/dist/esm/icons/x'
 *
 * // After (중앙 집중식)
 * import { Bell, X } from '@/components/icons'
 *
 * 장점:
 * 1. Import 문 간결화 (1줄로 여러 아이콘)
 * 2. Tree-shaking 100% 보장 (개별 import 패턴 유지)
 * 3. 타입 안정성 유지 (TypeScript 자동 추론)
 * 4. 번들 사이즈 변화 없음 (동일한 개별 import 사용)
 * 5. 유지보수 용이 (사용 아이콘 한눈에 파악)
 */
