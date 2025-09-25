import { NextResponse } from 'next/server'

export async function GET() {
  const buildTime = process.env.BUILD_TIME || new Date().toISOString()
  const gitSha = process.env.VERCEL_GIT_COMMIT_SHA || process.env.GIT_SHA || 'unknown'
  const version = process.env.npm_package_version || '1.4.1'
  const nodeVersion = process.version
  const region = process.env.VERCEL_REGION || process.env.AWS_REGION || 'local'

  // 서버 시작 시간 추정 (프로세스 업타임 기반)
  const uptimeSeconds = Math.floor(process.uptime())

  const status = {
    version,
    gitSha: gitSha.slice(0, 7), // Short SHA
    buildTime,
    node: nodeVersion,
    region,
    uptimeSec: uptimeSeconds,
    timestamp: new Date().toISOString()
  }

  return NextResponse.json(status, {
    status: 200,
    headers: {
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Content-Type': 'application/json'
    }
  })
}