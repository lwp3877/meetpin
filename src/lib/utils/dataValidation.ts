/* src/lib/utils/dataValidation.ts */

/**
 * 실제 데이터 vs Mock 데이터 완전 검증 유틸리티
 * 실제 사용자 테스트에서 Mock 데이터가 실제 환경을 정확히 시뮬레이션하는지 확인
 */

import { isDevelopmentMode } from '@/lib/config/flags'
import { logger } from '@/lib/observability/logger'

/**
 * 데이터 검증 결과 인터페이스
 */
export interface ValidationResult {
  isValid: boolean
  errors: string[]
  warnings: string[]
  schema: string
  environment: 'mock' | 'production'
}

/**
 * API 응답 검증기
 */
export class APIResponseValidator {
  /**
   * 방 데이터 구조 검증
   */
  static validateRoomData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: 'Room',
      environment: isDevelopmentMode ? 'mock' : 'production',
    }

    // 필수 필드 검증
    const requiredFields = [
      'id',
      'title',
      'category',
      'lat',
      'lng',
      'place_text',
      'start_at',
      'max_people',
      'fee',
      'visibility',
      'created_at',
      'host',
    ]

    requiredFields.forEach(field => {
      if (!data.hasOwnProperty(field)) {
        if (result.environment === 'mock') {
          // Mock 환경에서는 경고로만 처리
          result.warnings.push(`Missing field in mock data: ${field}`)
        } else {
          result.errors.push(`Missing required field: ${field}`)
          result.isValid = false
        }
      }
    })

    // 타입 검증
    if (data.id && typeof data.id !== 'string') {
      result.errors.push('id must be string (UUID)')
      result.isValid = false
    }

    if (data.lat && (typeof data.lat !== 'number' || data.lat < -90 || data.lat > 90)) {
      result.errors.push('lat must be number between -90 and 90')
      result.isValid = false
    }

    if (data.lng && (typeof data.lng !== 'number' || data.lng < -180 || data.lng > 180)) {
      result.errors.push('lng must be number between -180 and 180')
      result.isValid = false
    }

    if (
      data.max_people &&
      (typeof data.max_people !== 'number' || data.max_people < 1 || data.max_people > 100)
    ) {
      result.errors.push('max_people must be number between 1 and 100')
      result.isValid = false
    }

    if (data.fee && (typeof data.fee !== 'number' || data.fee < 0)) {
      result.errors.push('fee must be non-negative number')
      result.isValid = false
    }

    if (data.category && !['drink', 'exercise', 'other'].includes(data.category)) {
      result.errors.push('category must be drink, exercise, or other')
      result.isValid = false
    }

    if (data.visibility && !['public', 'private'].includes(data.visibility)) {
      result.errors.push('visibility must be public or private')
      result.isValid = false
    }

    // 호스트 데이터 검증
    if (data.host) {
      if (!data.host.id || typeof data.host.id !== 'string') {
        if (result.environment === 'mock') {
          result.warnings.push('host.id should be string in mock data')
        } else {
          result.errors.push('host.id must be string')
          result.isValid = false
        }
      }
      if (!data.host.nickname || typeof data.host.nickname !== 'string') {
        if (result.environment === 'mock') {
          result.warnings.push('host.nickname should be string in mock data')
        } else {
          result.errors.push('host.nickname must be string')
          result.isValid = false
        }
      }
      if (!data.host.age_range || typeof data.host.age_range !== 'string') {
        if (result.environment === 'mock') {
          result.warnings.push('host.age_range should be string in mock data')
        } else {
          result.errors.push('host.age_range must be string')
          result.isValid = false
        }
      }
    } else {
      if (result.environment === 'mock') {
        result.warnings.push('host data missing in mock data')
      } else {
        result.errors.push('host data is required')
        result.isValid = false
      }
    }

    // 날짜 형식 검증
    if (data.start_at && isNaN(Date.parse(data.start_at))) {
      result.errors.push('start_at must be valid ISO date string')
      result.isValid = false
    }

    if (data.created_at && isNaN(Date.parse(data.created_at))) {
      result.errors.push('created_at must be valid ISO date string')
      result.isValid = false
    }

    // Mock vs Real 데이터 특징 확인
    if (result.environment === 'mock') {
      // Mock 데이터 특징 검증
      if (data.id && data.id.startsWith('mock-')) {
        result.warnings.push('Mock data detected (ID prefix)')
      }

      if (data.host && data.host.id === 'mock-admin-001') {
        result.warnings.push('Mock admin user detected')
      }

      // Mock 데이터의 실제성 검증
      if ((data as any).lat && (data as any).lng) {
        const isSeoulArea =
          (data as any).lat >= 37.4 && (data as any).lat <= 37.7 && (data as any).lng >= 126.7 && (data as any).lng <= 127.2
        if (!isSeoulArea) {
          result.warnings.push('Location outside Seoul area (unusual for mock data)')
        }
      }
    }

    return result
  }

  /**
   * 사용자 데이터 구조 검증
   */
  static validateUserData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: 'User',
      environment: isDevelopmentMode ? 'mock' : 'production',
    }

    // 필수 필드 검증
    const requiredFields = ['id', 'email', 'role', 'created_at']

    requiredFields.forEach(field => {
      if (!(data as any).hasOwnProperty(field)) {
        result.errors.push(`Missing required field: ${field}`)
        result.isValid = false
      }
    })

    // 이메일 형식 검증
    if ((data as any).email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((data as any).email)) {
      result.errors.push('email must be valid email format')
      result.isValid = false
    }

    // 역할 검증
    if ((data as any).role && !['user', 'admin'].includes((data as any).role)) {
      result.errors.push('role must be user or admin')
      result.isValid = false
    }

    // 나이대 검증 (선택적)
    if ((data as any).age_range && !['10대', '20대', '30대', '40대', '50대 이상'].includes((data as any).age_range)) {
      result.errors.push('age_range must be valid Korean age range')
      result.isValid = false
    }

    // Mock vs Real 데이터 특징 확인
    if (result.environment === 'mock') {
      if ((data as any).email && (data as any).email.endsWith('@meetpin.com')) {
        result.warnings.push('Mock email domain detected')
      }

      if ((data as any).id && (data as any).id.startsWith('mock-')) {
        result.warnings.push('Mock ID prefix detected')
      }
    }

    return result
  }

  /**
   * 매치 데이터 구조 검증
   */
  static validateMatchData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: 'Match',
      environment: isDevelopmentMode ? 'mock' : 'production',
    }

    const requiredFields = ['id', 'room_id', 'user1_id', 'user2_id', 'status', 'created_at']

    requiredFields.forEach(field => {
      if (!(data as any).hasOwnProperty(field)) {
        result.errors.push(`Missing required field: ${field}`)
        result.isValid = false
      }
    })

    if ((data as any).status && !['active', 'ended', 'blocked'].includes((data as any).status)) {
      result.errors.push('status must be active, ended, or blocked')
      result.isValid = false
    }

    if ((data as any).user1_id === (data as any).user2_id) {
      result.errors.push('user1_id and user2_id must be different')
      result.isValid = false
    }

    return result
  }

  /**
   * 메시지 데이터 구조 검증
   */
  static validateMessageData(data: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: 'Message',
      environment: isDevelopmentMode ? 'mock' : 'production',
    }

    const requiredFields = ['id', 'sender_id', 'match_id', 'content', 'created_at']

    requiredFields.forEach(field => {
      if (!(data as any).hasOwnProperty(field)) {
        result.errors.push(`Missing required field: ${field}`)
        result.isValid = false
      }
    })

    if ((data as any).content && typeof (data as any).content !== 'string') {
      result.errors.push('content must be string')
      result.isValid = false
    }

    if ((data as any).content && (data as any).content.length > 1000) {
      result.warnings.push('content is very long (>1000 chars)')
    }

    return result
  }
}

