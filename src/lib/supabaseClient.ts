/* src/lib/supabaseClient.ts */
import { createClient } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

// 데이터베이스 타입 정의
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          uid: string
          nickname: string | null
          age_range: 'early_twenties' | 'late_twenties' | 'early_thirties' | 'late_thirties' | 'forties' | 'fifties_plus' | null
          avatar_url: string | null
          intro: string | null
          role: 'user' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          uid: string
          nickname?: string | null
          age_range?: 'early_twenties' | 'late_twenties' | 'early_thirties' | 'late_thirties' | 'forties' | 'fifties_plus' | null
          avatar_url?: string | null
          intro?: string | null
          role?: 'user' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          uid?: string
          nickname?: string | null
          age_range?: 'early_twenties' | 'late_twenties' | 'early_thirties' | 'late_thirties' | 'forties' | 'fifties_plus' | null
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
          status: 'active' | 'inactive' | 'completed'
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
          status?: 'active' | 'inactive' | 'completed'
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
          status?: 'active' | 'inactive' | 'completed'
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
    }
    Views: {
      admin_stats: {
        Row: {
          metric: string
          value: number
          description: string
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

// 브라우저용 클라이언트
export function createBrowserSupabaseClient(): SupabaseClient {
  return createClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })
}

// 서버용 클라이언트 (쿠키 기반 세션)
export async function createServerSupabaseClient(): Promise<SupabaseClient> {
  const cookieStore = await cookies()
  
  return createServerClient<Database>(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll() {
        return cookieStore.getAll()
      },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        } catch {
          // SSR 중에는 쿠키 설정 불가
        }
      },
    },
  })
}

// 관리자용 클라이언트 (RLS 우회)
export const supabaseAdmin = createClient<Database>(
  supabaseUrl,
  supabaseServiceRoleKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

// 클라이언트별 타입 export
export type SupabaseServerClient = Awaited<ReturnType<typeof createServerSupabaseClient>>

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

export type BlockedUser = Database['public']['Tables']['blocked_users']['Row']
export type BlockedUserInsert = Database['public']['Tables']['blocked_users']['Insert']
export type BlockedUserUpdate = Database['public']['Tables']['blocked_users']['Update']

export type AdminStats = Database['public']['Views']['admin_stats']['Row']

// JOIN 결과를 위한 확장 타입들
export type RoomWithProfile = Room & {
  profiles: Pick<Profile, 'nickname' | 'avatar_url' | 'age_range'> | null
}

export type RequestWithDetails = Request & {
  rooms: Pick<Room, 'title' | 'category' | 'start_at'> | null
  profiles: Pick<Profile, 'nickname' | 'avatar_url'> | null
}

export type MatchWithDetails = Match & {
  rooms: Pick<Room, 'title' | 'category'> | null
  host_profile: Pick<Profile, 'nickname' | 'avatar_url'> | null
  guest_profile: Pick<Profile, 'nickname' | 'avatar_url'> | null
}

export type MessageWithProfile = Message & {
  profiles: Pick<Profile, 'nickname' | 'avatar_url'> | null
}

export type ReportWithDetails = Report & {
  reporter_profile: Pick<Profile, 'nickname'> | null
  target_profile: Pick<Profile, 'nickname'> | null
  rooms: Pick<Room, 'title'> | null
}

// 유틸리티 함수들
export function isSupabaseError(error: any): error is { code: string; message: string } {
  return error && typeof error.code === 'string' && typeof error.message === 'string'
}

export function handleSupabaseError(error: any): never {
  if (isSupabaseError(error)) {
    throw new Error(`Supabase Error [${error.code}]: ${error.message}`)
  }
  throw error
}

export default {
  createBrowserClient: createBrowserSupabaseClient,
  createServerClient: createServerSupabaseClient,
  admin: supabaseAdmin,
  types: {} as Database,
  utils: {
    isSupabaseError,
    handleSupabaseError,
  },
}