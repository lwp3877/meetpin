/**
 * src/hooks/useMapRooms.ts — 지도 화면 방 목록 로직
 *
 * map/page.tsx에서 방 관련 동작만 분리한 훅입니다.
 * 페이지 파일은 UI 상태와 JSX만 담당하고,
 * 방 로딩·필터링·위치 검색·지도 바운더리 처리는 여기서 합니다.
 */

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { debounce } from '@/lib/utils'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

// ───────────────────────────────────────────────
// 타입 정의
// ───────────────────────────────────────────────

export interface Room {
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

export type BBox = {
  south: number
  west: number
  north: number
  east: number
} | null

export interface RoomFilters {
  selectedCategory: string
  searchQuery: string
  priceRange: number[]
  maxPeople: number[]
  timeFilter: string
}

// ───────────────────────────────────────────────
// 상수
// ───────────────────────────────────────────────

// 서울 전체 기본 영역 (처음 로드 시 사용)
const DEFAULT_BOUNDS = {
  south: 37.4563,
  west: 126.8226,
  north: 37.6761,
  east: 127.1836,
}

// ───────────────────────────────────────────────
// 훅
// ───────────────────────────────────────────────

export function useMapRooms(filters: RoomFilters) {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 방 목록 불러오기 (재시도 포함)
  const loadRooms = useCallback(
    async (bbox?: BBox, retryCount = 0) => {
      const MAX_RETRIES = 3
      const RETRY_DELAY = 1000

      try {
        setIsLoading(true)
        setError(null)

        const bounds = bbox || DEFAULT_BOUNDS
        const bboxParam = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`

        let url = `/api/rooms?bbox=${bboxParam}&limit=100`
        if (filters.selectedCategory !== 'all') {
          url += `&category=${filters.selectedCategory}`
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

        const response = await fetch(url, {
          signal: controller.signal,
          headers: { 'Content-Type': 'application/json' },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status >= 500 && retryCount < MAX_RETRIES) {
            await new Promise(resolve => setTimeout(resolve, RETRY_DELAY * (retryCount + 1)))
            return loadRooms(bbox, retryCount + 1)
          }
          throw new Error(`서버 오류 (${response.status}): 모임을 불러올 수 없습니다`)
        }

        const result = await response.json()

        if (!result.ok) {
          throw new Error(result.message || '방 목록을 불러올 수 없습니다')
        }

        setRooms(result.data.rooms || [])
      } catch (err: unknown) {
        logger.error('Rooms load error:', {
          error: err instanceof Error ? err.message : String(err),
        })

        if ((err as Error).name === 'AbortError') {
          setError('요청 시간이 초과되었습니다')
          toast.error('네트워크가 느려 요청이 취소되었습니다. 다시 시도해주세요')
        } else if ((err as Error).message?.includes('fetch')) {
          setError('인터넷 연결을 확인해주세요')
          toast.error('인터넷 연결이 불안정합니다. 연결을 확인하고 다시 시도해주세요')
        } else {
          setError((err as Error).message || '알 수 없는 오류가 발생했습니다')
          toast.error(
            retryCount >= MAX_RETRIES
              ? '모임을 불러오는데 계속 실패했습니다. 잠시 후 다시 시도해주세요'
              : '모임을 불러오는 중 오류가 발생했습니다'
          )
        }
      } finally {
        setIsLoading(false)
      }
    },
    [filters.selectedCategory]
  )

  // 지도 이동 시 너무 자주 호출되지 않도록 500ms 딜레이
  const debouncedLoadRooms = useMemo(
    () =>
      debounce((bbox: BBox) => {
        if (bbox) loadRooms(bbox)
      }, 500),
    [loadRooms]
  )

  // 지도 영역 변경 핸들러 (유효한 바운더리일 때만 동작)
  const handleBoundsChanged = useCallback(
    (bbox: BBox) => {
      if (bbox && bbox.south < bbox.north && bbox.west < bbox.east) {
        debouncedLoadRooms(bbox)
      }
    },
    [debouncedLoadRooms]
  )

  // 방 클릭 → 상세 페이지 이동
  const handleRoomClick = useCallback(
    (room: Room) => {
      router.push(`/room/${room.id}`)
    },
    [router]
  )

  // 내 주변 버튼: 현재 GPS 위치 기준으로 1km 반경 검색
  const handleNearMe = useCallback(async () => {
    if (!navigator.geolocation) {
      toast.error('이 브라우저는 위치 서비스를 지원하지 않습니다')
      return
    }

    toast.loading('현재 위치를 확인하는 중...', { id: 'location-loading' })

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 300000, // 5분 캐시
        })
      })

      const { latitude, longitude } = position.coords
      const margin = 0.01 // 약 1km
      const bounds = {
        south: latitude - margin,
        west: longitude - margin,
        north: latitude + margin,
        east: longitude + margin,
      }

      await loadRooms(bounds)
      toast.success('내 주변 모임을 찾았습니다', { id: 'location-loading' })
    } catch (err: unknown) {
      logger.error('Location error:', {
        error: err instanceof Error ? err.message : String(err),
      })
      toast.dismiss('location-loading')

      const code = (err as GeolocationPositionError).code
      if (code === 1) {
        toast.error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요', {
          duration: 5000,
        })
      } else if (code === 2) {
        toast.error('위치를 찾을 수 없습니다. 인터넷 연결과 GPS를 확인해주세요')
      } else if (code === 3) {
        toast.error('위치 요청 시간이 초과되었습니다. 다시 시도해주세요')
      } else {
        toast.error('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요')
      }
    }
  }, [loadRooms])

  // 클라이언트 사이드 필터링 (API에서 받은 전체 방 목록을 필터 조건으로 줄임)
  const filteredRooms = useMemo(
    () =>
      rooms.filter(room => {
        // 카테고리
        if (filters.selectedCategory !== 'all' && room.category !== filters.selectedCategory)
          return false

        // 검색어 (제목 또는 장소)
        if (
          filters.searchQuery &&
          !room.title?.toLowerCase().includes(filters.searchQuery.toLowerCase()) &&
          !room.place_text?.toLowerCase().includes(filters.searchQuery.toLowerCase())
        )
          return false

        // 가격
        if (room.fee > filters.priceRange[0]) return false

        // 최대 인원
        if (room.max_people > filters.maxPeople[0]) return false

        // 시간
        const roomDate = new Date(room.start_at)
        const today = new Date()
        const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
        const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

        switch (filters.timeFilter) {
          case 'today':
            if (roomDate.toDateString() !== today.toDateString()) return false
            break
          case 'tomorrow':
            if (roomDate.toDateString() !== tomorrow.toDateString()) return false
            break
          case 'week':
            if (roomDate > weekEnd) return false
            break
        }

        return true
      }),
    [rooms, filters]
  )

  // 첫 로드
  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  // 방이 없는 상태: API는 성공했지만 이 지역에 방이 하나도 없음
  const isEmpty = !isLoading && !error && rooms.length === 0

  return {
    rooms,
    filteredRooms,
    isLoading,
    error,
    isEmpty,
    loadRooms,
    handleBoundsChanged,
    handleRoomClick,
    handleNearMe,
  }
}
