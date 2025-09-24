/* src/types/global.d.ts - Global type definitions for MeetPin */

/**
 * 글로벌 타입 정의 파일
 * 프로젝트 전체에서 사용되는 공통 타입들을 정의합니다.
 */

// =============================================================================
// 사용자 및 인증 관련 타입
// =============================================================================

export interface User {
  uid: string
  email: string
  nickname?: string
  age_range?: string
  intro?: string
  avatar_url?: string
  role: 'user' | 'admin'
  referral_code?: string
  created_at: string
  updated_at: string
}

export interface AuthSession {
  user: User | null
  loading: boolean
  error?: string
}

// =============================================================================
// 모임(Room) 관련 타입
// =============================================================================

export interface Room {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  fee: number
  visibility: 'public' | 'private'
  description?: string
  host_uid: string
  boost_until?: string
  created_at: string
  updated_at: string
  
  // Relations (populated when needed)
  host?: User
  participants_count?: number
  user_request_status?: 'pending' | 'accepted' | 'rejected' | null
  is_host?: boolean
}

export interface RoomCreateData {
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  fee: number
  visibility: 'public' | 'private'
  description?: string
}

// =============================================================================
// 요청 및 매칭 관련 타입
// =============================================================================

export interface JoinRequest {
  id: string
  room_id: string
  requester_uid: string
  message?: string
  status: 'pending' | 'accepted' | 'rejected'
  created_at: string
  updated_at: string
  
  // Relations
  room?: Room
  requester?: User
}

export interface Match {
  id: string
  room_id: string
  requester_uid: string
  responder_uid: string
  created_at: string
  
  // Relations
  room?: Room
  requester?: User
  responder?: User
}

export interface Message {
  id: string
  match_id: string
  sender_uid: string
  text: string
  created_at: string
  
  // Relations
  sender?: User
}

// =============================================================================
// 지도 및 위치 관련 타입
// =============================================================================

export interface Coordinates {
  lat: number
  lng: number
}

export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

export interface MapBounds {
  sw: Coordinates
  ne: Coordinates
}

// =============================================================================
// API 응답 타입
// =============================================================================

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}

export interface PaginatedResponse<T> {
  items: T[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface ErrorResponse {
  ok: false
  code: string
  message: string
  details?: any
}

// =============================================================================
// 컴포넌트 Props 타입
// =============================================================================

export interface BaseComponentProps {
  className?: string
  children?: React.ReactNode
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning' | 'ghost' | 'outline'
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  disabled?: boolean
  loading?: boolean
  fullWidth?: boolean
  onClick?: () => void
}

export interface ModalProps extends BaseComponentProps {
  isOpen: boolean
  onClose: () => void
  title?: string
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl'
}

// =============================================================================
// 폼 데이터 타입
// =============================================================================

export interface LoginFormData {
  email: string
  password: string
}

export interface SignupFormData {
  email: string
  password: string
  confirmPassword: string
  nickname: string
  age_range: string
  intro?: string
}

export interface ProfileUpdateData {
  nickname?: string
  age_range?: string
  intro?: string
  avatar_url?: string
}

// =============================================================================
// 유틸리티 타입
// =============================================================================

export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>
export type Required<T, K extends keyof T> = T & Required<Pick<T, K>>

export type AgeRange = '20s_early' | '20s_late' | '30s_early' | '30s_late' | '40s' | '50s+'
export type Category = 'drink' | 'exercise' | 'other'
export type RoomStatus = 'active' | 'cancelled' | 'completed'
export type RequestStatus = 'pending' | 'accepted' | 'rejected'

// =============================================================================
// 외부 라이브러리 타입 확장
// =============================================================================

declare global {
  interface Window {
    kakao?: any
    gtag?: (
      command: 'config' | 'event' | 'consent',
      targetId: string | any,
      config?: any
    ) => void
  }
  
  namespace NodeJS {
    interface ProcessEnv {
      NEXT_PUBLIC_SUPABASE_URL: string
      NEXT_PUBLIC_SUPABASE_ANON_KEY: string
      SUPABASE_SERVICE_ROLE_KEY: string
      NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: string
      STRIPE_SECRET_KEY: string
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
      STRIPE_WEBHOOK_SECRET: string
      SITE_URL: string
    }
  }
}

// =============================================================================
// 결제 관련 타입
// =============================================================================

export interface BoostProduct {
  days: '1' | '3' | '7'
  price: number
  priceId: string
  name: string
  description: string
}

export interface PaymentSession {
  id: string
  url: string
  success_url: string
  cancel_url: string
}

// =============================================================================
// 관리자 관련 타입
// =============================================================================

export interface AdminStats {
  totalUsers: number
  totalRooms: number
  totalMatches: number
  totalReports: number
  pendingReports: number
  activeRooms: number
}

export interface Report {
  id: string
  reporter_uid: string
  target_uid: string
  room_id?: string
  reason: string
  status: 'pending' | 'reviewed' | 'resolved'
  created_at: string
  
  // Relations
  reporter?: User
  target?: User
  room?: Room
}

// =============================================================================
// 이벤트 타입
// =============================================================================

export interface CustomEvent<T = any> {
  type: string
  data: T
  timestamp: Date
}

export interface WebSocketMessage {
  event: string
  payload: any
  channel?: string
}

// =============================================================================
// 검색 및 필터링 타입
// =============================================================================

export interface SearchFilters {
  category?: Category
  startDate?: string
  endDate?: string
  maxFee?: number
  minPeople?: number
  maxPeople?: number
  location?: Coordinates
  radius?: number
}

export interface SortOptions {
  field: 'created_at' | 'start_at' | 'participants_count' | 'fee'
  direction: 'asc' | 'desc'
}

// 타입을 모듈로 내보내기
export {}