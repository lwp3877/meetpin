/* src/lib/utils/bbox.ts */
// 최소한의 BBox 유틸리티만 유지해 테스트와 API에서 사용하는 기능에 집중합니다.

export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

/**
 * `bbox=south,west,north,east` 형식의 문자열을 파싱합니다.
 */
export function parseBBoxParam(bboxString: string | null): BoundingBox | null {
  if (!bboxString || typeof bboxString !== 'string') return null

  const parts = bboxString.split(',').map(s => s.trim())
  if (parts.length !== 4) return null

  const [southStr, westStr, northStr, eastStr] = parts
  const south = Number.parseFloat(southStr)
  const west = Number.parseFloat(westStr)
  const north = Number.parseFloat(northStr)
  const east = Number.parseFloat(eastStr)

  const isInvalid =
    [south, west, north, east].some(value => Number.isNaN(value)) ||
    south < -90 ||
    south > 90 ||
    north < -90 ||
    north > 90 ||
    west < -180 ||
    west > 180 ||
    east < -180 ||
    east > 180 ||
    south >= north ||
    west >= east

  if (isInvalid) return null

  return { south, west, north, east }
}

