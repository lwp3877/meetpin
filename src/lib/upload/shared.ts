/* src/lib/upload/shared.ts */
// 🔄 업로드 관련 공용 타입 및 유틸리티 (isomorphic)

import { z } from 'zod'

// Presigned URL 요청 스키마
export const PresignedRequestSchema = z.object({
  fileName: z.string().min(1).max(255),
  fileSize: z.number().min(1).max(20 * 1024 * 1024), // 20MB 최대
  fileType: z.string().min(1),
  uploadType: z.enum(['avatar', 'roomImage', 'reportFile']),
  roomId: z.string().uuid().optional(), // 방 이미지일 경우 필요
  reportId: z.string().uuid().optional() // 신고 파일일 경우 필요
})

export type PresignedRequest = z.infer<typeof PresignedRequestSchema>

// MIME 타입 화이트리스트
export const ALLOWED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png', 
  'image/webp',
  'image/avif'
] as const

export const ALLOWED_DOCUMENT_TYPES = [
  'application/pdf',
  'text/plain'
] as const

// 파일 크기 제한 (바이트)
export const FILE_SIZE_LIMITS = {
  avatar: 5 * 1024 * 1024,      // 5MB
  roomImage: 10 * 1024 * 1024,  // 10MB
  reportFile: 20 * 1024 * 1024  // 20MB
} as const

// 기본적인 파일 확장자 검증 (클라이언트에서도 사용 가능)
export function getFileExtension(fileName: string): string {
  return fileName.toLowerCase().split('.').pop() || ''
}

// 파일 타입별 허용 확장자
export const ALLOWED_EXTENSIONS = {
  avatar: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  roomImage: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  reportFile: ['jpg', 'jpeg', 'png', 'webp', 'avif', 'pdf', 'txt']
} as const

// 클라이언트 측에서도 사용할 수 있는 기본 검증
export function validateFileBasics(file: { name: string; size: number; type: string }, uploadType: keyof typeof FILE_SIZE_LIMITS): { isValid: boolean; error?: string } {
  // 크기 검증
  if (file.size > FILE_SIZE_LIMITS[uploadType]) {
    return { isValid: false, error: `File size exceeds ${FILE_SIZE_LIMITS[uploadType] / (1024 * 1024)}MB limit` }
  }

  // 확장자 검증
  const extension = getFileExtension(file.name)
  const allowedExts = ALLOWED_EXTENSIONS[uploadType]
  if (!allowedExts.includes(extension as any)) {
    return { isValid: false, error: `File type not allowed. Allowed: ${allowedExts.join(', ')}` }
  }

  return { isValid: true }
}