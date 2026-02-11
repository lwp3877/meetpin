/* src/app/api/dsar/delete-request/route.ts */
import { NextRequest } from 'next/server'
import { getAuthenticatedUser, createErrorResponse } from '@/lib/api'

export async function GET(): Promise<Response> {
  try {
    await getAuthenticatedUser()
    return Response.json({ pending: false })
  } catch {
    return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED')
  }
}

export async function POST(_req: NextRequest): Promise<Response> {
  try {
    await getAuthenticatedUser()
    return Response.json({ requested: true }, { status: 201 })
  } catch {
    return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED')
  }
}

export async function DELETE(): Promise<Response> {
  try {
    await getAuthenticatedUser()
    return Response.json({ cancelled: true })
  } catch {
    return createErrorResponse('인증이 필요합니다', 401, 'UNAUTHORIZED')
  }
}
