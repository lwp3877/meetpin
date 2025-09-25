import type {
  ConsentPreferences,
  ConsentCategory,
  ConsentStatus,
  ConsentEvent,
  ConsentRecord,
} from './types'
import {
  DEFAULT_CONSENT_CONFIG,
  COMPLIANCE_SETTINGS,
  DNT_SETTINGS,
  CONSENT_STORAGE_KEYS,
  CONSENT_COOKIE_NAMES,
  shouldRespectDNT,
  CONSENT_VERSION,
} from './config'

class ConsentManager {
  private preferences: ConsentPreferences | null = null
  private isInitialized = false
  private callbacks: Array<(preferences: ConsentPreferences) => void> = []
  private eventHistory: ConsentEvent[] = []

  constructor() {
    if (typeof window !== 'undefined') {
      this.initialize()
    }
  }

  /**
   * 동의 관리자 초기화
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return

    try {
      // 기존 동의 설정 로드
      await this.loadPreferences()

      // DNT 헤더 확인
      if (shouldRespectDNT()) {
        await this.applyDNTSettings()
      }

      // 버전 확인 및 업데이트
      await this.checkVersionUpdate()

      this.isInitialized = true

      // 초기화 이벤트 기록
      this.recordEvent({
        type: 'preferences_changed',
        preferences: this.preferences || this.getDefaultPreferences(),
        metadata: {
          source: 'initialization',
          trigger: 'manager_init',
        },
      })
    } catch (error) {
      console.error('Consent manager initialization failed:', error)
      // 실패 시 기본값 사용
      this.preferences = this.getDefaultPreferences()
      this.isInitialized = true
    }
  }

  /**
   * 기본 동의 설정 생성
   */
  private getDefaultPreferences(): ConsentPreferences {
    return {
      ...DEFAULT_CONSENT_CONFIG.defaultPreferences,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
      ip: undefined,
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
    }
  }

  /**
   * 저장된 동의 설정 로드
   */
  private async loadPreferences(): Promise<void> {
    try {
      // 로컬 스토리지에서 로드
      const stored = localStorage.getItem(CONSENT_STORAGE_KEYS.preferences)
      if (stored) {
        const parsed = JSON.parse(stored) as ConsentPreferences

        // 버전 확인
        if (parsed.version === CONSENT_VERSION) {
          this.preferences = parsed
          return
        }
      }

      // 쿠키에서 로드 (fallback)
      const cookieValue = this.getCookie(CONSENT_COOKIE_NAMES.preferences)
      if (cookieValue) {
        const parsed = JSON.parse(decodeURIComponent(cookieValue)) as ConsentPreferences
        if (parsed.version === CONSENT_VERSION) {
          this.preferences = parsed
          // 로컬 스토리지에 동기화
          this.savePreferences(parsed)
          return
        }
      }
    } catch (error) {
      console.warn('Failed to load consent preferences:', error)
    }

    // 기본값 사용
    this.preferences = this.getDefaultPreferences()
  }

  /**
   * 동의 설정 저장
   */
  private async savePreferences(preferences: ConsentPreferences): Promise<void> {
    try {
      this.preferences = preferences

      // 로컬 스토리지에 저장
      localStorage.setItem(CONSENT_STORAGE_KEYS.preferences, JSON.stringify(preferences))

      // 쿠키에도 저장 (cross-domain 지원)
      this.setCookie(
        CONSENT_COOKIE_NAMES.preferences,
        encodeURIComponent(JSON.stringify(preferences)),
        DEFAULT_CONSENT_CONFIG.expiryDays.preferences
      )

      // 버전 저장
      localStorage.setItem(CONSENT_STORAGE_KEYS.version, CONSENT_VERSION)

      // 콜백 실행
      this.callbacks.forEach(callback => {
        try {
          callback(preferences)
        } catch (error) {
          console.error('Consent callback error:', error)
        }
      })
    } catch (error) {
      console.error('Failed to save consent preferences:', error)
    }
  }

  /**
   * DNT 설정 적용
   */
  private async applyDNTSettings(): Promise<void> {
    if (!DNT_SETTINGS.respectDNT) return

    const preferences = this.preferences || this.getDefaultPreferences()
    let updated = false

    if (DNT_SETTINGS.overrideAnalytics && preferences.analytics !== 'denied') {
      preferences.analytics = 'denied'
      updated = true
    }

    if (DNT_SETTINGS.overrideMarketing && preferences.marketing !== 'denied') {
      preferences.marketing = 'denied'
      updated = true
    }

    if (updated) {
      preferences.timestamp = Date.now()
      await this.savePreferences(preferences)

      this.recordEvent({
        type: 'preferences_changed',
        preferences,
        metadata: {
          source: 'dnt_override',
          trigger: 'do_not_track',
        },
      })
    }
  }

  /**
   * 버전 업데이트 확인
   */
  private async checkVersionUpdate(): Promise<void> {
    const storedVersion = localStorage.getItem(CONSENT_STORAGE_KEYS.version)

    if (storedVersion && storedVersion !== CONSENT_VERSION) {
      // 버전이 다르면 기존 동의 무효화
      await this.resetPreferences('version_update')
    }
  }

  /**
   * 현재 동의 설정 반환
   */
  getPreferences(): ConsentPreferences {
    if (!this.isInitialized) {
      throw new Error('Consent manager not initialized')
    }
    return this.preferences || this.getDefaultPreferences()
  }

  /**
   * 특정 카테고리 동의 상태 확인
   */
  hasConsent(category: ConsentCategory): boolean {
    const preferences = this.getPreferences()
    return preferences[category] === 'granted'
  }

