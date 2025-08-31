/* src/lib/zodSchemas.ts */
import { z } from 'zod'

// 카테고리 스키마 (drink|exercise|other로 통일)
export const categorySchema = z.enum(['drink', 'exercise', 'other'], {
  message: '올바른 카테고리를 선택해주세요',
})

// 연령대 스키마
export const ageRangeSchema = z.enum([
  '20s_early', '20s_late', '30s_early', '30s_late', '40s', '50s+'
], {
  message: '올바른 연령대를 선택해주세요',
})

// 공통 ID 스키마
export const uuidSchema = z.string().uuid('올바른 UUID 형식이 아닙니다')

// 좌표 스키마
export const coordinateSchema = z.object({
  lat: z.number()
    .min(-90, '위도는 -90도 이상이어야 합니다')
    .max(90, '위도는 90도 이하여야 합니다'),
  lng: z.number()
    .min(-180, '경도는 -180도 이상이어야 합니다')
    .max(180, '경도는 180도 이하여야 합니다'),
})

// BBox 스키마
export const bboxSchema = z.object({
  south: z.number().min(-90).max(90),
  west: z.number().min(-180).max(180),
  north: z.number().min(-90).max(90),
  east: z.number().min(-180).max(180),
}).refine(
  (data) => data.south < data.north,
  { message: '남쪽 위도는 북쪽 위도보다 작아야 합니다', path: ['south'] }
).refine(
  (data) => data.west < data.east,
  { message: '서쪽 경도는 동쪽 경도보다 작아야 합니다', path: ['west'] }
)

// 프로필 스키마
export const profileSchema = z.object({
  nickname: z.string()
    .min(2, '닉네임은 2글자 이상이어야 합니다')
    .max(20, '닉네임은 20글자 이하여야 합니다')
    .regex(/^[가-힣a-zA-Z0-9_]+$/, '닉네임은 한글, 영문, 숫자, 언더스코어만 사용 가능합니다'),
  age_range: ageRangeSchema,
  intro: z.string()
    .max(500, '소개는 500자 이하여야 합니다')
    .optional(),
  avatar_url: z.string()
    .url('올바른 URL 형식이 아닙니다')
    .optional()
    .nullable(),
})

// 방 생성 스키마
export const createRoomSchema = z.object({
  title: z.string()
    .min(1, '제목을 입력해주세요')
    .max(100, '제목은 100자 이하여야 합니다')
    .trim(),
  category: categorySchema,
  lat: z.number()
    .min(-90, '올바른 위도를 입력해주세요')
    .max(90, '올바른 위도를 입력해주세요'),
  lng: z.number()
    .min(-180, '올바른 경도를 입력해주세요')
    .max(180, '올바른 경도를 입력해주세요'),
  place_text: z.string()
    .min(1, '장소를 입력해주세요')
    .max(200, '장소는 200자 이하여야 합니다')
    .trim(),
  start_at: z.string()
    .datetime('올바른 날짜 형식이 아닙니다')
    .refine(
      (date) => new Date(date) > new Date(),
      '시작 시간은 현재 시간보다 이후여야 합니다'
    )
    .refine(
      (date) => new Date(date) < new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      '시작 시간은 7일 이내여야 합니다'
    ),
  max_people: z.number()
    .int('정수를 입력해주세요')
    .min(2, '최소 2명 이상이어야 합니다')
    .max(20, '최대 20명까지 가능합니다'),
  fee: z.number()
    .int('정수를 입력해주세요')
    .min(0, '참가비는 0원 이상이어야 합니다')
    .max(1000000, '참가비는 100만원 이하여야 합니다'),
  visibility: z.enum(['public', 'private']).default('public'),
  description: z.string().max(1000, '설명은 1000자 이하여야 합니다').optional(),
})

// 방 업데이트 스키마 (부분 업데이트 허용)
export const updateRoomSchema = createRoomSchema.partial()

