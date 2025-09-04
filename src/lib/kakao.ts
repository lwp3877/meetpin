/* src/lib/kakao.ts */

// Kakao Maps API 관련 타입과 유틸리티

// 기본 타입 정의

// Kakao Maps API 전역 변수 타입 정의
declare global {
  var kakao: any
}

/**
 * Kakao Maps API가 로드되었는지 확인
 */
export function isKakaoMapsLoaded(): boolean {
  return typeof kakao !== 'undefined' && kakao.maps
}

// 전역 로딩 상태 관리
let loadPromise: Promise<void> | null = null

/**
 * Kakao Maps API를 동적으로 로드 (전역 상태 관리)
 */
export function loadKakaoMaps(apiKey?: string): Promise<void> {
  // 이미 로드된 경우
  if (isKakaoMapsLoaded()) {
    return Promise.resolve()
  }

  // 이미 로딩 중인 경우
  if (loadPromise) {
    return loadPromise
  }

  // API 키 확인 (프로덕션에서 하드코딩된 키 사용)
  const key = apiKey || process.env.NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY || '11764377687ae8ad3d8decc7ac0078d5'
  if (!key) {
    return Promise.reject(new Error('Kakao Maps API 키가 설정되지 않았습니다'))
  }

  // 로딩 시작
  loadPromise = new Promise((resolve, reject) => {
    // 이미 kakao 객체가 있는 경우
    if (typeof kakao !== 'undefined' && kakao.maps) {
      kakao.maps.load(() => {
        resolve()
      })
      return
    }

    // 스크립트 동적 로드 (services와 clusterer 라이브러리 모두 포함)
    const script = document.createElement('script')
    script.type = 'text/javascript'
    script.src = `https://dapi.kakao.com/v2/maps/sdk.js?appkey=${key}&libraries=services,clusterer&autoload=false`
    
    script.onload = () => {
      if (window.kakao && window.kakao.maps) {
        window.kakao.maps.load(() => {
          resolve()
        })
      } else {
        reject(new Error('Kakao Maps API 로드 실패'))
      }
    }
    
    script.onerror = () => {
      reject(new Error('Kakao Maps API 스크립트 로드 실패'))
    }
    
    document.head.appendChild(script)
  })

  return loadPromise
}

/**
 * 좌표를 주소로 변환
 */
export function coordToAddress(lat: number, lng: number): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!isKakaoMapsLoaded()) {
      reject(new Error('Kakao Maps API가 로드되지 않았습니다'))
      return
    }

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.coord2Address(lng, lat, (results: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK) {
        const address = results[0]?.address
        if (address) {
          resolve(address.address_name || address.region_3depth_name || '주소 불명')
        } else {
          resolve('주소를 찾을 수 없습니다')
        }
      } else {
        reject(new Error('주소 변환에 실패했습니다'))
      }
    })
  })
}

/**
 * 주소를 좌표로 변환
 */
export function addressToCoord(address: string): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!isKakaoMapsLoaded()) {
      reject(new Error('Kakao Maps API가 로드되지 않았습니다'))
      return
    }

    const geocoder = new kakao.maps.services.Geocoder()
    geocoder.addressSearch(address, (results: any[], status: string) => {
      if (status === kakao.maps.services.Status.OK && results.length > 0) {
        const result = results[0]
        resolve({
          lat: parseFloat(result.y),
          lng: parseFloat(result.x),
        })
      } else {
        reject(new Error('좌표 변환에 실패했습니다'))
      }
    })
  })
}

/**
 * 현재 위치 가져오기 (브라우저 Geolocation API 사용)
 */
export function getCurrentPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('위치 서비스가 지원되지 않습니다'))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
      },
      (error) => {
        switch (error.code) {
          case error.PERMISSION_DENIED:
            reject(new Error('위치 권한이 거부되었습니다'))
            break
          case error.POSITION_UNAVAILABLE:
            reject(new Error('위치 정보를 사용할 수 없습니다'))
            break
          case error.TIMEOUT:
            reject(new Error('위치 요청 시간이 초과되었습니다'))
            break
          default:
            reject(new Error('알 수 없는 오류가 발생했습니다'))
        }
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
 * 서울의 기본 좌표
 */
export const SEOUL_CENTER = {
  lat: 37.5665,
  lng: 126.9780,
}

/**
 * 기본 지도 옵션
 */
export const DEFAULT_MAP_OPTIONS = {
  center: SEOUL_CENTER,
  level: 3,
}

const kakaoUtils = {
  isLoaded: isKakaoMapsLoaded,
  load: loadKakaoMaps,
  coordToAddress,
  addressToCoord,
  getCurrentPosition,
  SEOUL_CENTER,
  DEFAULT_MAP_OPTIONS,
}

export default kakaoUtils