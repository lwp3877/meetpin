/* src/lib/utils/zodSchemas.ts */
import { z } from 'zod'

const CATEGORY_OPTIONS = ['drink', 'exercise', 'other'] as const
const AGE_RANGE_OPTIONS = ['20s_early', '20s_late', '30s_early', '30s_late', '40s', '50s+'] as const
const BOOST_OPTIONS = ['1', '3', '7'] as const

const uuidSchema = z.string().uuid('유효한 UUID 형식이 아닙니다.')

const coordinateSchema = z.object({
  lat: z.number().min(-90, '위도는 -90 이상이어야 합니다.').max(90, '위도는 90 이하여야 합니다.'),
  lng: z
    .number()
    .min(-180, '경도는 -180 이상이어야 합니다.')
    .max(180, '경도는 180 이하여야 합니다.'),
})

/**
 * 사용자 프로필 기본 정보.
 */
export const profileSchema = z.object({
  nickname: z
    .string()
    .min(2, '닉네임은 2자 이상이어야 합니다.')
    .max(20, '닉네임은 20자 이하여야 합니다.')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 밑줄만 사용할 수 있습니다.')
    .trim(),
  age_range: z.enum(AGE_RANGE_OPTIONS, { message: '연령대를 선택해주세요.' }),
  intro: z.string().max(500, '소개는 500자 이하여야 합니다.').optional(),
  avatar_url: z.string().url('유효한 URL 형식이 아닙니다.').optional().nullable(),
})

/**
 * 모임 생성/수정 입력값.
 */
export const createRoomSchema = z.object({
  title: z.string().min(1, '제목을 입력해주세요.').max(100, '제목은 100자 이하여야 합니다.').trim(),
  category: z.enum(CATEGORY_OPTIONS, { message: '카테고리를 선택해주세요.' }),
  lat: coordinateSchema.shape.lat,
  lng: coordinateSchema.shape.lng,
  place_text: z.string().min(1, '장소를 입력해주세요.').max(200, '장소는 200자 이하여야 합니다.').trim(),
  start_at: z
    .string()
    .datetime('유효한 날짜 형식이 아닙니다.')
    .refine(date => new Date(date) > new Date(), '시작 시간은 현재 시간 이후여야 합니다.')
    .refine(
      date => new Date(date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      '시작 시간은 7일 이내여야 합니다.'
    ),
  max_people: z
    .number()
    .int('인원수는 정수여야 합니다.')
    .min(2, '최소 2명 이상이어야 합니다.')
    .max(20, '최대 20명까지 가능합니다.'),
  fee: z
    .number()
    .int('참가비는 정수여야 합니다.')
    .min(0, '참가비는 0 이상이어야 합니다.')
    .max(1_000_000, '참가비는 100만원 이하여야 합니다.'),
  visibility: z.enum(['public', 'private']).default('public'),
  description: z.string().max(1000, '설명은 1000자 이하여야 합니다.').optional(),
})

export const roomUpdateSchema = createRoomSchema.partial()

/**
 * 모임 참가 요청.
 */
export const createRequestSchema = z.object({
  room_id: uuidSchema,
  message: z.string().max(500, '메시지는 500자 이하여야 합니다.').optional().nullable(),
})

/**
 * 1:1 메시지.
 */
export const createMessageSchema = z
  .object({
    text: z.string().min(1, '메시지를 입력해주세요.').max(1000, '메시지는 1000자 이하여야 합니다.').trim(),
  })
  .strict()

/**
 * 호스트에게 보내는 메시지.
 */
export const createHostMessageSchema = z.object({
  roomId: uuidSchema,
  message: createMessageSchema.shape.text,
})

/**
 * 사용자 신고.
 */
export const createReportSchema = z.object({
  target_uid: uuidSchema,
  room_id: uuidSchema.optional().nullable(),
  reason: z.string().min(1, '신고 사유를 입력해주세요.').max(500, '신고 사유는 500자 이하여야 합니다.').trim(),
})

/**
 * Stripe 부스트 결제.
 */
export const boostSchema = z.object({
  days: z.enum(BOOST_OPTIONS, { message: '부스트 기간을 선택해주세요.' }),
  room_id: uuidSchema,
})