// 요청 생성 스키마
export const createRequestSchema = z.object({
  room_id: uuidSchema,
  message: z.string()
    .max(500, '메시지는 500자 이하여야 합니다')
    .optional()
    .nullable(),
})

// 요청 상태 업데이트 스키마
export const updateRequestSchema = z.object({
  status: z.enum(['pending', 'accepted', 'rejected'], {
    message: '상태를 선택해주세요',
  }),
})

// 메시지 생성 스키마
export const createMessageSchema = z.object({
  text: z.string()
    .min(1, '메시지를 입력해주세요')
    .max(1000, '메시지는 1000자 이하여야 합니다')
    .trim(),
})

// 신고 생성 스키마
export const createReportSchema = z.object({
  target_uid: uuidSchema,
  room_id: uuidSchema.optional().nullable(),
  reason: z.string()
    .min(1, '신고 사유를 입력해주세요')
    .max(500, '신고 사유는 500자 이하여야 합니다')
    .trim(),
})

// 신고 상태 업데이트 스키마 (관리자용)
export const updateReportSchema = z.object({
  status: z.enum(['pending', 'reviewed', 'resolved'], {
    message: '상태를 선택해주세요',
  }),
})

// 차단 스키마
export const blockUserSchema = z.object({
  target_uid: uuidSchema,
  action: z.enum(['block', 'unblock'], {
    message: '작업을 선택해주세요',
  }),
})

// 페이지네이션 스키마
export const paginationSchema = z.object({
  page: z.number()
    .int('정수를 입력해주세요')
    .min(1, '페이지는 1 이상이어야 합니다')
    .default(1),
  limit: z.number()
    .int('정수를 입력해주세요')
    .min(1, '한 페이지당 최소 1개 이상이어야 합니다')
    .max(100, '한 페이지당 최대 100개까지 가능합니다')
    .default(20),
})

// Stripe Checkout 스키마
export const stripeCheckoutSchema = z.object({
  days: z.enum(['1', '3', '7'], {
    message: '부스트 기간을 선택해주세요',
  }),
  room_id: uuidSchema,
})

// 파일 업로드 스키마
export const fileUploadSchema = z.object({
  file: z.any()
    .refine((file) => file instanceof File, '파일을 선택해주세요')
    .refine(
      (file) => file.size <= 5 * 1024 * 1024,
      '파일 크기는 5MB 이하여야 합니다'
    )
    .refine(
      (file) => ['image/jpeg', 'image/png', 'image/webp'].includes(file.type),
      '이미지 파일만 업로드 가능합니다 (jpg, png, webp)'
    ),
})

// 동의 스키마 (온보딩용)
export const consentSchema = z.object({
  terms: z.boolean().refine(val => val === true, '이용약관에 동의해주세요'),
  privacy: z.boolean().refine(val => val === true, '개인정보처리방침에 동의해주세요'),
  location: z.boolean().refine(val => val === true, '위치정보이용약관에 동의해주세요'),
  age_verification: z.boolean().refine(val => val === true, '만 19세 이상임을 확인해주세요'),
})

// 검색 필터 스키마
export const searchFilterSchema = z.object({
  category: categorySchema.optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
  max_fee: z.number().int().min(0).optional(),
  min_people: z.number().int().min(2).max(20).optional(),
  max_people: z.number().int().min(2).max(20).optional(),
}).refine(
  (data) => !data.start_date || !data.end_date || new Date(data.start_date) <= new Date(data.end_date),
  { message: '시작 날짜는 종료 날짜보다 이전이어야 합니다', path: ['start_date'] }
).refine(
  (data) => !data.min_people || !data.max_people || data.min_people <= data.max_people,
  { message: '최소 인원은 최대 인원보다 적어야 합니다', path: ['min_people'] }
)

// 요청 행동 스키마 (accept/reject)
export const requestActionSchema = z.object({
  action: z.enum(['accept', 'reject'], {
    message: '행동을 선택해주세요',
  }),
})

// 부스트 체크아웃 스키마
export const boostCheckoutSchema = z.object({
  room_id: uuidSchema,
  plan: z.enum(['1d', '3d', '7d'], {
    message: '부스트 플랜을 선택해주세요',
  }),
})

