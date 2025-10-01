/* src/components/LocationPicker.tsx */
'use client'

import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { loadKakaoMaps, coordToAddress } from '@/lib/services/kakao'

// Kakao Maps 타입 정의
declare global {
  var kakao: any
}

interface LocationPickerProps {
  onLocationSelect: (location: { lat: number; lng: number; place_text: string }) => void
  onCancel?: () => void
  initialLocation?: { lat: number; lng: number }
  className?: string
}

export default function LocationPicker({
  onLocationSelect,
  onCancel,
  initialLocation = { lat: 37.5665, lng: 126.978 }, // 서울시청 기본값
  className = 'w-full h-96',
}: LocationPickerProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markerRef = useRef<any>(null)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<{
    lat: number
    lng: number
    place_text: string
  } | null>(null)

  // Kakao Maps SDK 로드
  useEffect(() => {
    loadKakaoMaps()
      .then(() => {
        setIsKakaoLoaded(true)
      })
      .catch(error => {
        console.error('Kakao Maps 로드 실패:', error)
      })
  }, [])

  // 지도 초기화
  useEffect(() => {
    if (!isKakaoLoaded || !mapContainerRef.current) return

    const { kakao } = window

    // Geocoder 서비스 사용 가능한지 확인
    if (!kakao.maps.services || !kakao.maps.services.Geocoder) {
      console.warn('Kakao Maps Geocoder service is not available')
      return
    }

    const mapOption = {
      center: new kakao.maps.LatLng(initialLocation.lat, initialLocation.lng),
      level: 3,
    }

    // 지도 생성
    const map = new kakao.maps.Map(mapContainerRef.current, mapOption)
    mapRef.current = map

    // 지도 클릭 이벤트
    kakao.maps.event.addListener(map, 'click', (mouseEvent: any) => {
      const latlng = mouseEvent.latLng
      const lat = latlng.getLat()
      const lng = latlng.getLng()

      // 기존 마커 제거
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }

      // 새 마커 생성
      const marker = new kakao.maps.Marker({
        position: latlng,
        map: map,
      })
      markerRef.current = marker

      // 주소 변환 시도
      coordToAddress(lat, lng)
        .then(address => {
          setSelectedLocation({
            lat,
            lng,
            place_text: address,
          })
        })
        .catch(error => {
          console.warn('주소 변환 실패:', error)
          // 주소 변환에 실패하면 좌표로 표시
          setSelectedLocation({
            lat,
            lng,
            place_text: `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`,
          })
        })
    })

    return () => {
      if (markerRef.current) {
        markerRef.current.setMap(null)
      }
    }
  }, [isKakaoLoaded, initialLocation])

  const handleConfirm = () => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation)
    }
  }

  const handleCurrentLocation = () => {
    if (!navigator.geolocation || !mapRef.current || !window.kakao) return

    navigator.geolocation.getCurrentPosition(
      position => {
        const { kakao } = window
        const lat = position.coords.latitude
        const lng = position.coords.longitude
        const moveLatLng = new kakao.maps.LatLng(lat, lng)

        // 지도 이동
        mapRef.current.panTo(moveLatLng)

        // 마커 생성
        if (markerRef.current) {
          markerRef.current.setMap(null)
        }

        const marker = new kakao.maps.Marker({
          position: moveLatLng,
          map: mapRef.current,
        })
        markerRef.current = marker

        // 주소 가져오기
        const geocoder = new kakao.maps.services.Geocoder()
        geocoder.coord2Address(lng, lat, (result: any, status: any) => {
          let place_text = `위도: ${lat.toFixed(6)}, 경도: ${lng.toFixed(6)}`

          if (status === kakao.maps.services.Status.OK && result[0]) {
            const addr = result[0].address
            if (addr) {
              place_text = addr.address_name || place_text
            }
          }

          setSelectedLocation({
            lat,
            lng,
            place_text,
          })
        })
      },
      error => {
        console.error('Geolocation error:', error)
        alert('현재 위치를 가져올 수 없습니다.')
      },
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  if (!isKakaoLoaded) {
    return (
      <div className={`${className} flex items-center justify-center rounded-lg bg-gray-100`}>
        <div className="text-center">
          <div className="border-primary mx-auto mb-2 h-8 w-8 animate-spin rounded-full border-4 border-t-transparent"></div>
          <p className="text-sm text-gray-600">지도를 로드하는 중...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* 안내 메시지 */}
      <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
        <h3 className="mb-2 font-medium text-blue-900">📍 모임 장소를 선택해주세요</h3>
        <p className="text-sm text-blue-800">
          지도를 클릭하여 모임 장소를 선택하고, 현재 위치 버튼으로 내 위치를 찾을 수 있습니다.
        </p>
      </div>

      {/* 지도 */}
      <div className="relative">
        <div
          ref={mapContainerRef}
          className={`${className} rounded-lg border border-gray-300 bg-gray-200`}
          style={{
            width: '100%',
            height: '400px',
            minHeight: '400px',
            position: 'relative',
          }}
        />

        {/* 현재 위치 버튼 */}
        <button
          onClick={handleCurrentLocation}
          className="absolute right-4 bottom-4 rounded-lg border border-gray-300 bg-white p-3 shadow-lg transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 min-h-[44px] min-w-[44px] flex items-center justify-center"
          title="현재 위치로 이동"
          aria-label="현재 위치로 지도 이동"
          aria-describedby="location-picker-btn-desc"
          type="button"
        >
          <svg
            className="h-5 w-5 text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
            role="img"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          {/* Hidden description for screen readers */}
          <span id="location-picker-btn-desc" className="sr-only">
            GPS를 사용하여 현재 위치를 찾고 위치 선택기에서 해당 위치로 이동합니다
          </span>
        </button>
      </div>

      {/* 선택된 위치 정보 */}
      {selectedLocation && (
        <div className="rounded-lg border border-green-200 bg-green-50 p-4">
          <h4 className="mb-2 font-medium text-green-900">✅ 선택된 위치</h4>
          <p className="mb-1 text-sm text-green-800">
            <strong>주소:</strong> {selectedLocation.place_text}
          </p>
          <p className="text-xs text-green-700">
            위도: {selectedLocation.lat.toFixed(6)}, 경도: {selectedLocation.lng.toFixed(6)}
          </p>
        </div>
      )}

      {/* 버튼 그룹 */}
      <div className="flex justify-end gap-2">
        {onCancel && (
          <Button type="button" variant="outline" onClick={onCancel}>
            취소
          </Button>
        )}
        <Button
          type="button"
          onClick={handleConfirm}
          disabled={!selectedLocation}
          className="bg-primary hover:bg-primary/90"
        >
          {selectedLocation ? '이 위치로 선택' : '위치를 선택해주세요'}
        </Button>
      </div>
    </div>
  )
}