/**
 * Mock 데이터 품질 검증기
 */
export class MockDataQualityValidator {
  /**
   * Mock 데이터의 현실성 검증
   */
  static validateMockRealism(data: Record<string, unknown>[], schema: string): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: `MockRealism_${schema}`,
      environment: 'mock',
    }

    if (!Array.isArray(data) || data.length === 0) {
      result.errors.push('No mock data provided')
      result.isValid = false
      return result
    }

    // 데이터 다양성 검증
    if (schema === 'Room') {
      const categories = new Set(data.map(item => item.category))
      if (categories.size < 3) {
        result.warnings.push('Limited category diversity in mock data')
      }

      const feeRanges = data.map(item => item.fee || 0)
      const uniqueFees = new Set(feeRanges)
      if (uniqueFees.size < Math.min(5, data.length)) {
        result.warnings.push('Limited fee diversity in mock data')
      }

      // 시간 분포 검증
      const startTimes = data.map((item: any) => new Date(item.start_at).getHours())
      const timeDistribution = new Set(startTimes)
      if (timeDistribution.size < 3) {
        result.warnings.push('Limited time diversity in mock data')
      }
    }

    if (schema === 'User') {
      const ageRanges = new Set(data.map(item => item.age_range).filter(Boolean))
      if (ageRanges.size < 3) {
        result.warnings.push('Limited age range diversity in mock data')
      }

      const roles = new Set(data.map(item => item.role))
      if (roles.size < 2) {
        result.warnings.push('Missing role diversity (admin/user)')
      }
    }

    // ID 중복 검증
    const ids = data.map(item => item.id)
    const uniqueIds = new Set(ids)
    if (ids.length !== uniqueIds.size) {
      result.errors.push('Duplicate IDs found in mock data')
      result.isValid = false
    }

    return result
  }

  /**
   * Mock과 실제 데이터 스키마 호환성 검증
   * @param mockData - Mock data object (any is justified for schema comparison)
   * @param realDataSample - Real data sample (any is justified for schema comparison)
   */
  static validateSchemaCompatibility(mockData: any, realDataSample: any): ValidationResult {
    const result: ValidationResult = {
      isValid: true,
      errors: [],
      warnings: [],
      schema: 'SchemaCompatibility',
      environment: 'mock',
    }

    if (!mockData || !realDataSample) {
      result.errors.push('Both mock and real data samples required')
      result.isValid = false
      return result
    }

    const mockKeys = new Set(Object.keys(mockData))
    const realKeys = new Set(Object.keys(realDataSample))

    // Mock에 있지만 실제 데이터에 없는 필드
    mockKeys.forEach(key => {
      if (!realKeys.has(key)) {
        result.warnings.push(`Mock field '${key}' not found in real data`)
      }
    })

    // 실제 데이터에 있지만 Mock에 없는 필드
    realKeys.forEach(key => {
      if (!mockKeys.has(key)) {
        result.errors.push(`Real data field '${key}' missing in mock data`)
        result.isValid = false
      }
    })

    // 타입 호환성 검증
    mockKeys.forEach(key => {
      if (realKeys.has(key)) {
        const mockType = typeof mockData[key]
        const realType = typeof realDataSample[key]

        if (mockType !== realType) {
          result.errors.push(
            `Type mismatch for field '${key}': mock(${mockType}) vs real(${realType})`
          )
          result.isValid = false
        }
      }
    })

    return result
  }
}

