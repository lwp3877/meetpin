/* src/lib/bbox.ts */
// BBox (Bounding Box) 지리적 좌표 유틸리티

export interface BoundingBox {
  south: number // 남쪽 위도
  west: number  // 서쪽 경도
  north: number // 북쪽 위도
  east: number  // 동쪽 경도
}

export interface Point {
  lat: number
  lng: number
}

/**
 * bbox 쿼리 파라미터를 파싱 (?bbox=south,west,north,east)
 */
export function parseBBoxParam(bboxString: string | null): BoundingBox | null {
  if (!bboxString || typeof bboxString !== 'string') {
    return null
  }
  
  const parts = bboxString.split(',').map(s => s.trim())
  if (parts.length !== 4) {
    return null
  }
  
  const [southStr, westStr, northStr, eastStr] = parts
  const south = parseFloat(southStr)
  const west = parseFloat(westStr)
  const north = parseFloat(northStr)
  const east = parseFloat(eastStr)
  
  // 유효성 검사
  if (
    isNaN(south) || isNaN(west) || isNaN(north) || isNaN(east) ||
    south < -90 || south > 90 ||
    north < -90 || north > 90 ||
    west < -180 || west > 180 ||
    east < -180 || east > 180 ||
    south >= north ||
    west >= east
  ) {
    return null
  }
  
  return { south, west, north, east }
}

/**
 * BoundingBox를 쿼리 파라미터 문자열로 변환
 */
export function bboxToParam(bbox: BoundingBox): string {
  return `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`
}

/**
 * 좌표가 BoundingBox 안에 있는지 확인
 */
export function inBBox(point: Point, bbox: BoundingBox): boolean {
  return (
    point.lat >= bbox.south &&
    point.lat <= bbox.north &&
    point.lng >= bbox.west &&
    point.lng <= bbox.east
  )
}

/**
 * 두 BoundingBox가 겹치는지 확인
 */
export function bboxIntersects(bbox1: BoundingBox, bbox2: BoundingBox): boolean {
  return !(
    bbox1.east < bbox2.west ||
    bbox1.west > bbox2.east ||
    bbox1.north < bbox2.south ||
    bbox1.south > bbox2.north
  )
}

/**
 * BoundingBox의 중심점 계산
 */
export function bboxCenter(bbox: BoundingBox): Point {
  return {
    lat: (bbox.south + bbox.north) / 2,
    lng: (bbox.west + bbox.east) / 2,
  }
}

/**
 * 좌표 주변의 BoundingBox 생성 (km 단위 반경)
 */
export function createBBoxAroundPoint(
  point: Point, 
  radiusKm: number
): BoundingBox {
  // 위도 1도 ≈ 111km
  // 경도 1도는 위도에 따라 달라짐 (적도에서 111km, 극지방에서 0km)
  const latDelta = radiusKm / 111
  const lngDelta = radiusKm / (111 * Math.cos(point.lat * Math.PI / 180))
  
  return {
    south: Math.max(-90, point.lat - latDelta),
    north: Math.min(90, point.lat + latDelta),
    west: Math.max(-180, point.lng - lngDelta),
    east: Math.min(180, point.lng + lngDelta),
  }
}

/**
 * BoundingBox의 면적 계산 (평방 km)
 */
export function bboxArea(bbox: BoundingBox): number {
  const latDiff = bbox.north - bbox.south
  const lngDiff = bbox.east - bbox.west
  
  // 대략적인 계산 (정확하지 않음, 단순 추정용)
  const avgLat = (bbox.north + bbox.south) / 2
  const latKm = latDiff * 111
  const lngKm = lngDiff * 111 * Math.cos(avgLat * Math.PI / 180)
  
  return latKm * lngKm
}

/**
 * 한국 전체를 포함하는 기본 BoundingBox
 */
export const KOREA_BBOX: BoundingBox = {
  south: 33.0,  // 제주도 남쪽
  west: 124.5,  // 서해 끝
  north: 38.7,  // 북한 경계
  east: 132.0,  // 동해 끝
}

/**
 * 서울 시내 기본 BoundingBox
 */
export const SEOUL_BBOX: BoundingBox = {
  south: 37.42,  // 서울 남쪽
  west: 126.76,  // 서울 서쪽
  north: 37.70,  // 서울 북쪽
  east: 127.18,  // 서울 동쪽
}

/**
 * BoundingBox 유효성 검사
 */
export function isValidBBox(bbox: BoundingBox): boolean {
  return (
    typeof bbox.south === 'number' &&
    typeof bbox.west === 'number' &&
    typeof bbox.north === 'number' &&
    typeof bbox.east === 'number' &&
    bbox.south >= -90 && bbox.south <= 90 &&
    bbox.north >= -90 && bbox.north <= 90 &&
    bbox.west >= -180 && bbox.west <= 180 &&
    bbox.east >= -180 && bbox.east <= 180 &&
    bbox.south < bbox.north &&
    bbox.west < bbox.east
  )
}

/**
 * PostgreSQL용 BoundingBox 조건 생성
 */
export function createBBoxQuery(bbox: BoundingBox): {
  condition: string
  params: number[]
} {
  return {
    condition: 'lat BETWEEN $1 AND $2 AND lng BETWEEN $3 AND $4',
    params: [bbox.south, bbox.north, bbox.west, bbox.east]
  }
}

/**
 * 두 좌표 간의 거리 계산 (km)
 * Haversine 공식 사용
 */
export function calculateDistance(point1: Point, point2: Point): number {
  const R = 6371 // 지구 반지름 (km)
  
  const lat1Rad = point1.lat * Math.PI / 180
  const lat2Rad = point2.lat * Math.PI / 180
  const deltaLatRad = (point2.lat - point1.lat) * Math.PI / 180
  const deltaLngRad = (point2.lng - point1.lng) * Math.PI / 180
  
  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

// Export individual functions for named imports
export const parseBBox = parseBBoxParam
export const createBBoxFromBounds = createBBoxAroundPoint

export default {
  parse: parseBBoxParam,
  toParam: bboxToParam,
  inBBox,
  intersects: bboxIntersects,
  center: bboxCenter,
  around: createBBoxAroundPoint,
  area: bboxArea,
  isValid: isValidBBox,
  createQuery: createBBoxQuery,
  distance: calculateDistance,
  presets: {
    KOREA: KOREA_BBOX,
    SEOUL: SEOUL_BBOX,
  },
}