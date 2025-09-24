/// <reference types="node" />
/* src/lib/upload/server.ts */
// 🛡️ 서버 전용 업로드 검증 및 보안 (Node.js only)

import 'server-only'
import { validateFileUpload, sanitizeString } from '@/lib/security/serverValidation'
import { PresignedRequest, FILE_SIZE_LIMITS } from './shared'

// 서버에서만 사용하는 고급 파일 검증
export async function validateFileUploadServer(file: { name: string; size: number; type: string }, uploadType: keyof typeof FILE_SIZE_LIMITS) {
  return await validateFileUpload(file as File, uploadType)
}

// 서버에서만 사용하는 파일명 정리
export function sanitizeFileNameServer(fileName: string): string {
  return sanitizeString(fileName, { maxLength: 100 })
}

// 업로드 세션 타입
export interface UploadSession {
  user_id: string
  file_path: string
  bucket_name: string
  upload_type: string
  file_size: number
  file_type: string
  expires_at: string
  created_at: string
}

// 전역 업로드 세션 관리 (임시 - Redis 권장)
declare global {
  var uploadSessions: Map<string, UploadSession> | undefined
}

export function getUploadSessions(): Map<string, UploadSession> {
  if (!global.uploadSessions) {
    global.uploadSessions = new Map()
  }
  return global.uploadSessions
}

export function createUploadSession(path: string, session: UploadSession): void {
  const sessions = getUploadSessions()
  sessions.set(path, session)
}

export function getUploadSession(path: string): UploadSession | undefined {
  const sessions = getUploadSessions()
  return sessions.get(path)
}

export function deleteUploadSession(path: string): void {
  const sessions = getUploadSessions()
  sessions.delete(path)
}