/**
 * 실시간 데이터 검증 모니터
 */
export class DataValidationMonitor {
  private static validationResults: Map<string, ValidationResult[]> = new Map()
  private static isMonitoring = false

  /**
   * 실시간 검증 모니터링 시작
   */
  static startMonitoring(): () => void {
    if (this.isMonitoring) {
      logger.warn('Data validation monitoring already started')
      return () => {}
    }

    this.isMonitoring = true
    logger.info('🔍 데이터 검증 모니터링 시작')

    // 주기적으로 검증 결과 요약 출력
    const interval = setInterval(() => {
      this.printValidationSummary()
    }, 30000) // 30초마다

    return () => {
      this.isMonitoring = false
      clearInterval(interval)
      logger.info('🔍 데이터 검증 모니터링 종료')
    }
  }

  /**
   * API 응답 자동 검증
   * @param data - Dynamic API response data (any is justified for generic validation)
   */
  static validateAPIResponse(endpoint: string, data: any): ValidationResult {
    let result: ValidationResult

    // 엔드포인트별 검증 로직
    if (endpoint.includes('/rooms')) {
      if (Array.isArray(data)) {
        // 방 목록
        result = {
          isValid: true,
          errors: [],
          warnings: [],
          schema: 'RoomList',
          environment: isDevelopmentMode ? 'mock' : 'production',
        }

        data.forEach((room, index) => {
          const roomResult = APIResponseValidator.validateRoomData(room)
          if (!roomResult.isValid) {
            result.isValid = false
            result.errors.push(`Room ${index}: ${roomResult.errors.join(', ')}`)
          }
          result.warnings.push(...roomResult.warnings.map(w => `Room ${index}: ${w}`))
        })
      } else {
        // 단일 방
        result = APIResponseValidator.validateRoomData(data)
      }
    } else if (endpoint.includes('/users') || endpoint.includes('/profiles')) {
      result = APIResponseValidator.validateUserData(data)
    } else if (endpoint.includes('/matches')) {
      if (Array.isArray(data)) {
        result = {
          isValid: true,
          errors: [],
          warnings: [],
          schema: 'MatchList',
          environment: isDevelopmentMode ? 'mock' : 'production',
        }

        data.forEach((match, index) => {
          const matchResult = APIResponseValidator.validateMatchData(match)
          if (!matchResult.isValid) {
            result.isValid = false
            result.errors.push(`Match ${index}: ${matchResult.errors.join(', ')}`)
          }
          result.warnings.push(...matchResult.warnings.map(w => `Match ${index}: ${w}`))
        })
      } else {
        result = APIResponseValidator.validateMatchData(data)
      }
    } else if (endpoint.includes('/messages')) {
      if (Array.isArray(data)) {
        result = {
          isValid: true,
          errors: [],
          warnings: [],
          schema: 'MessageList',
          environment: isDevelopmentMode ? 'mock' : 'production',
        }

        data.forEach((message, index) => {
          const messageResult = APIResponseValidator.validateMessageData(message)
          if (!messageResult.isValid) {
            result.isValid = false
            result.errors.push(`Message ${index}: ${messageResult.errors.join(', ')}`)
          }
          result.warnings.push(...messageResult.warnings.map(w => `Message ${index}: ${w}`))
        })
      } else {
        result = APIResponseValidator.validateMessageData(data)
      }
    } else {
      // 기본 검증
      result = {
        isValid: data !== null && data !== undefined,
        errors: data === null || data === undefined ? ['Data is null or undefined'] : [],
        warnings: [],
        schema: 'Generic',
        environment: isDevelopmentMode ? 'mock' : 'production',
      }
    }

    // 결과 저장
    if (!this.validationResults.has(endpoint)) {
      this.validationResults.set(endpoint, [])
    }
    this.validationResults.get(endpoint)!.push(result)

    // 에러가 있으면 콘솔에 즉시 출력 (개발 모드에서는 경고로)
    if (!result.isValid) {
      if (isDevelopmentMode) {
        logger.warn(`⚠️ Data validation issues for ${endpoint} (Dev Mode):`, result.errors)
      } else {
        logger.error(`❌ Data validation failed for ${endpoint}:`, result.errors)
      }
    }

    if (result.warnings.length > 0) {
      logger.warn(`⚠️ Data validation warnings for ${endpoint}:`, result.warnings)
    }

    return result
  }

