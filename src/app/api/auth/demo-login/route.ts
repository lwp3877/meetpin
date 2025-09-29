/**
 * Demo login endpoint for development testing
 * Provides mock authentication for development environment
 */

import { NextRequest, NextResponse } from 'next/server'
import { isDevelopmentMode } from '@/lib/config/flags'
import { ApiResponse } from '@/lib/api'

interface DemoLoginRequest {
  email: string
  password: string
}

export async function POST(request: NextRequest) {
  try {
    // Only allow in development mode
    if (!isDevelopmentMode) {
      return NextResponse.json(
        { ok: false, message: 'Demo login is only available in development mode' },
        { status: 403 }
      )
    }

    const body: DemoLoginRequest = await request.json()
    const { email, password } = body

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { ok: false, message: 'Email and password are required' },
        { status: 400 }
      )
    }

    // Mock authentication - only allow specific test accounts
    let mockUser = null

    if (email === 'admin@meetpin.com' && password === '123456') {
      mockUser = {
        id: 'admin_demo',
        email: 'admin@meetpin.com',
        nickname: '관리자',
        role: 'admin' as const,
        age_range: '30-39',
        avatar_url: undefined,
        intro: '개발용 관리자 계정',
        referral_code: undefined,
        created_at: new Date().toISOString(),
      }
    } else if (email === 'test@test.com' && password === '123456') {
      mockUser = {
        id: 'user_demo',
        email: 'test@test.com',
        nickname: '테스트유저',
        role: 'user' as const,
        age_range: '20-29',
        avatar_url: undefined,
        intro: '개발용 일반 사용자 계정',
        referral_code: undefined,
        created_at: new Date().toISOString(),
      }
    } else {
      return NextResponse.json(
        { ok: false, message: 'Invalid demo credentials' },
        { status: 401 }
      )
    }

    const response: ApiResponse<any> = {
      ok: true,
      data: { user: mockUser },
      message: 'Demo login successful'
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Demo login error:', error)
    return NextResponse.json(
      { ok: false, message: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Handle unsupported methods
export async function GET() {
  return NextResponse.json(
    { ok: false, message: 'Method not allowed' },
    { status: 405 }
  )
}