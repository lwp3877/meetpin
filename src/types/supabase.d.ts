/**
 * Supabase Query Response Types
 * 정확한 타입 정의로 any 제거
 */

import type { PostgrestError } from '@supabase/supabase-js'

// Supabase single() response type
export interface SupabaseSingleResponse<T> {
  data: T | null
  error: PostgrestError | null
}

// Supabase array response type
export interface SupabaseArrayResponse<T> {
  data: T[] | null
  error: PostgrestError | null
}

// Supabase update/insert response
export interface SupabaseModifyResponse<T> {
  data: T | null
  error: PostgrestError | null
  count?: number | null
  status: number
  statusText: string
}
