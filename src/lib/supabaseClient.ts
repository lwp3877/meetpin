/* src/lib/supabaseClient.ts */
import { createClient } from '@supabase/supabase-js'
import { logger } from '@/lib/observability/logger'
import { createServerClient } from '@supabase/ssr'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

// 환경변수 유효성 검사
function validateEnvVars() {
  if (!supabaseUrl) {
    throw new Error('NEXT_PUBLIC_SUPABASE_URL is required')
  }
  if (!supabaseAnonKey) {
    throw new Error('NEXT_PUBLIC_SUPABASE_ANON_KEY is required')
  }
  return { supabaseUrl, supabaseAnonKey }
}

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          uid: string
          nickname: string | null
          email: string | null
          age_range:
            | 'early_twenties'
            | 'late_twenties'
            | 'early_thirties'
            | 'late_thirties'
            | 'forties'
            | 'fifties_plus'
            | null
          avatar_url: string | null
          intro: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          uid: string
          nickname?: string | null
          email?: string | null
          age_range?:
            | 'early_twenties'
            | 'late_twenties'
            | 'early_thirties'
            | 'late_thirties'
            | 'forties'
            | 'fifties_plus'
            | null
          avatar_url?: string | null
          intro?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          uid?: string
          nickname?: string | null
          email?: string | null
          age_range?:
            | 'early_twenties'
            | 'late_twenties'
            | 'early_thirties'
            | 'late_thirties'
            | 'forties'
            | 'fifties_plus'
            | null
          avatar_url?: string | null
          intro?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      rooms: {
        Row: {
          id: string
          host_uid: string
          title: string
          category: 'drink' | 'exercise' | 'other'
          lat: number
          lng: number
          place_text: string
          start_at: string
          max_people: number
          fee: number
          visibility: 'public' | 'private'
          boost_until: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          host_uid: string
          title: string
          category: 'drink' | 'exercise' | 'other'
          lat: number
          lng: number
          place_text: string
          start_at: string
          max_people?: number
          fee?: number
          visibility?: 'public' | 'private'
          boost_until?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          host_uid?: string
          title?: string
          category?: 'drink' | 'exercise' | 'other'
          lat?: number
          lng?: number
          place_text?: string
          start_at?: string
          max_people?: number
          fee?: number
          visibility?: 'public' | 'private'
          boost_until?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      requests: {
        Row: {
          id: string
          room_id: string
          requester_uid: string
          message: string | null
          status: 'pending' | 'accepted' | 'rejected'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          requester_uid: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          requester_uid?: string
          message?: string | null
          status?: 'pending' | 'accepted' | 'rejected'
          created_at?: string
          updated_at?: string
        }
      }
      matches: {
        Row: {
          id: string
          room_id: string
          host_uid: string
          guest_uid: string
          created_at: string
        }
        Insert: {
          id?: string
          room_id: string
          host_uid: string
          guest_uid: string
          created_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          host_uid?: string
          guest_uid?: string
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          match_id: string
          sender_uid: string
          text: string
          created_at: string
        }
        Insert: {
          id?: string
          match_id: string
          sender_uid: string
          text: string
          created_at?: string
        }
        Update: {
          id?: string
          match_id?: string
          sender_uid?: string
          text?: string
          created_at?: string
        }
      }
      reports: {
        Row: {
          id: string
          reporter_uid: string
          target_uid: string
          room_id: string | null
          reason: string
          status: 'pending' | 'reviewed' | 'resolved'
          created_at: string
        }
        Insert: {
          id?: string
          reporter_uid: string
          target_uid: string
          room_id?: string | null
          reason: string
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
        Update: {
          id?: string
          reporter_uid?: string
          target_uid?: string
          room_id?: string | null
          reason?: string
          status?: 'pending' | 'reviewed' | 'resolved'
          created_at?: string
        }
      }
      host_messages: {
        Row: {
          id: string
          room_id: string
          sender_uid: string
          receiver_uid: string
          text: string
          is_read: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          room_id: string
          sender_uid: string
          receiver_uid: string
          text: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          room_id?: string
          sender_uid?: string
          receiver_uid?: string
          text?: string
          is_read?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      blocked_users: {
        Row: {
          blocker_uid: string
          blocked_uid: string
          created_at: string
        }
        Insert: {
          blocker_uid: string
          blocked_uid: string
          created_at?: string
        }
        Update: {
          blocker_uid?: string
          blocked_uid?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type:
            | 'room_request'
            | 'message'
            | 'room_full'
            | 'review'
            | 'boost_reminder'
            | 'match_success'
            | 'new_message'
            | 'request_accepted'
            | 'request_rejected'
            | 'room_updated'
            | 'system_announcement'
          title: string
          message: string
          metadata: Record<string, any> | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type:
            | 'room_request'
            | 'message'
            | 'room_full'
            | 'review'
            | 'boost_reminder'
            | 'match_success'
            | 'new_message'
            | 'request_accepted'
            | 'request_rejected'
            | 'room_updated'
            | 'system_announcement'
          title: string
          message: string
          metadata?: Record<string, any> | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?:
            | 'room_request'
            | 'message'
            | 'room_full'
            | 'review'
            | 'boost_reminder'
            | 'match_success'
            | 'new_message'
            | 'request_accepted'
            | 'request_rejected'
            | 'room_updated'
            | 'system_announcement'
          title?: string
          message?: string
          metadata?: Record<string, any> | null
          is_read?: boolean
          created_at?: string
        }
      }
      emergency_reports: {
        Row: {
          id: string
          reporter_id: string | null
          report_type: string
          description: string
          latitude: number | null
          longitude: number | null
          location_address: string | null
          room_id: string | null
          reported_user_id: string | null
          priority: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          reporter_id?: string | null
          report_type: string
          description: string
          latitude?: number | null
          longitude?: number | null
          location_address?: string | null
          room_id?: string | null
          reported_user_id?: string | null
          priority?: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          reporter_id?: string | null
          report_type?: string
          description?: string
          latitude?: number | null
          longitude?: number | null
          location_address?: string | null
          room_id?: string | null
          reported_user_id?: string | null
          priority?: string
          status?: string
          created_at?: string
        }
      }
      privacy_rights_requests: {
        Row: {
          id: string
          user_id: string
          request_type: string
          reason: string
          specific_data: string | null
          contact_email: string
          urgency: string
          legal_basis: string | null
          preferred_response_method: string
          additional_info: string | null
          status: string
          request_metadata: Record<string, any> | null
          admin_response: string | null
          processed_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          request_type: string
          reason: string
          specific_data?: string | null
          contact_email: string
          urgency?: string
          legal_basis?: string | null
          preferred_response_method?: string
          additional_info?: string | null
          status?: string
          request_metadata?: Record<string, any> | null
          admin_response?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          request_type?: string
          reason?: string
          specific_data?: string | null
          contact_email?: string
          urgency?: string
          legal_basis?: string | null
          preferred_response_method?: string
          additional_info?: string | null
          status?: string
          request_metadata?: Record<string, any> | null
          admin_response?: string | null
          processed_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      admin_notifications: {
        Row: {
          id: string
          type: string
          title: string
          message: string
          priority: string
          reference_id: string | null
          metadata: Record<string, any> | null
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          type: string
          title: string
          message: string
          priority?: string
          reference_id?: string | null
          metadata?: Record<string, any> | null
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          type?: string
          title?: string
          message?: string
          priority?: string
          reference_id?: string | null
          metadata?: Record<string, any> | null
          is_read?: boolean
          created_at?: string
        }
      }
      age_verification_logs: {
        Row: {
          id: string
          user_id: string
          verification_method: string
          age_range: string
          is_adult: boolean
          verification_ip: string | null
          user_agent: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verification_method: string
          age_range: string
          is_adult: boolean
          verification_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verification_method?: string
          age_range?: string
          is_adult?: boolean
          verification_ip?: string | null
          user_agent?: string | null
          created_at?: string
        }
      }
      user_verification_status: {
        Row: {
          id: string
          user_id: string
          verification_type: string
          verification_data: Record<string, any>
          status: string
          verified_at: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          verification_type: string
          verification_data: Record<string, any>
          status?: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          verification_type?: string
          verification_data?: Record<string, any>
          status?: string
          verified_at?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          reviewer_uid: string
          reviewed_uid: string
          room_id: string | null
          rating: number
          comment: string
          created_at: string
        }
        Insert: {
          id?: string
          reviewer_uid: string
          reviewed_uid: string
          room_id?: string | null
          rating: number
          comment: string
          created_at?: string
        }
        Update: {
          id?: string
          reviewer_uid?: string
          reviewed_uid?: string
          room_id?: string | null
          rating?: number
          comment?: string
          created_at?: string
        }
      }
    }
    Views: {
      admin_stats: {
        Row: {
          metric: string
          value: number
          description: string
        }
      }
      emergency_reports_dashboard: {
        Row: {
          id: string
          reporter_id: string | null
          report_type: string
          description: string
          priority: string
          status: string
          created_at: string
          [key: string]: unknown
        }
      }
      emergency_reports_stats: {
        Row: {
          total_reports: number
          pending_reports: number
          resolved_reports: number
          [key: string]: unknown
        }
      }
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}

export type SupabaseClient = ReturnType<typeof createClient<Database>>

// 싱글톤 브라우저 클라이언트
let _browserClient: SupabaseClient | null = null

export function createBrowserSupabaseClient(): SupabaseClient {
  // 싱글톤 패턴으로 중복 인스턴스 방지
  if (_browserClient) {
    return _browserClient
  }

  try {
    const { supabaseUrl: url, supabaseAnonKey: key } = validateEnvVars()

    _browserClient = createClient<Database>(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce',
        storage: typeof window !== 'undefined' ? window.localStorage : undefined,
        storageKey: 'meetpin-supabase-auth-token',
      },
      realtime: {
        params: {
          eventsPerSecond: 10, // 초당 이벤트 제한
        },
        heartbeatIntervalMs: 30000, // 30초 하트비트
        reconnectAfterMs: () => Math.floor(Math.random() * 3000) + 1000, // 1-4초 랜덤 재연결
        timeout: 20000, // 20초 타임아웃
      },
      global: {
        headers: {
          'X-Client-Info': 'meetpin-web',
        },
      },
    })

    // 연결 상태 모니터링 (개발 모드에서만)
    if (process.env.NODE_ENV === 'development' && typeof window !== 'undefined') {
      _browserClient.channel('_ping').subscribe(status => {
        if (status === 'CHANNEL_ERROR') {
          logger.warn('Supabase realtime connection error, attempting reconnect...')
        }
      })
    }

    return _browserClient
  } catch (error) {
    logger.error('Failed to create Supabase client:', { error: error instanceof Error ? error.message : String(error) })
    // 개발 환경에서는 Mock 클라이언트 반환
    if (process.env.NODE_ENV === 'development') {
      // Mock client for development fallback
      return ({
        from: () => ({
          select: () => ({ data: [], error: null }),
          insert: () => ({ data: [], error: null }),
          update: () => ({ data: [], error: null }),
          delete: () => ({ data: [], error: null }),
        }),
        auth: {
          getUser: () => Promise.resolve({ data: { user: null }, error: null }),
          signOut: () => Promise.resolve({ error: null }),
        },
        channel: () => ({
          on: () => ({}),
          subscribe: () => 'SUBSCRIBED',
          unsubscribe: () => ({}),
          track: () => ({}),
        }),
      } as any) as SupabaseClient
    }
    throw error
  }
}

// 서버용 클라이언트 (쿠키 기반 인증)
export async function createServerSupabaseClient() {
  const { supabaseUrl: url, supabaseAnonKey: key } = validateEnvVars()

  // Next.js 서버 환경에서 쿠키 접근
  const { cookies } = await import('next/headers')
  const cookieStore = await cookies()

  return createServerClient<Database>(url, key, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options))
        } catch {
          // 쿠키 설정 실패는 무시 (읽기 전용 모드)
        }
      },
    },
  })
}

