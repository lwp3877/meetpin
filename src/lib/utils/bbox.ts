/* src/lib/utils/bbox.ts */
// 최소한의 BBox 유틸리티만 유지해 테스트와 API에서 사용하는 기능에 집중합니다.

export interface BoundingBox {
  south: number
  west: number
  north: number
  east: number
}

export interface Point {
  lat: number
  lng: number
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

/**
 * 대한민국 전체를 커버하는 기본 영역.
 */
export const KOREA_BBOX: BoundingBox = {
  south: 33.0,
  west: 124.5,
  north: 38.7,
  east: 132.0,
}

/**
 * 서울 도심을 감싸는 기본 영역.
 */
export const SEOUL_BBOX: BoundingBox = {
  south: 37.42,
  west: 126.76,
  north: 37.7,
  east: 127.18,
}

/**
 * BoundingBox 유효성 검증.
 */
export function isValidBBox(bbox: BoundingBox): boolean {
  return (
    typeof bbox.south === 'number' &&
    typeof bbox.west === 'number' &&
    typeof bbox.north === 'number' &&
    typeof bbox.east === 'number' &&
    bbox.south >= -90 &&
    bbox.south <= 90 &&
    bbox.north >= -90 &&
    bbox.north <= 90 &&
    bbox.west >= -180 &&
    bbox.west <= 180 &&
    bbox.east >= -180 &&
    bbox.east <= 180 &&
    bbox.south < bbox.north &&
    bbox.west < bbox.east
  )
}

/**
 * 두 좌표 간의 거리를 km 단위로 계산합니다. (Haversine 공식)
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371 // 지구 반지름(km)

  const lat1Rad = (point1.lat * Math.PI) / 180
  const lat2Rad = (point2.lat * Math.PI) / 180
  const deltaLatRad = ((point2.lat - point1.lat) * Math.PI) / 180
  const deltaLngRad = ((point2.lng - point1.lng) * Math.PI) / 180

  const a =
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

  return R * c
}
