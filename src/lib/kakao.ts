/* src/lib/kakao.ts */
// 카카오 SDK 로더 및 지도 유틸리티 (autoload=false)

interface KakaoMapOptions {
  center: {
    lat: number
    lng: number
  }
  level?: number
}

interface KakaoLatLng {
  getLat(): number
  getLng(): number
}

interface KakaoMap {
  setCenter(latlng: any): void
  getCenter(): KakaoLatLng
  setLevel(level: number): void
  getLevel(): number
  setBounds(bounds: any): void
  getBounds(): any
}

interface KakaoMapEvent {
  getLatLng(): KakaoLatLng
}

// Kakao Maps API 전역 변수 타입 정의
declare global {
  interface Window {
    kakao?: {
      maps: {
        load: (callback: () => void) => void
        LatLng: new (lat: number, lng: number) => KakaoLatLng
        Map: new (container: HTMLElement, options: KakaoMapOptions) => KakaoMap
        event: {
          addListener: (target: any, type: string, handler: (e: any) => void) => void
          removeListener: (target: any, type: string, handler: (e: any) => void) => void
        }
        Marker: new (options: {
          position: KakaoLatLng
          map?: KakaoMap
          title?: string
          image?: any
          clickable?: boolean
        }) => {
          setMap(map: KakaoMap | null): void
          getPosition(): KakaoLatLng
          setPosition(position: KakaoLatLng): void
          setTitle(title: string): void
        }
        InfoWindow: new (options: {
          content: string
          removable?: boolean
          zIndex?: number
        }) => {
          open(map: KakaoMap, marker: any): void
          close(): void
        }
        MarkerImage: new (src: string, size: any, options?: any) => any
        Size: new (width: number, height: number) => any
        MarkerClusterer: new (options: {
          map: KakaoMap
          averageCenter?: boolean
          minLevel?: number
          disableClickZoom?: boolean
          styles?: any[]
        }) => {
          addMarkers(markers: any[]): void
          removeMarkers(markers: any[]): void
          clear(): void
        }
        services: {
          Geocoder: new () => {
            addressSearch: (address: string, callback: (results: any[], status: string) => void) => void
            coord2Address: (lng: number, lat: number, callback: (results: any[], status: string) => void) => void
          }
          Status: {
            OK: string
            ZERO_RESULT: string
            ERROR: string
          }
        }
      }
    }
    daum?: any // 구 다음 지도 API 호환성
  }
}

let isKakaoLoaded = false
let isKakaoLoading = false
let loadPromise: Promise<void> | null = null

/**
 * 카카오 지도 SDK 로드
 */