// 서버 환경변수 검증 (관리자용)
function validateServerEnvVars() {
  const { supabaseUrl: url } = validateEnvVars()

  if (!supabaseServiceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin operations')
  }

  return { supabaseUrl: url, supabaseServiceRoleKey }
}

// 관리자용 클라이언트 (RLS 우회) - 지연 초기화
let _supabaseAdmin: ReturnType<typeof createClient<Database>> | null = null

export function getSupabaseAdmin() {
  if (!_supabaseAdmin) {
    // 관리자 키가 있는 경우에만 관리자 클라이언트 생성
    if (supabaseServiceRoleKey) {
      try {
        const { supabaseUrl: url, supabaseServiceRoleKey: key } = validateServerEnvVars()
        _supabaseAdmin = createClient<Database>(url, key, {
          auth: {
            autoRefreshToken: false,
            persistSession: false,
          },
        })
      } catch {
        logger.warn('Failed to create admin client, falling back to browser client')
        return createBrowserSupabaseClient()
      }
    } else {
      // 개발 환경에서는 일반 클라이언트 사용 (경고 없이)
      return createBrowserSupabaseClient()
    }
  }
  return _supabaseAdmin || createBrowserSupabaseClient()
}

// 하위 호환성을 위한 export
export const supabaseAdmin = getSupabaseAdmin()