  /**
   * 동의 설정 업데이트
   */
  async updateConsent(
    updates: Partial<Pick<ConsentPreferences, 'analytics' | 'marketing'>>,
    source: string = 'api'
  ): Promise<void> {
    const currentPreferences = this.getPreferences()

    const newPreferences: ConsentPreferences = {
      ...currentPreferences,
      ...updates,
      timestamp: Date.now(),
      version: CONSENT_VERSION,
    }

    await this.savePreferences(newPreferences)

    this.recordEvent({
      type: 'preferences_changed',
      preferences: newPreferences,
      metadata: {
        source,
        trigger: 'user_update',
        changes: updates,
      },
    })
  }

  /**
   * 모든 동의 허용
   */
  async acceptAll(source: string = 'banner'): Promise<void> {
    await this.updateConsent(
      {
        analytics: 'granted',
        marketing: 'granted',
      },
      source
    )

    this.recordEvent({
      type: 'banner_accepted',
      preferences: this.getPreferences(),
      metadata: {
        source,
        trigger: 'accept_all',
      },
    })
  }

  /**
   * 필수 쿠키만 허용
   */
  async rejectAll(source: string = 'banner'): Promise<void> {
    await this.updateConsent(
      {
        analytics: 'denied',
        marketing: 'denied',
      },
      source
    )

    this.recordEvent({
      type: 'banner_rejected',
      preferences: this.getPreferences(),
      metadata: {
        source,
        trigger: 'reject_all',
      },
    })
  }

  /**
   * 동의 설정 초기화
   */
  async resetPreferences(trigger: string = 'user_reset'): Promise<void> {
    const defaultPreferences = this.getDefaultPreferences()
    await this.savePreferences(defaultPreferences)

    // 이벤트 히스토리도 초기화
    this.eventHistory = []
    localStorage.removeItem(CONSENT_STORAGE_KEYS.events)

    this.recordEvent({
      type: 'preferences_reset',
      preferences: defaultPreferences,
      metadata: {
        source: 'reset',
        trigger,
      },
    })
  }

  /**
   * 동의 필요 여부 확인
   */
  needsConsent(): boolean {
    if (!this.isInitialized) return true

    const preferences = this.preferences
    if (!preferences) return true

    // 버전이 다르면 재동의 필요
    if (preferences.version !== CONSENT_VERSION) return true

    // 분석/마케팅 동의 상태가 pending이면 필요
    return preferences.analytics === 'pending' || preferences.marketing === 'pending'
  }

  /**
   * 배너 표시 필요 여부 확인
   */
  shouldShowBanner(): boolean {
    if (!DEFAULT_CONSENT_CONFIG.banner.show) return false

    // 동의가 필요하면 배너 표시
    if (this.needsConsent()) return true

    // 배너 해제 날짜 확인
    const dismissed = localStorage.getItem(CONSENT_STORAGE_KEYS.banner_dismissed)
    if (dismissed) {
      const dismissedTime = parseInt(dismissed)
      const expiryTime =
        dismissedTime + DEFAULT_CONSENT_CONFIG.expiryDays.banner * 24 * 60 * 60 * 1000
      return Date.now() > expiryTime
    }

    return false
  }

  /**
   * 배너 해제 처리
   */
  dismissBanner(): void {
    localStorage.setItem(CONSENT_STORAGE_KEYS.banner_dismissed, Date.now().toString())
  }

  /**
   * 동의 변경 콜백 등록
   */
  onConsentChange(callback: (preferences: ConsentPreferences) => void): () => void {
    this.callbacks.push(callback)

    // 구독 해제 함수 반환
    return () => {
      const index = this.callbacks.indexOf(callback)
      if (index > -1) {
        this.callbacks.splice(index, 1)
      }
    }
  }

  /**
   * 이벤트 기록
   */
  private recordEvent(event: ConsentEvent): void {
    this.eventHistory.push({
      ...event,
      metadata: {
        source: event.metadata?.source || 'unknown',
        trigger: event.metadata?.trigger || 'programmatic',
        ...event.metadata,
        timestamp: Date.now(),
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined,
      },
    })

    // 최대 100개 이벤트만 유지
    if (this.eventHistory.length > 100) {
      this.eventHistory = this.eventHistory.slice(-100)
    }

    // 로컬 스토리지에 저장
    try {
      localStorage.setItem(CONSENT_STORAGE_KEYS.events, JSON.stringify(this.eventHistory))
    } catch (error) {
      console.warn('Failed to save consent events:', error)
    }
  }

  /**
   * 이벤트 히스토리 반환
   */
  getEventHistory(): ConsentEvent[] {
    return [...this.eventHistory]
  }

  /**
   * 쿠키 헬퍼 함수들
   */
  private getCookie(name: string): string | null {
    if (typeof document === 'undefined') return null

    const value = `; ${document.cookie}`
    const parts = value.split(`; ${name}=`)
    if (parts.length === 2) {
      return parts.pop()?.split(';').shift() || null
    }
    return null
  }

  private setCookie(name: string, value: string, days: number): void {
    if (typeof document === 'undefined') return

    const expires = new Date()
    expires.setTime(expires.getTime() + days * 24 * 60 * 60 * 1000)

    document.cookie = `${name}=${value}; expires=${expires.toUTCString()}; path=/; samesite=lax`
  }
}

// 싱글톤 인스턴스
export const consentManager = new ConsentManager()

// 타입 가드 함수들
export function isConsentGranted(category: ConsentCategory): boolean {
  try {
    return consentManager.hasConsent(category)
  } catch {
    // 초기화되지 않은 경우 필수 쿠키만 허용
    return category === 'necessary'
  }
}

export function getConsentPreferences(): ConsentPreferences | null {
  try {
    return consentManager.getPreferences()
  } catch {
    return null
  }
}
