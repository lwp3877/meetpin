#!/usr/bin/env node

/**
 * MeetPin Environment Variables Validation Script
 * Version: 1.0.0
 *
 * 이 스크립트는 배포 전 환경변수 설정을 검증합니다.
 * 사용법: node scripts/validate-env.js [environment]
 * 예시: node scripts/validate-env.js production
 */

const fs = require('fs')
const path = require('path')

// 색상 출력을 위한 ANSI 코드
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  bright: '\x1b[1m',
}

const log = {
  info: msg => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: msg => console.log(`${colors.green}✅${colors.reset} ${msg}`),
  warning: msg => console.log(`${colors.yellow}⚠️${colors.reset} ${msg}`),
  error: msg => console.log(`${colors.red}❌${colors.reset} ${msg}`),
  header: msg => console.log(`\n${colors.bright}${colors.cyan}${msg}${colors.reset}`),
  divider: () => console.log(`${colors.cyan}${'='.repeat(60)}${colors.reset}`),
}

// 환경변수 정의
const ENV_DEFINITIONS = {
  // 필수 환경변수 (모든 환경)
  required: {
    NODE_ENV: {
      description: 'Node.js 실행 환경',
      values: ['development', 'production', 'test'],
      sensitive: false,
    },
    NEXT_PUBLIC_SUPABASE_URL: {
      description: 'Supabase 프로젝트 URL',
      pattern: /^https:\/\/.*\.supabase\.co$/,
      sensitive: false,
    },
    NEXT_PUBLIC_SUPABASE_ANON_KEY: {
      description: 'Supabase 익명 키',
      pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
      sensitive: true,
    },
    SUPABASE_SERVICE_ROLE_KEY: {
      description: 'Supabase 서비스 역할 키',
      pattern: /^eyJ[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/,
      sensitive: true,
    },
    NEXT_PUBLIC_USE_MOCK_DATA: {
      description: 'Mock 데이터 사용 여부',
      values: ['true', 'false'],
      sensitive: false,
    },
  },

  // 프로덕션 환경에서 필수
  production_required: {
    SITE_URL: {
      description: '사이트 기본 URL',
      pattern: /^https:\/\/.+/,
      sensitive: false,
    },
    NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY: {
      description: '카카오맵 JavaScript 키',
      pattern: /^[a-f0-9]+$/,
      sensitive: true,
    },
  },

  // 선택적 환경변수
  optional: {
    STRIPE_SECRET_KEY: {
      description: 'Stripe 비밀 키',
      pattern: /^sk_(test_|live_)[A-Za-z0-9]+$/,
      sensitive: true,
    },
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: {
      description: 'Stripe 공개 키',
      pattern: /^pk_(test_|live_)[A-Za-z0-9]+$/,
      sensitive: false,
    },
    STRIPE_WEBHOOK_SECRET: {
      description: 'Stripe 웹훅 시크릿',
      pattern: /^whsec_[A-Za-z0-9]+$/,
      sensitive: true,
    },
    NEXT_PUBLIC_SENTRY_DSN: {
      description: 'Sentry DSN',
      pattern: /^https:\/\/.*@.*\.ingest\.sentry\.io\/.*$/,
      sensitive: true,
    },
    NEXT_PUBLIC_GA_ID: {
      description: 'Google Analytics ID',
      pattern: /^G-[A-Z0-9]+$/,
      sensitive: false,
    },
  },
}

// 환경변수 로드
function loadEnvironmentVariables(env = 'development') {
  const envFiles = [`.env.${env}.local`, `.env.local`, `.env.${env}`, '.env']

  const envVars = { ...process.env }

  for (const envFile of envFiles) {
    const envPath = path.join(process.cwd(), envFile)
    if (fs.existsSync(envPath)) {
      log.info(`환경변수 파일 로드: ${envFile}`)
      const envContent = fs.readFileSync(envPath, 'utf8')
      const lines = envContent.split('\n')

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed && !trimmed.startsWith('#')) {
          const [key, ...valueParts] = trimmed.split('=')
          if (key && valueParts.length > 0) {
            const value = valueParts.join('=').replace(/^["']|["']$/g, '')
            envVars[key] = value
          }
        }
      }
    }
  }

  return envVars
}

// 환경변수 검증
function validateEnvironmentVariable(key, definition, value, environment) {
  const results = {
    passed: false,
    warnings: [],
    errors: [],
  }

  // 값 존재 여부 확인
  if (!value || value.trim() === '') {
    results.errors.push(`${key}: 값이 설정되지 않음`)
    return results
  }

  // 기본값 확인 (프로덕션에서 예시 값 사용 금지)
  const examplePatterns = ['your-', 'example', 'test_key', 'placeholder', 'changeme']

  if (environment === 'production') {
    for (const pattern of examplePatterns) {
      if (value.toLowerCase().includes(pattern)) {
        results.errors.push(`${key}: 프로덕션에서 예시 값 사용 금지 (${pattern} 포함)`)
        return results
      }
    }
  }

  // 값 형식 검증
  if (definition.values) {
    if (!definition.values.includes(value)) {
      results.errors.push(`${key}: 허용되지 않은 값 (허용값: ${definition.values.join(', ')})`)
      return results
    }
  }

  if (definition.pattern) {
    if (!definition.pattern.test(value)) {
      results.errors.push(`${key}: 형식이 올바르지 않음`)
      return results
    }
  }

  // 보안 관련 경고
  if (definition.sensitive && value.length < 20) {
    results.warnings.push(`${key}: 키가 너무 짧음 (보안 위험)`)
  }

  // 개발 환경 관련 경고
  if (environment === 'production') {
    if (key.includes('TEST') || value.includes('test')) {
      results.warnings.push(`${key}: 프로덕션에서 테스트 키 사용 중`)
    }
  }

  results.passed = results.errors.length === 0
  return results
}

// 메인 검증 함수
function validateEnvironment(environment = 'development') {
  log.header(`🔍 MeetPin 환경변수 검증 시작 (${environment.toUpperCase()})`)
  log.divider()

  const envVars = loadEnvironmentVariables(environment)
  let totalChecks = 0
  let passedChecks = 0
  let warnings = 0
  let errors = 0

  // 필수 환경변수 검증
  log.header('📋 필수 환경변수 검증')
  for (const [key, definition] of Object.entries(ENV_DEFINITIONS.required)) {
    totalChecks++
    const value = envVars[key]
    const result = validateEnvironmentVariable(key, definition, value, environment)

    if (result.passed) {
      passedChecks++
      const displayValue = definition.sensitive ? `${value?.substring(0, 10)}...` : value
      log.success(`${key}: ${displayValue}`)
    } else {
      errors += result.errors.length
      for (const error of result.errors) {
        log.error(error)
      }
    }

    warnings += result.warnings.length
    for (const warning of result.warnings) {
      log.warning(warning)
    }
  }

  // 프로덕션 필수 환경변수 검증
  if (environment === 'production') {
    log.header('🏭 프로덕션 필수 환경변수 검증')
    for (const [key, definition] of Object.entries(ENV_DEFINITIONS.production_required)) {
      totalChecks++
      const value = envVars[key]
      const result = validateEnvironmentVariable(key, definition, value, environment)

      if (result.passed) {
        passedChecks++
        const displayValue = definition.sensitive ? `${value?.substring(0, 10)}...` : value
        log.success(`${key}: ${displayValue}`)
      } else {
        errors += result.errors.length
        for (const error of result.errors) {
          log.error(error)
        }
      }

      warnings += result.warnings.length
      for (const warning of result.warnings) {
        log.warning(warning)
      }
    }
  }

  // 선택적 환경변수 검증
  log.header('⚙️ 선택적 환경변수 검증')
  for (const [key, definition] of Object.entries(ENV_DEFINITIONS.optional)) {
    const value = envVars[key]
    if (value && value.trim() !== '') {
      totalChecks++
      const result = validateEnvironmentVariable(key, definition, value, environment)

      if (result.passed) {
        passedChecks++
        const displayValue = definition.sensitive ? `${value?.substring(0, 10)}...` : value
        log.success(`${key}: ${displayValue}`)
      } else {
        errors += result.errors.length
        for (const error of result.errors) {
          log.error(error)
        }
      }

      warnings += result.warnings.length
      for (const warning of result.warnings) {
        log.warning(warning)
      }
    } else {
      log.info(`${key}: 설정되지 않음 (선택사항)`)
    }
  }

  // 요약 결과
  log.divider()
  log.header('📊 검증 결과 요약')

  console.log(`전체 검사 항목: ${totalChecks}`)
  console.log(`통과: ${colors.green}${passedChecks}${colors.reset}`)
  console.log(`경고: ${colors.yellow}${warnings}${colors.reset}`)
  console.log(`오류: ${colors.red}${errors}${colors.reset}`)

  // 배포 가능 여부 판단
  const deploymentReady = errors === 0 && passedChecks >= (environment === 'production' ? 6 : 4)

  log.divider()
  if (deploymentReady) {
    log.success(`🚀 ${environment.toUpperCase()} 환경 배포 준비 완료!`)
    if (warnings > 0) {
      log.warning(`⚠️ ${warnings}개의 경고가 있습니다. 검토 후 배포하세요.`)
    }
  } else {
    log.error(`🚫 ${environment.toUpperCase()} 환경 배포 불가능`)
    log.error(`${errors}개의 오류를 수정한 후 다시 검증하세요.`)
  }

  // 권장사항
  if (environment === 'production') {
    log.header('💡 프로덕션 배포 권장사항')
    console.log('1. 모든 민감한 키를 Vercel Environment Variables에서 설정')
    console.log('2. .env 파일은 Git에 커밋하지 않기')
    console.log('3. Stripe는 Live 키 사용')
    console.log('4. Sentry 에러 모니터링 설정')
    console.log('5. 배포 후 /api/health 엔드포인트로 헬스체크 수행')
  }

  return deploymentReady
}

// 스크립트 실행
if (require.main === module) {
  const environment = process.argv[2] || 'development'

  try {
    const isReady = validateEnvironment(environment)
    process.exit(isReady ? 0 : 1)
  } catch (error) {
    log.error(`검증 중 오류 발생: ${error.message}`)
    process.exit(1)
  }
}

module.exports = { validateEnvironment, loadEnvironmentVariables }
