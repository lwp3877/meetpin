#!/usr/bin/env node
/**
 * Sentry 소스맵 업로드 스크립트
 * SENTRY_DSN과 SENTRY_AUTH_TOKEN이 있을 때만 실행
 */

const { execSync } = require('child_process')

const SENTRY_DSN = process.env.SENTRY_DSN
const SENTRY_AUTH_TOKEN = process.env.SENTRY_AUTH_TOKEN
const SENTRY_ORG = process.env.SENTRY_ORG || 'meetpin'
const SENTRY_PROJECT = process.env.SENTRY_PROJECT || 'meetpin'

if (!SENTRY_DSN) {
  console.log('⏭️  Sentry sourcemap upload skipped - no SENTRY_DSN found')
  process.exit(0)
}

if (!SENTRY_AUTH_TOKEN) {
  console.log('⏭️  Sentry sourcemap upload skipped - no SENTRY_AUTH_TOKEN found')
  process.exit(0)
}

try {
  console.log('📤 Uploading sourcemaps to Sentry...')

  // Create release
  const release = `meetpin@${process.env.npm_package_version || '1.4.1'}`

  execSync(`npx @sentry/cli releases new ${release}`, {
    stdio: 'inherit',
    env: { ...process.env, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT }
  })

  // Upload sourcemaps
  execSync(`npx @sentry/cli releases files ${release} upload-sourcemaps .next/static`, {
    stdio: 'inherit',
    env: { ...process.env, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT }
  })

  // Finalize release
  execSync(`npx @sentry/cli releases finalize ${release}`, {
    stdio: 'inherit',
    env: { ...process.env, SENTRY_AUTH_TOKEN, SENTRY_ORG, SENTRY_PROJECT }
  })

  console.log(`✅ Sourcemaps uploaded for release: ${release}`)

} catch (error) {
  console.error('❌ Sentry sourcemap upload failed:', error.message)
  // Don't fail the build - just warn
  process.exit(0)
}