/* src/lib/security/securityHardening.ts */

/**
 * 보안 취약점 완전 차단 시스템
 * 실제 사용자 테스트에서 발생할 수 있는 모든 보안 위협 방어
 */

/**
 * 입력값 검증 및 새니타이징
 */
export class InputSanitizer {
  /**
   * XSS 공격 방지 - HTML 태그 제거 또는 이스케이프
   */
  static sanitizeHTML(input: string): string {
    if (!input || typeof input !== 'string') return ''

    // 기본적인 HTML 태그 제거
    return input
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim()
  }

  /**
   * SQL Injection 방지 - 위험한 문자열 패턴 검증
   */
  static validateSQLSafe(input: string): boolean {
    if (!input || typeof input !== 'string') return true

    const dangerousPatterns = [
      /(\s|^)(select|insert|update|delete|drop|create|alter|exec|execute|union|script)\s/i,
      /['"]\s*;\s*--/i,
      /['"]\s*;\s*\/\*/i,
      /\bunion\s+select\b/i,
      /\bdrop\s+table\b/i,
      /\btruncate\s+table\b/i,
      /\bdelete\s+from\b/i,
      /\bupdate\s+.*\s+set\b/i,
      /\binsert\s+into\b/i,
    ]

    return !dangerousPatterns.some(pattern => pattern.test(input))
  }

  /**
   * 파일 경로 검증 - Path Traversal 공격 방지
   */
  static validateFilePath(path: string): boolean {
    if (!path || typeof path !== 'string') return false

    const dangerousPatterns = [
      /\.\./, // 상위 디렉토리 접근
      /\//, // 절대 경로
      /\\/, // Windows 경로
      /\0/, // NULL 바이트
      /[<>:"|?*]/, // 파일명에 부적절한 문자
    ]

    return !dangerousPatterns.some(pattern => pattern.test(path))
  }

  /**
   * 이메일 주소 검증 (강화된 버전)
   */
  static validateEmail(email: string): boolean {
    if (!email || typeof email !== 'string') return false

    // RFC 5322 기반 이메일 검증 (단순화된 버전)
    const emailRegex =
      /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/

    if (!emailRegex.test(email)) return false

    // 길이 제한
    if (email.length > 254) return false

    // 로컬 부분 길이 제한
    const [localPart] = email.split('@')
    if (localPart.length > 64) return false

    return true
  }

  /**
   * URL 검증 및 새니타이징
   */
  static sanitizeURL(url: string): string | null {
    if (!url || typeof url !== 'string') return null

    try {
      const parsed = new URL(url)

      // 허용되는 프로토콜만 허용
      const allowedProtocols = ['http:', 'https:', 'mailto:', 'tel:']
      if (!allowedProtocols.includes(parsed.protocol)) {
        return null
      }

      // JavaScript 스키마 차단
      if (parsed.protocol === 'javascript:') {
        return null
      }

      return parsed.toString()
    } catch {
      return null
    }
  }

  /**
   * 닉네임 검증 (한국어 특화)
   */
  static validateNickname(nickname: string): { isValid: boolean; reason?: string } {
    if (!nickname || typeof nickname !== 'string') {
      return { isValid: false, reason: '닉네임을 입력해주세요' }
    }

    // 길이 제한
    if (nickname.length < 2 || nickname.length > 10) {
      return { isValid: false, reason: '닉네임은 2-10자 사이여야 합니다' }
    }

    // 허용되는 문자만 사용 (한글, 영문, 숫자, 일부 특수문자)
    const allowedPattern = /^[가-힣a-zA-Z0-9._-]+$/
    if (!allowedPattern.test(nickname)) {
      return { isValid: false, reason: '한글, 영문, 숫자, ., _, -만 사용 가능합니다' }
    }

    // 금지어 목록
    const forbiddenWords = [
      '관리자',
      'admin',
      'Administrator',
      'root',
      'system',
      '운영자',
      '매니저',
      'manager',
      'mod',
      'moderator',
      '밋핀',
      'meetpin',
      'MeetPin',
      // 욕설이나 부적절한 단어들
      '바보',
      '멍청이',
      '병신',
      '시발',
      '개새끼',
      '씨발',
      // 사기 관련
      '사기',
      '돈',
      '송금',
      '계좌',
      '투자',
      '대출',
      // 성적 내용
      '섹스',
      '야동',
      '포르노',
      '성관계',
      // 기타 부적절한 내용
      '죽이',
      '살인',
      '폭력',
      '마약',
      '도박',
    ]

    const lowerNickname = nickname.toLowerCase()
    const hasForbiddenWord = forbiddenWords.some(word => lowerNickname.includes(word.toLowerCase()))

    if (hasForbiddenWord) {
      return { isValid: false, reason: '부적절한 단어가 포함되어 있습니다' }
    }

    return { isValid: true }
  }
}

/**
 * Rate Limiting 보안
 */
export class SecurityRateLimit {
  private static attempts: Map<string, { count: number; resetTime: number; blocked?: boolean }> =
    new Map()
  private static suspiciousIPs: Set<string> = new Set()

  /**
   * 로그인 시도 제한
   */
  static checkLoginAttempts(identifier: string): {
    allowed: boolean
    remainingAttempts?: number
    blockDuration?: number
  } {
    const now = Date.now()
    const maxAttempts = 5
    const blockDuration = 15 * 60 * 1000 // 15분
    const windowDuration = 5 * 60 * 1000 // 5분

    const record = this.attempts.get(identifier)

    // 기록이 없거나 시간 윈도우가 지났으면 초기화
    if (!record || now > record.resetTime) {
      this.attempts.set(identifier, { count: 1, resetTime: now + windowDuration })
      return { allowed: true, remainingAttempts: maxAttempts - 1 }
    }

    // 이미 차단된 경우
    if (record.blocked && now < record.resetTime) {
      return {
        allowed: false,
        blockDuration: Math.ceil((record.resetTime - now) / 1000),
      }
    }

    // 시도 횟수 증가
    record.count++

    // 최대 시도 횟수 초과 시 차단
    if (record.count >= maxAttempts) {
      record.blocked = true
      record.resetTime = now + blockDuration
      this.suspiciousIPs.add(identifier)

      return {
        allowed: false,
        blockDuration: blockDuration / 1000,
      }
    }

    return {
      allowed: true,
      remainingAttempts: maxAttempts - record.count,
    }
  }

  /**
   * API 요청 빈도 제한
   */
  static checkAPIRateLimit(
    identifier: string,
    endpoint: string
  ): { allowed: boolean; retryAfter?: number } {
    const now = Date.now()
    const key = `${identifier}:${endpoint}`

    // 엔드포인트별 제한 설정
    const limits = {
      '/api/auth/login': { max: 5, window: 5 * 60 * 1000 }, // 5회/5분
      '/api/auth/signup': { max: 3, window: 10 * 60 * 1000 }, // 3회/10분
      '/api/rooms': { max: 100, window: 60 * 1000 }, // 100회/1분
      '/api/messages': { max: 50, window: 60 * 1000 }, // 50회/1분
      '/api/requests': { max: 10, window: 60 * 1000 }, // 10회/1분
      default: { max: 30, window: 60 * 1000 }, // 30회/1분
    }

    const limit = limits[endpoint as keyof typeof limits] || limits.default
    const record = this.attempts.get(key)

    if (!record || now > record.resetTime) {
      this.attempts.set(key, { count: 1, resetTime: now + limit.window })
      return { allowed: true }
    }

    if (record.count >= limit.max) {
      return {
        allowed: false,
        retryAfter: Math.ceil((record.resetTime - now) / 1000),
      }
    }

    record.count++
    return { allowed: true }
  }

  /**
   * 의심스러운 활동 감지
   */
  static detectSuspiciousActivity(identifier: string, activity: string): boolean {
    const patterns = {
      // 빠른 연속 요청
      rapidRequests: (id: string) => {
        const recentRequests = Array.from(this.attempts.keys()).filter(key =>
          key.startsWith(id)
        ).length
        return recentRequests > 20
      },

      // 다양한 엔드포인트에 대한 무차별 요청
      endpointScanning: (id: string) => {
        const uniqueEndpoints = new Set(
          Array.from(this.attempts.keys())
            .filter(key => key.startsWith(id))
            .map(key => key.split(':')[1])
        )
        return uniqueEndpoints.size > 10
      },
    }

    const isSuspicious = Object.values(patterns).some(check => check(identifier))

    if (isSuspicious) {
      this.suspiciousIPs.add(identifier)
      console.warn(`🚨 Suspicious activity detected: ${activity} from ${identifier}`)
    }

    return isSuspicious
  }

  /**
   * IP 차단 상태 확인
   */
  static isBlocked(identifier: string): boolean {
    return this.suspiciousIPs.has(identifier)
  }

  /**
   * 차단 해제
   */
  static unblock(identifier: string): void {
    this.suspiciousIPs.delete(identifier)
    this.attempts.delete(identifier)
  }
}

/**
 * 콘텐츠 보안 정책 (CSP)
 */
export class ContentSecurityPolicy {
  /**
   * CSP 헤더 생성
   */
  static generateCSPHeader(): string {
    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://js.stripe.com https://dapi.kakao.com",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: blob: https: http:",
      "connect-src 'self' https://xnrqfkecpabucnoxxtwa.supabase.co https://api.stripe.com https://dapi.kakao.com wss://xnrqfkecpabucnoxxtwa.supabase.co",
      "frame-src 'self' https://js.stripe.com",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      'upgrade-insecure-requests',
    ]

    return directives.join('; ')
  }

  /**
   * 메타 태그로 CSP 설정
   */
  static setupMetaCSP(): void {
    if (typeof document === 'undefined') return

    const existingMeta = document.querySelector('meta[http-equiv="Content-Security-Policy"]')
    if (existingMeta) return

    const meta = document.createElement('meta')
    meta.httpEquiv = 'Content-Security-Policy'
    meta.content = this.generateCSPHeader()
    document.head.appendChild(meta)
  }
}

/**
 * 세션 보안
 */
export class SessionSecurity {
  /**
   * 안전한 토큰 생성
   */
  static generateSecureToken(length: number = 32): string {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('')
  }

  /**
   * 세션 만료 시간 검증
   */
  static isSessionExpired(timestamp: number, maxAge: number = 24 * 60 * 60 * 1000): boolean {
    return Date.now() - timestamp > maxAge
  }

  /**
   * 안전한 세션 ID 생성
   */
  static generateSessionId(): string {
    return this.generateSecureToken(64)
  }

  /**
   * 세션 하이재킹 방지를 위한 핑거프린팅
   */
  static generateFingerprint(): string {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    ctx!.textBaseline = 'top'
    ctx!.font = '14px Arial'
    ctx!.fillText('안전한 세션을 위한 핑거프린트', 2, 2)

    const fingerprint = [
      navigator.userAgent,
      navigator.language,
      screen.width + 'x' + screen.height,
      new Date().getTimezoneOffset(),
      canvas.toDataURL(),
    ].join('|')

    return btoa(fingerprint).slice(0, 32)
  }
}

/**
 * 파일 업로드 보안
 */
export class FileUploadSecurity {
  private static allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
  private static maxFileSize = 5 * 1024 * 1024 // 5MB

  /**
   * 파일 타입 검증
   */
  static validateFileType(file: File): { isValid: boolean; reason?: string } {
    if (!this.allowedTypes.includes(file.type)) {
      return {
        isValid: false,
        reason: `허용되지 않는 파일 형식입니다. 허용: ${this.allowedTypes.join(', ')}`,
      }
    }
    return { isValid: true }
  }

  /**
   * 파일 크기 검증
   */
  static validateFileSize(file: File): { isValid: boolean; reason?: string } {
    if (file.size > this.maxFileSize) {
      return {
        isValid: false,
        reason: `파일 크기가 너무 큽니다. 최대 ${this.maxFileSize / (1024 * 1024)}MB`,
      }
    }
    return { isValid: true }
  }

  /**
   * 파일 내용 검증 (매직 넘버 확인)
   */
  static async validateFileContent(file: File): Promise<{ isValid: boolean; reason?: string }> {
    return new Promise(resolve => {
      const reader = new FileReader()

      reader.onload = e => {
        const arrayBuffer = e.target?.result as ArrayBuffer
        const uint8Array = new Uint8Array(arrayBuffer)

        // JPEG 매직 넘버 확인
        if (file.type === 'image/jpeg') {
          if (uint8Array[0] !== 0xff || uint8Array[1] !== 0xd8) {
            resolve({ isValid: false, reason: 'JPEG 파일이 아닙니다' })
            return
          }
        }

        // PNG 매직 넘버 확인
        if (file.type === 'image/png') {
          const pngSignature = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]
          for (let i = 0; i < pngSignature.length; i++) {
            if (uint8Array[i] !== pngSignature[i]) {
              resolve({ isValid: false, reason: 'PNG 파일이 아닙니다' })
              return
            }
          }
        }

        resolve({ isValid: true })
      }

      reader.onerror = () => {
        resolve({ isValid: false, reason: '파일을 읽을 수 없습니다' })
      }

      // 처음 100바이트만 읽어서 매직 넘버 확인
      reader.readAsArrayBuffer(file.slice(0, 100))
    })
  }

  /**
   * 종합 파일 검증
   */
  static async validateFile(file: File): Promise<{ isValid: boolean; reason?: string }> {
    // 파일 타입 검증
    const typeResult = this.validateFileType(file)
    if (!typeResult.isValid) return typeResult

    // 파일 크기 검증
    const sizeResult = this.validateFileSize(file)
    if (!sizeResult.isValid) return sizeResult

    // 파일 내용 검증
    const contentResult = await this.validateFileContent(file)
    if (!contentResult.isValid) return contentResult

    return { isValid: true }
  }
}

/**
 * 전역 보안 설정 초기화
 */
export function initializeSecurityMeasures(): () => void {
  console.log('🔒 보안 시스템 초기화 시작...')

  // CSP 설정
  ContentSecurityPolicy.setupMetaCSP()

  // 개발자 도구 차단 (프로덕션에서만)
  if (process.env.NODE_ENV === 'production') {
    const devtools = {
      open: false,
      orientation: null as string | null,
    }

    const threshold = 160

    setInterval(() => {
      if (
        window.outerHeight - window.innerHeight > threshold ||
        window.outerWidth - window.innerWidth > threshold
      ) {
        if (!devtools.open) {
          devtools.open = true
          console.clear()
          console.log('%c🚨 보안 경고', 'color: red; font-size: 50px; font-weight: bold;')
          console.log(
            '%c개발자 도구 사용이 감지되었습니다.\n악의적인 코드 실행을 방지하기 위해 콘솔을 사용하지 마세요.',
            'color: red; font-size: 16px;'
          )
        }
      } else {
        devtools.open = false
      }
    }, 500)
  }

  // 우클릭 방지 (이미지 다운로드 방지)
  document.addEventListener('contextmenu', e => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault()
    }
  })

  // 드래그 방지 (이미지 드래그 방지)
  document.addEventListener('dragstart', e => {
    if (e.target instanceof HTMLImageElement) {
      e.preventDefault()
    }
  })

  // 키보드 단축키 차단 (F12, Ctrl+Shift+I 등)
  document.addEventListener('keydown', e => {
    // F12
    if (e.key === 'F12') {
      e.preventDefault()
    }

    // Ctrl+Shift+I (개발자 도구)
    if (e.ctrlKey && e.shiftKey && e.key === 'I') {
      e.preventDefault()
    }

    // Ctrl+Shift+C (요소 선택)
    if (e.ctrlKey && e.shiftKey && e.key === 'C') {
      e.preventDefault()
    }

    // Ctrl+U (소스 보기)
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault()
    }
  })

  // 전역 에러 핸들러
  window.addEventListener('error', e => {
    console.error('Security: Unhandled error detected:', e.error)
  })

  window.addEventListener('unhandledrejection', e => {
    console.error('Security: Unhandled promise rejection:', e.reason)
  })

  // 클린업 함수
  const cleanup = () => {
    console.log('🔒 보안 시스템 정리')
  }

  console.log('✅ 보안 시스템 초기화 완료')

  return cleanup
}

const defaultExport = {
  InputSanitizer,
  SecurityRateLimit,
  ContentSecurityPolicy,
  SessionSecurity,
  FileUploadSecurity,
  initializeSecurityMeasures,
}
export default defaultExport