export function loadKakaoMapSDK(): Promise<void> {
  // 이미 로드된 경우
  if (isKakaoLoaded && window.kakao?.maps) {
    return Promise.resolve()
  }
  
  // 이미 로딩 중인 경우
  if (isKakaoLoading && loadPromise) {
    return loadPromise
  }
  
  isKakaoLoading = true
  
  loadPromise = new Promise((resolve, reject) => {
    // 스크립트 태그 생성
    const script = document.createElement('script')
    script.type = 'text/javascript'
    
    const kakaoKey = process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
    if (!kakaoKey) {
      reject(new Error('NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY가 설정되지 않았습니다'))
      return
    }
    
    // autoload=false, libraries 설정
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${kakaoKey}&autoload=false&libraries=services,clusterer`
    
    script.onload = () => {
      // kakao.maps.load()로 초기화
      if (window.kakao?.maps?.load) {
        window.kakao.maps.load(() => {
          isKakaoLoaded = true
          isKakaoLoading = false
          resolve()
        })
      } else {
        reject(new Error('카카오 지도 SDK 로드에 실패했습니다'))
      }
    }
    
    script.onerror = () => {
      isKakaoLoading = false
      reject(new Error('카카오 지도 스크립트 로드에 실패했습니다'))
    }
    
    document.head.appendChild(script)
  })
  
  return loadPromise
}

/**
 * 지도 생성
 */
export async function createKakaoMap(
  containerId: string,
  options: KakaoMapOptions
): Promise<KakaoMap> {
  await loadKakaoMapSDK()
  
  const container = document.getElementById(containerId)
  if (!container) {
    throw new Error(`지도 컨테이너를 찾을 수 없습니다: ${containerId}`)
  }
  
  if (!window.kakao?.maps) {
    throw new Error('카카오 지도 API가 로드되지 않았습니다')
  }
  
  const mapOptions: KakaoMapOptions = {
    center: { lat: options.center.lat, lng: options.center.lng },
    level: options.level || 3,
  }
  
  return new window.kakao.maps.Map(container, mapOptions)
}

/**
 * 마커 생성
 */
export async function createMarker(
  position: { lat: number; lng: number },
  options: {
    map?: KakaoMap
    title?: string
    image?: {
      src: string
      width: number
      height: number
    }
    clickable?: boolean
  } = {}
): Promise<any> {
  await loadKakaoMapSDK()
  
  if (!window.kakao?.maps) {
    throw new Error('카카오 지도 API가 로드되지 않았습니다')
  }
  
  const kakaoPosition = new window.kakao.maps.LatLng(position.lat, position.lng)
  
  const markerOptions: any = {
    position: kakaoPosition,
    title: options.title,
    clickable: options.clickable ?? true,
  }
  
  if (options.map) {
    markerOptions.map = options.map
  }
  
  if (options.image) {
    const imageSize = new window.kakao.maps.Size(options.image.width, options.image.height)
    markerOptions.image = new window.kakao.maps.MarkerImage(options.image.src, imageSize)
  }
  
  return new window.kakao.maps.Marker(markerOptions)
}

/**
 * 마커 클러스터러 생성
 */
export async function createMarkerClusterer(
  map: KakaoMap,
  options: {
    averageCenter?: boolean
    minLevel?: number
    disableClickZoom?: boolean
  } = {}
): Promise<any> {
  await loadKakaoMapSDK()
  
  if (!window.kakao?.maps) {
    throw new Error('카카오 지도 API가 로드되지 않았습니다')
  }
  
  const clustererOptions = {
    map,
    averageCenter: options.averageCenter ?? true,
    minLevel: options.minLevel ?? 10,
    disableClickZoom: options.disableClickZoom ?? false,
  }
  
  return new window.kakao.maps.MarkerClusterer(clustererOptions)
}

/**
 * 주소 검색 (지오코딩)
 */
export async function searchAddress(address: string): Promise<{
  lat: number
  lng: number
  address_name: string
} | null> {
  await loadKakaoMapSDK()
  
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) {
      resolve(null)
      return
    }
    
    const geocoder = new window.kakao.maps.services.Geocoder()
    
    geocoder.addressSearch(address, (results: any[], status: string) => {
      if (window.kakao?.maps?.services && status === window.kakao.maps.services.Status.OK && results.length > 0) {
        const result = results[0]
        resolve({
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
          address_name: result.address_name,
        })
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * 좌표로 주소 검색 (역지오코딩)
 */
export async function getAddressFromCoords(lat: number, lng: number): Promise<{
  address: string
  roadAddress?: string
} | null> {
  await loadKakaoMapSDK()
  
  return new Promise((resolve) => {
    if (!window.kakao?.maps?.services) {
      resolve(null)
      return
    }
    
    const geocoder = new window.kakao.maps.services.Geocoder()
    
    geocoder.coord2Address(lng, lat, (results: any[], status: string) => {
      if (window.kakao?.maps?.services && status === window.kakao.maps.services.Status.OK && results.length > 0) {
        const result = results[0]
        resolve({
          address: result.address?.address_name || '',
          roadAddress: result.road_address?.address_name,
        })
      } else {
        resolve(null)
      }
    })
  })
}

/**
 * 지도 이벤트 리스너 추가
 */
export function addMapEventListener(
  map: KakaoMap,
  eventType: string,
  handler: (event: any) => void
): void {
  if (window.kakao?.maps?.event) {
    window.kakao.maps.event.addListener(map, eventType, handler)
  }
}

/**
 * 지도 이벤트 리스너 제거
 */
export function removeMapEventListener(
  map: KakaoMap,
  eventType: string,
  handler: (event: any) => void
): void {
  if (window.kakao?.maps?.event) {
    window.kakao.maps.event.removeListener(map, eventType, handler)
  }
}

/**
 * 현재 위치 가져오기
 */
export function getCurrentPosition(): Promise<{
  lat: number
  lng: number
} | null> {
  return new Promise((resolve) => {
    if (!navigator.geolocation) {
      resolve(null)
      return
    }
    
    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      () => {
        resolve(null)
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5분
      }
    )
  })
}

/**
 * 디바운스 유틸리티 (지도 이벤트용)
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * 카테고리별 마커 이미지 설정
 */
export const markerImages = {
  drink: {
    src: '/images/markers/drink.png',
    width: 32,
    height: 32,
  },
  exercise: {
    src: '/images/markers/exercise.png',
    width: 32,
    height: 32,
  },
  other: {
    src: '/images/markers/other.png',
    width: 32,
    height: 32,
  },
  selected: {
    src: '/images/markers/selected.png',
    width: 40,
    height: 40,
  },
} as const

/**
 * 거리 계산 (Haversine 공식)
 */
export function calculateDistance(
  pos1: { lat: number; lng: number },
  pos2: { lat: number; lng: number }
): number {
  const R = 6371 // 지구 반지름 (km)
  
  const lat1Rad = pos1.lat * Math.PI / 180
  const lat2Rad = pos2.lat * Math.PI / 180
  const deltaLatRad = (pos2.lat - pos1.lat) * Math.PI / 180
  const deltaLngRad = (pos2.lng - pos1.lng) * Math.PI / 180
  
  const a = 
    Math.sin(deltaLatRad / 2) * Math.sin(deltaLatRad / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) *
    Math.sin(deltaLngRad / 2) * Math.sin(deltaLngRad / 2)
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  
  return R * c
}

export default {
  loadSDK: loadKakaoMapSDK,
  createMap: createKakaoMap,
  createMarker,
  createClusterer: createMarkerClusterer,
  searchAddress,
  getAddressFromCoords,
  addEventListener: addMapEventListener,
  removeEventListener: removeMapEventListener,
  getCurrentPosition,
  debounce,
  calculateDistance,
  markerImages,
}