  /**
   * 검증 결과 요약 출력
   */
  static printValidationSummary() {
    if (this.validationResults.size === 0) {
      logger.info('📊 검증 결과: 아직 데이터가 없습니다')
      return
    }

    const summary = {
      totalEndpoints: this.validationResults.size,
      totalValidations: 0,
      successfulValidations: 0,
      failedValidations: 0,
      warningCount: 0,
    }

    this.validationResults.forEach((results, _endpoint) => {
      results.forEach(result => {
        summary.totalValidations++
        if (result.isValid) {
          summary.successfulValidations++
        } else {
          summary.failedValidations++
        }
        summary.warningCount += result.warnings.length
      })
    })

    logger.info(`
📊 데이터 검증 요약 (환경: ${isDevelopmentMode ? 'Mock' : 'Production'})
   - 검증된 엔드포인트: ${summary.totalEndpoints}개
   - 총 검증 횟수: ${summary.totalValidations}회
   - 성공: ${summary.successfulValidations}회 (${Math.round((summary.successfulValidations / summary.totalValidations) * 100)}%)
   - 실패: ${summary.failedValidations}회
   - 경고: ${summary.warningCount}개
    `)

    // 실패한 엔드포인트 상세 정보
    if (summary.failedValidations > 0) {
      logger.info('❌ 실패한 엔드포인트:')
      this.validationResults.forEach((results, endpoint) => {
        const failures = results.filter(r => !r.isValid)
        if (failures.length > 0) {
          logger.info(`   ${endpoint}: ${failures.length}회 실패`)
        }
      })
    }
  }

  /**
   * 검증 결과 초기화
   */
  static clearResults() {
    this.validationResults.clear()
    logger.info('🗑️ 검증 결과 초기화됨')
  }
}

/**
 * 전역 데이터 검증 초기화
 */
export function initializeDataValidation() {
  logger.info('🔍 데이터 검증 시스템 초기화')

  // 현재 환경 로깅
  const environment = isDevelopmentMode ? 'Mock' : 'Production'
  logger.info(`📊 현재 환경: ${environment}`)

  // 실시간 모니터링 시작
  const stopMonitoring = DataValidationMonitor.startMonitoring()

  // 전역 fetch 인터셉터 설정 (개발 모드에서는 경고만, 실제 에러는 무시)
  if (isDevelopmentMode && typeof window !== 'undefined') {
    const originalFetch = window.fetch
    window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
      const response = await originalFetch(input, init)

      // API 응답 검증
      if (response.ok && typeof input === 'string' && input.includes('/api/')) {
        try {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json()

          if (data.ok && data.data) {
            DataValidationMonitor.validateAPIResponse(input, data.data)
          }
        } catch (_error) {
          // JSON 파싱 실패는 무시 (이미지, 파일 등)
        }
      }

      return response
    }
  }

  logger.info('✅ 데이터 검증 시스템 초기화 완료')

  return stopMonitoring
}