// 방 수정 스키마 (부분 업데이트용)
export const roomUpdateSchema = createRoomSchema.partial()

// 타입 추출
export type Category = z.infer<typeof categorySchema>
export type AgeRange = z.infer<typeof ageRangeSchema>
export type Coordinate = z.infer<typeof coordinateSchema>
export type BoundingBox = z.infer<typeof bboxSchema>
export type Profile = z.infer<typeof profileSchema>
export type CreateRoom = z.infer<typeof createRoomSchema>
export type UpdateRoom = z.infer<typeof updateRoomSchema>
export type RoomUpdate = z.infer<typeof roomUpdateSchema>
export type CreateRequest = z.infer<typeof createRequestSchema>
export type UpdateRequest = z.infer<typeof updateRequestSchema>
export type RequestAction = z.infer<typeof requestActionSchema>
export type CreateMessage = z.infer<typeof createMessageSchema>
export type CreateReport = z.infer<typeof createReportSchema>
export type UpdateReport = z.infer<typeof updateReportSchema>
export type BlockUser = z.infer<typeof blockUserSchema>
export type Pagination = z.infer<typeof paginationSchema>
export type StripeCheckout = z.infer<typeof stripeCheckoutSchema>
export type BoostCheckout = z.infer<typeof boostCheckoutSchema>
export type FileUpload = z.infer<typeof fileUploadSchema>
export type Consent = z.infer<typeof consentSchema>
export type SearchFilter = z.infer<typeof searchFilterSchema>

// 금칙어 필터링 (한국어) - export하여 서버에서 사용 가능
export const FORBIDDEN_WORDS = [
  // 욕설 및 비속어
  '시발', '씨발', '개새끼', '병신', '새끼', '좆', '씹',
  // 성적 내용
  '섹스', '야동', '포르노', '자위',
  // 차별적 표현
  '장애인', '정신병',
  // 기타 부적절한 표현
  '죽어', '자살', '테러',
] as const

export function containsForbiddenWords(text: string): boolean {
  const lowerText = text.toLowerCase()
  return FORBIDDEN_WORDS.some(word => lowerText.includes(word))
}

export function filterForbiddenWords(text: string): string {
  let filtered = text
  FORBIDDEN_WORDS.forEach(word => {
    const regex = new RegExp(word, 'gi')
    filtered = filtered.replace(regex, '*'.repeat(word.length))
  })
  return filtered
}

// 텍스트 정화 스키마
export const sanitizedTextSchema = z.string()
  .transform((text) => text.trim())
  .refine((text) => !containsForbiddenWords(text), '부적절한 단어가 포함되어 있습니다')

// Schema aliases for backward compatibility
export const requestSchema = createRequestSchema
export const boostSchema = stripeCheckoutSchema

const schemas = {
  // 기본 스키마
  category: categorySchema,
  ageRange: ageRangeSchema,
  uuid: uuidSchema,
  coordinate: coordinateSchema,
  bbox: bboxSchema,
  
  // 엔티티 스키마
  profile: profileSchema,
  createRoom: createRoomSchema,
  updateRoom: updateRoomSchema,
  roomUpdate: roomUpdateSchema,
  createRequest: createRequestSchema,
  updateRequest: updateRequestSchema,
  requestAction: requestActionSchema,
  createMessage: createMessageSchema,
  createReport: createReportSchema,
  updateReport: updateReportSchema,
  blockUser: blockUserSchema,
  
  // 유틸리티 스키마
  pagination: paginationSchema,
  stripeCheckout: stripeCheckoutSchema,
  boostCheckout: boostCheckoutSchema,
  fileUpload: fileUploadSchema,
  consent: consentSchema,
  searchFilter: searchFilterSchema,
  sanitizedText: sanitizedTextSchema,
  
  // 텍스트 필터링
  containsForbiddenWords,
  filterForbiddenWords,
}

export default schemas