// 테이블 타입들
export type Profile = Database['public']['Tables']['profiles']['Row']
export type ProfileInsert = Database['public']['Tables']['profiles']['Insert']
export type ProfileUpdate = Database['public']['Tables']['profiles']['Update']

export type Room = Database['public']['Tables']['rooms']['Row']
export type RoomInsert = Database['public']['Tables']['rooms']['Insert']
export type RoomUpdate = Database['public']['Tables']['rooms']['Update']

export type Request = Database['public']['Tables']['requests']['Row']
export type RequestInsert = Database['public']['Tables']['requests']['Insert']
export type RequestUpdate = Database['public']['Tables']['requests']['Update']

export type Match = Database['public']['Tables']['matches']['Row']
export type MatchInsert = Database['public']['Tables']['matches']['Insert']
export type MatchUpdate = Database['public']['Tables']['matches']['Update']

export type Message = Database['public']['Tables']['messages']['Row']
export type MessageInsert = Database['public']['Tables']['messages']['Insert']
export type MessageUpdate = Database['public']['Tables']['messages']['Update']

export type Report = Database['public']['Tables']['reports']['Row']
export type ReportInsert = Database['public']['Tables']['reports']['Insert']
export type ReportUpdate = Database['public']['Tables']['reports']['Update']

export type HostMessage = Database['public']['Tables']['host_messages']['Row']
export type HostMessageInsert = Database['public']['Tables']['host_messages']['Insert']
export type HostMessageUpdate = Database['public']['Tables']['host_messages']['Update']

export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']
export type BlockedUserInsert = Database['public']['Tables']['blocked_users']['Insert']
export type BlockedUserUpdate = Database['public']['Tables']['blocked_users']['Update']

export type AdminStats = Database['public']['Views']['admin_stats']['Row']

