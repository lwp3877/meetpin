/* src/app/api/status/route.ts - 간단한 상태 체크 */

import { NextRequest } from 'next/server'

export async function GET(_request: NextRequest): Promise<Response> {
  try {
    return Response.json(
      {
        ok: true,
        status: 'alive',
        timestamp: new Date().toISOString(),
        version: '1.4.20',
        environment: process.env.NODE_ENV || 'unknown',
        vercel_env: process.env.VERCEL_ENV || 'local',
        mock_mode: process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'undefined',
      },
      {
        status: 200,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Status-Check': 'meetpin-simple',
        },
      }
    )
  } catch (error) {
    return Response.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          'X-Status-Check': 'meetpin-simple',
        },
      }
    )
  }
}