/**
 * 연령 인증 시스템
 * 개인정보보호법 및 청소년보호법 준수
 */

import { createServerSupabaseClient } from '@/lib/supabaseClient'

export interface AgeVerificationResult {
  isAdult: boolean
  verified: boolean
  method: 'self_declaration' | 'id_verification' | 'phone_verification'
  message: string
}

export interface AgeVerificationData {
  ageRange: string
  birthYear?: number
  verificationMethod: 'self_declaration' | 'id_verification' | 'phone_verification'
  phoneNumber?: string
  idCardHash?: string // 암호화된 신분증 정보
}

/**
 * 연령대에서 성인 여부 확인
 */
export function isAdultByAgeRange(ageRange: string): boolean {
  const adultAgeRanges = ['20s_early', '20s_late', '30s_early', '30s_late', '40s', '50s+']
  return adultAgeRanges.includes(ageRange)
}

/**
 * 출생연도로 성인 여부 확인
 */
export function isAdultByBirthYear(birthYear: number): boolean {
  const currentYear = new Date().getFullYear()
  const age = currentYear - birthYear
  return age >= 19
}

/**
 * 연령 인증 처리
 */
export async function verifyAge(
  userId: string,
  verificationData: AgeVerificationData,
  userAgent?: string,
  ipAddress?: string
): Promise<AgeVerificationResult> {
  try {
    const supabase = await createServerSupabaseClient()

    // 1. 연령대 기반 기본 확인
    const isAdultByRange = isAdultByAgeRange(verificationData.ageRange)

    // 2. 출생연도가 있는 경우 추가 확인
    let isAdultByBirth = true
    if (verificationData.birthYear) {
      isAdultByBirth = isAdultByBirthYear(verificationData.birthYear)
    }

    const isAdult = isAdultByRange && isAdultByBirth

    if (!isAdult) {
      return {
        isAdult: false,
        verified: false,
        method: verificationData.verificationMethod,
        message: '죄송합니다. 밋핀은 만 19세 이상만 이용할 수 있는 서비스입니다.',
      }
    }

    // 3. 연령 인증 로그 기록
    const { error: logError } = await (supabase as any).from('age_verification_logs').insert({
      user_id: userId,
      verification_method: verificationData.verificationMethod,
      age_range: verificationData.ageRange,
      is_adult: isAdult,
      verification_ip: ipAddress,
      user_agent: userAgent,
    })

    if (logError) {
      console.error('Age verification log error:', logError)
    }

    // 4. 사용자 인증 테이블에 기록
    const { error: verificationError } = await (supabase as any)
      .from('user_verification_status')
      .upsert({
        user_id: userId,
        verification_type: 'age_adult',
        verification_data: {
          age_range: verificationData.ageRange,
          method: verificationData.verificationMethod,
          verified_at: new Date().toISOString(),
        },
        status: 'verified',
        verified_at: new Date().toISOString(),
      })

    if (verificationError) {
      console.error('User verification error:', verificationError)
      return {
        isAdult: true,
        verified: false,
        method: verificationData.verificationMethod,
        message: '인증 처리 중 오류가 발생했습니다. 다시 시도해주세요.',
      }
    }

    // 5. 성공
    return {
      isAdult: true,
      verified: true,
      method: verificationData.verificationMethod,
      message: '연령 인증이 완료되었습니다.',
    }
  } catch (error) {
    console.error('Age verification error:', error)
    return {
      isAdult: false,
      verified: false,
      method: verificationData.verificationMethod,
      message: '인증 처리 중 오류가 발생했습니다.',
    }
  }
}

/**
 * 사용자 연령 인증 상태 확인
 */
export async function getUserAgeVerificationStatus(userId: string): Promise<{
  isVerified: boolean
  isAdult: boolean
  verificationMethod?: string
  verifiedAt?: string
}> {
  try {
    const supabase = await createServerSupabaseClient()

    const { data, error } = await supabase
      .from('user_verifications')
      .select('status, verification_data, verified_at')
      .eq('user_id', userId)
      .eq('verification_type', 'age_adult')
      .eq('status', 'verified')
      .single()

    if (error || !data) {
      return {
        isVerified: false,
        isAdult: false,
      }
    }

    return {
      isVerified: true,
      isAdult: true,
      verificationMethod: (data as any).verification_data?.method,
      verifiedAt: (data as any).verified_at,
    }
  } catch (error) {
    console.error('Get age verification status error:', error)
    return {
      isVerified: false,
      isAdult: false,
    }
  }
}

/**
 * 미성년자 접근 차단 미들웨어용 함수
 */
export async function requireAdultUser(userId: string): Promise<boolean> {
  const status = await getUserAgeVerificationStatus(userId)
  return status.isVerified && status.isAdult
}

/**
 * 연령 인증이 필요한 기능 목록
 */
export const ADULT_ONLY_FEATURES = [
  'create_room',
  'join_room',
  'send_chat_message',
  'upload_profile_image',
  'boost_room',
] as const

export type AdultOnlyFeature = (typeof ADULT_ONLY_FEATURES)[number]

/**
 * 특정 기능 사용 전 연령 확인
 */
export async function checkFeatureAccess(
  userId: string,
  feature: AdultOnlyFeature
): Promise<boolean> {
  if (!ADULT_ONLY_FEATURES.includes(feature)) {
    return true // 제한되지 않은 기능
  }

  return await requireAdultUser(userId)
}

/**
 * 연령 인증 관련 상수
 */
export const AGE_VERIFICATION_CONFIG = {
  MIN_AGE: 19,
  VERIFICATION_EXPIRY_DAYS: 365, // 1년마다 재인증
  ALLOWED_VERIFICATION_METHODS: [
    'self_declaration',
    'id_verification',
    'phone_verification',
  ] as const,
}

/**
 * 개인정보보호법 준수 메시지
 */
export const PRIVACY_COMPLIANCE_MESSAGES = {
  AGE_COLLECTION_PURPOSE:
    '연령대 정보는 안전한 모임 환경 조성 및 법적 요구사항 준수를 위해 수집됩니다.',
  AGE_RETENTION_PERIOD: '연령 인증 정보는 회원탈퇴 시까지 보관되며, 탈퇴 즉시 안전하게 삭제됩니다.',
  AGE_THIRD_PARTY:
    '연령 정보는 제3자에게 제공되지 않으며, 법적 요구가 있는 경우에만 관련 기관에 제공될 수 있습니다.',
  VERIFICATION_RIGHTS: '연령 인증을 거부할 권리가 있으나, 이 경우 서비스 이용이 제한됩니다.',
}

const defaultExport = {
  verifyAge,
  getUserAgeVerificationStatus,
  requireAdultUser,
  checkFeatureAccess,
  isAdultByAgeRange,
  isAdultByBirthYear,
  AGE_VERIFICATION_CONFIG,
  PRIVACY_COMPLIANCE_MESSAGES,
  ADULT_ONLY_FEATURES,
}
export default defaultExport
