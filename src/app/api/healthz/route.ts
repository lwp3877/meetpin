import { NextRequest } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // 기본 헬스체크 데이터
    const healthData = {
      ok: true,
      timestamp: new Date().toISOString(),
      status: 'healthy',
      uptime: process.uptime(),
      version: process.env.BUILD_VERSION || '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024)
      }
    }

    return Response.json(healthData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  } catch (error) {
    console.error('Health check failed:', error)
    
    return Response.json(
      {
        ok: false,
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: 'Health check failed'
      },
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate'
        }
      }
    )
  }
}

// 다른 HTTP 메서드는 405 Method Not Allowed
export async function POST() {
  return Response.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}

export async function PUT() {
  return Response.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}

export async function DELETE() {
  return Response.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}

export async function PATCH() {
  return Response.json(
    { error: 'Method Not Allowed', message: 'Only GET requests are supported' },
    { status: 405, headers: { 'Allow': 'GET' } }
  )
}
