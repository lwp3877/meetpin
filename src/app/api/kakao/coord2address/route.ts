/* src/app/api/kakao/coord2address/route.ts */
import { NextRequest } from 'next/server'
import { apiUtils } from '@/lib/api'
import { logger } from '@/lib/observability/logger'

/**
 * Server-side proxy for Kakao Local API coord2address.
 * The browser SDK sends a Referer header which Kakao validates per domain.
 * Server-to-server calls don't send Referer, so any REST API key works.
 *
 * Requires env var: KAKAO_REST_API_KEY (Kakao Console → 앱 설정 → 앱 키 → REST API 키)
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const lat = searchParams.get('lat')
  const lng = searchParams.get('lng')

  if (!lat || !lng) {
    return apiUtils.validation('lat, lng 파라미터가 필요합니다')
  }

  const restKey = process.env.KAKAO_REST_API_KEY
  if (!restKey) {
    // REST key not configured — return null so client falls back to coordinate display
    return apiUtils.success({ address: null })
  }

  try {
    const url = `https://dapi.kakao.com/v2/local/geo/coord2address.json?x=${lng}&y=${lat}&input_coord=WGS84`
    const res = await fetch(url, {
      headers: { Authorization: `KakaoAK ${restKey}` },
      next: { revalidate: 0 },
    })

    if (!res.ok) {
      logger.warn('Kakao coord2address failed', { status: res.status, lat, lng })
      return apiUtils.success({ address: null })
    }

    const data = await res.json()
    const address = data.documents?.[0]?.address?.address_name || null
    return apiUtils.success({ address })
  } catch (err) {
    logger.error('Kakao coord2address proxy error', {
      error: err instanceof Error ? err.message : String(err),
    })
    return apiUtils.success({ address: null })
  }
}
