/* src/components/MapWithCluster.tsx */
'use client'

import { useEffect, useRef, useState, useCallback } from 'react'
import { brandColors, getCategoryDisplay } from '@/lib/config/brand'
import { loadKakaoMaps } from '@/lib/services/kakao'

// Kakao Maps 타입 정의
declare global {
  var kakao: any
}

interface Room {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  fee: number
  boost_until?: string
  profiles: {
    nickname: string
    avatar_url?: string
    age_range: string
  }
}

interface MapWithClusterProps {
  rooms: Room[]
  center?: { lat: number; lng: number }
  level?: number
  onBoundsChanged?: (bbox: { south: number; west: number; north: number; east: number }) => void
  onRoomClick?: (room: Room) => void
  selectedRoomId?: string
  className?: string
}

export default function MapWithCluster({
  rooms,
  center = { lat: 37.5665, lng: 126.978 }, // 서울시청 기본값
  level = 3,
  onBoundsChanged,
  onRoomClick,
  selectedRoomId,
  className = 'w-full h-96',
}: MapWithClusterProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<any>(null)
  const markersRef = useRef<any[]>([])
  const clustererRef = useRef<any>(null)
  const infoWindowRef = useRef<any>(null)
  const [isKakaoLoaded, setIsKakaoLoaded] = useState(false)

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

    const mapOption = {
      center: new kakao.maps.LatLng(center.lat, center.lng),
      level: level,
      draggable: true, // 드래그 가능
      scrollwheel: true, // 휠 줌 가능
      disableDoubleClick: false, // 더블클릭 줌 가능
      keyboardShortcuts: true, // 키보드 단축키 활성화
    }

    // 지도 생성
    const map = new kakao.maps.Map(mapContainerRef.current, mapOption)
    mapRef.current = map

    // 지도 컨트롤 추가
    const mapTypeControl = new kakao.maps.MapTypeControl()
    map.addControl(mapTypeControl, kakao.maps.ControlPosition.TOPRIGHT)

    const zoomControl = new kakao.maps.ZoomControl()
    map.addControl(zoomControl, kakao.maps.ControlPosition.RIGHT)

    // 클러스터러 생성
    const clusterer = new kakao.maps.MarkerClusterer({
      map: map,
      averageCenter: true,
      minLevel: 2,
      disableClickZoom: false, // 클러스터 클릭 줌 활성화
      styles: [
        {
          width: '40px',
          height: '40px',
          background: brandColors.primary,
          borderRadius: '20px',
          color: '#fff',
          textAlign: 'center',
          fontWeight: 'bold',
          lineHeight: '40px',
          fontSize: '12px',
        },
      ],
    })
    clustererRef.current = clusterer

    // 정보창 생성 (재사용)
    const infoWindow = new kakao.maps.InfoWindow({
      removable: true,
    })
    infoWindowRef.current = infoWindow

    // 지도 경계 변경 이벤트 (디바운싱 추가)
    if (onBoundsChanged) {
      let boundsChangeTimeout: NodeJS.Timeout

      const handleBoundsChange = () => {
        clearTimeout(boundsChangeTimeout)
        boundsChangeTimeout = setTimeout(() => {
          const bounds = map.getBounds()
          const southwest = bounds.getSouthWest()
          const northeast = bounds.getNorthEast()

          const bbox = {
            south: southwest.getLat(),
            west: southwest.getLng(),
            north: northeast.getLat(),
            east: northeast.getLng(),
          }

          // bbox 유효성 검사: south < north && west < east
          // 그리고 최소 크기를 가져야 함 (0.001도 = 약 100m)
          const minSize = 0.001
          if (
            bbox.south < bbox.north &&
            bbox.west < bbox.east &&
            bbox.north - bbox.south > minSize &&
            bbox.east - bbox.west > minSize
          ) {
            onBoundsChanged(bbox)
          }
        }, 300) // 300ms 디바운싱
      }

      // 드래그가 끝났을 때만 이벤트 발생
      kakao.maps.event.addListener(map, 'dragend', handleBoundsChange)
      kakao.maps.event.addListener(map, 'zoom_changed', handleBoundsChange)
    }

    return () => {
      if (clustererRef.current) {
        clustererRef.current.clear()
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close()
      }
    }
  }, [isKakaoLoaded, center.lat, center.lng, level, onBoundsChanged]) // 모든 의존성 추가

  // center나 level이 변경되었을 때만 지도 이동
  useEffect(() => {
    if (!mapRef.current || !window.kakao) return

    const { kakao } = window
    const currentCenter = mapRef.current.getCenter()
    const currentLevel = mapRef.current.getLevel()

    // center가 변경되었을 때만 이동
    if (
      Math.abs(currentCenter.getLat() - center.lat) > 0.001 ||
      Math.abs(currentCenter.getLng() - center.lng) > 0.001
    ) {
      const newCenter = new kakao.maps.LatLng(center.lat, center.lng)
      mapRef.current.panTo(newCenter)
    }

    // level이 변경되었을 때만 줌 조정
    if (currentLevel !== level) {
      mapRef.current.setLevel(level)
    }
  }, [center.lat, center.lng, level])

  // 마커 생성 및 업데이트
  const updateMarkers = useCallback(() => {
    if (!mapRef.current || !clustererRef.current || !window.kakao) return

    const { kakao } = window

    // 기존 마커 제거
    clustererRef.current.clear()
    markersRef.current = []

    // 새 마커 생성
    const newMarkers = rooms.map(room => {
      const categoryDisplay = getCategoryDisplay(room.category)
      const isSelected = selectedRoomId === room.id
      const isBoosted = room.boost_until && new Date(room.boost_until) > new Date()

      // 마커 이미지 생성 (btoa 대신 encodeURIComponent 사용)
      const svgContent = `
        <svg width="32" height="40" viewBox="0 0 32 40" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M16 0C7.164 0 0 7.164 0 16C0 24.836 16 40 16 40S32 24.836 32 16C32 7.164 24.836 0 16 0Z" 
                fill="${isSelected ? brandColors.accent : isBoosted ? brandColors.boost : categoryDisplay.color}"/>
          <circle cx="16" cy="16" r="8" fill="white"/>
          <text x="16" y="20" text-anchor="middle" font-size="12" fill="${isSelected ? brandColors.accent : isBoosted ? brandColors.boost : categoryDisplay.color}">
            ${categoryDisplay.emoji}
          </text>
        </svg>
      `
      const markerImageSrc = `data:image/svg+xml,${encodeURIComponent(svgContent)}`

      const markerImage = new kakao.maps.MarkerImage(markerImageSrc, new kakao.maps.Size(32, 40), {
        offset: new kakao.maps.Point(16, 40),
      })

      // 마커 생성
      const marker = new kakao.maps.Marker({
        position: new kakao.maps.LatLng(room.lat, room.lng),
        image: markerImage,
        clickable: true,
      })

      // 마커 클릭 이벤트
      kakao.maps.event.addListener(marker, 'click', () => {
        if (onRoomClick) {
          onRoomClick(room)
        }

        // 정보창 내용 생성
        const infoContent = `
          <div style="padding: 10px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, sans-serif;">
            <div style="display: flex; align-items: center; margin-bottom: 8px;">
              <span style="font-size: 16px; margin-right: 6px;">${categoryDisplay.emoji}</span>
              <strong style="font-size: 14px; color: #111827;">${room.title}</strong>
              ${isBoosted ? '<span style="background: ' + brandColors.boost + '; color: white; padding: 2px 6px; border-radius: 4px; font-size: 10px; margin-left: 6px;">부스트</span>' : ''}
            </div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
              📍 ${room.place_text}
            </div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 4px;">
              🕐 ${new Date(room.start_at).toLocaleDateString('ko-KR')} ${new Date(room.start_at).toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })}
            </div>
            <div style="font-size: 12px; color: #6B7280; margin-bottom: 8px;">
              👥 최대 ${room.max_people}명 ${room.fee > 0 ? `· 💰 ${room.fee.toLocaleString()}원` : '· 🆓 무료'}
            </div>
            <div style="display: flex; align-items: center;">
              ${
                room.profiles.avatar_url
                  ? `<img src="${room.profiles.avatar_url}" style="width: 20px; height: 20px; border-radius: 50%; margin-right: 6px;" />`
                  : '<div style="width: 20px; height: 20px; border-radius: 50%; background: #E5E7EB; margin-right: 6px;"></div>'
              }
              <span style="font-size: 12px; color: #374151;">
                ${room.profiles.nickname} · ${room.profiles.age_range}
              </span>
            </div>
          </div>
        `

        infoWindowRef.current.setContent(infoContent)
        infoWindowRef.current.open(mapRef.current, marker)
      })

      return marker
    })

    // 클러스터러에 마커 추가
    clustererRef.current.addMarkers(newMarkers)
    markersRef.current = newMarkers
  }, [rooms, selectedRoomId, onRoomClick])

  // 마커 업데이트
  useEffect(() => {
    updateMarkers()
  }, [updateMarkers])

  // 선택된 방으로 지도 이동
  useEffect(() => {
    if (!selectedRoomId || !mapRef.current || !window.kakao) return

    const selectedRoom = rooms.find(room => room.id === selectedRoomId)
    if (!selectedRoom) return

    const { kakao } = window
    const moveLatLng = new kakao.maps.LatLng(selectedRoom.lat, selectedRoom.lng)
    mapRef.current.panTo(moveLatLng)
  }, [selectedRoomId, rooms])

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
    <div className="relative h-full w-full">
      <div
        ref={mapContainerRef}
        data-testid="map-container"
        className={`${className} bg-gray-200`}
        style={{
          width: '100%',
          height: '100%',
          minHeight: '400px',
          position: 'relative',
        }}
      />

      {/* 지도 컨트롤 */}
      <div className="absolute top-4 left-4 rounded-lg bg-white p-2 shadow-lg">
        <div className="mb-1 text-xs text-gray-600">카테고리</div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: brandColors.categoryDrink }}
            ></div>
            <span className="text-xs">🍻 술</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: brandColors.categoryExercise }}
            ></div>
            <span className="text-xs">💪 운동</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: brandColors.categoryOther }}
            ></div>
            <span className="text-xs">✨ 기타</span>
          </div>
          <div className="flex items-center gap-1">
            <div
              className="h-3 w-3 rounded-full"
              style={{ backgroundColor: brandColors.boost }}
            ></div>
            <span className="text-xs">⭐ 부스트</span>
          </div>
        </div>
      </div>

      {/* 방 개수 표시 */}
      {rooms.length > 0 && (
        <div className="absolute top-4 right-4 rounded-lg bg-white px-3 py-2 shadow-lg">
          <span className="text-sm font-medium text-gray-900">총 {rooms.length}개 모임</span>
        </div>
      )}

      {/* 현재 위치 버튼 */}
      <button
        className="absolute right-4 bottom-4 rounded-lg bg-white p-3 shadow-lg transition-colors hover:bg-gray-50"
        onClick={() => {
          if (!navigator.geolocation || !mapRef.current || !window.kakao) return

          navigator.geolocation.getCurrentPosition(
            position => {
              const { kakao } = window
              const lat = position.coords.latitude
              const lng = position.coords.longitude
              const moveLatLng = new kakao.maps.LatLng(lat, lng)
              mapRef.current.panTo(moveLatLng)
            },
            error => {
              console.error('Geolocation error:', error)
              alert('현재 위치를 가져올 수 없습니다.')
            },
            { enableHighAccuracy: true, timeout: 10000 }
          )
        }}
        title="현재 위치로 이동"
      >
        <svg
          className="h-5 w-5 text-gray-600"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
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
      </button>
    </div>
  )
}
