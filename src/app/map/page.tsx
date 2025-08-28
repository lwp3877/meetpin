/* src/app/map/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { brandMessages } from '@/lib/brand'
import EnhancedButton, { ButtonPresets } from '@/components/ui/EnhancedButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import PageTransition from '@/components/ui/PageTransition'
import Toast from '@/components/ui/Toast'
import { OnboardingTrigger } from '@/components/ui/Onboarding'
import { HelpCenter } from '@/components/ui/UserGuide'
import { ReferralFloatingButton } from '@/components/ui/ReferralSystem'
import MapWithCluster from '@/components/MapWithCluster'
import { debounce } from '@/lib/debounce'

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

export default function MapPage() {
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  
  // BBox 타입 정의
  type BBox = {
    south: number
    west: number
    north: number
    east: number
  } | null
  
  const [currentBounds, setCurrentBounds] = useState<BBox>(null)

  // 서울 기본 영역
  const DEFAULT_BOUNDS = {
    south: 37.4563,
    west: 126.8226,
    north: 37.6761,
    east: 127.1836,
  }

  // 방 목록 로드
  const loadRooms = useCallback(async (bbox?: BBox) => {
    try {
      setIsLoading(true)
      setError(null)

      const bounds = bbox || DEFAULT_BOUNDS
      const bboxParam = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`
      
      let url = `/api/rooms?bbox=${bboxParam}&limit=100`
      if (selectedCategory !== 'all') {
        url += `&category=${selectedCategory}`
      }

      const response = await fetch(url)
      const result = await response.json()

      if (!result.ok) {
        throw new Error(result.message || '방 목록을 불러올 수 없습니다')
      }

      setRooms(result.data.rooms || [])
      if (result.data.rooms?.length === 0) {
        Toast.info('이 지역에는 아직 모임이 없습니다')
      }
    } catch (err: any) {
      console.error('Rooms load error:', err)
      setError(err.message)
      Toast.error('모임을 불러오는 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  // 지도 영역 변경 시 방 목록 업데이트 (debounced)
  const debouncedLoadRooms = useCallback(
    (bbox: BBox) => {
      const debouncedFn = debounce((bbox: BBox) => {
        if (bbox) {
          loadRooms(bbox)
        }
      }, 500)
      debouncedFn(bbox)
    },
    [loadRooms] // loadRooms 함수에 의존
  )

  const handleBoundsChanged = useCallback((bbox: BBox) => {
    setCurrentBounds(bbox)
    // bbox가 유효한 경우에만 방 목록 업데이트
    if (bbox && 
        bbox.south < bbox.north && 
        bbox.west < bbox.east) {
      debouncedLoadRooms(bbox)
    }
  }, [debouncedLoadRooms])

  // 방 클릭 핸들러
  const handleRoomClick = (room: Room) => {
    // 방 상세 페이지로 이동
    router.push(`/room/${room.id}`)
  }

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
  }

  // 방 생성 페이지로 이동
  const handleCreateRoom = () => {
    router.push('/room/new')
  }

  // 초기 로드
  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  return (
    <PageTransition type="fade">
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="bg-white border-b px-4 py-3 relative z-20">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center">
            <h1 
              className="text-xl font-bold text-primary mr-4 cursor-pointer hover:opacity-80 transition-opacity"
              onClick={() => router.push('/')}
            >
              📍 {brandMessages.appName}
            </h1>
            
            {/* 카테고리 필터 */}
            <div className="hidden md:flex space-x-2">
              {[
                { key: 'all', label: '전체', emoji: '🌐' },
                { key: 'drink', label: '술', emoji: '🍻' },
                { key: 'exercise', label: '운동', emoji: '💪' },
                { key: 'other', label: '기타', emoji: '✨' },
              ].map(category => (
                <EnhancedButton
                  key={category.key}
                  onClick={() => handleCategoryChange(category.key)}
                  variant={selectedCategory === category.key ? 'primary' : 'ghost'}
                  size="sm"
                  icon={category.emoji}
                  rounded="full"
                  animation="scale"
                >
                  {category.label}
                </EnhancedButton>
              ))}
            </div>
          </div>

          {/* 방 생성 버튼 */}
          <ButtonPresets.CreateRoom 
            onClick={handleCreateRoom}
          />
        </div>
      </header>

      {/* 모바일 카테고리 필터 */}
      <div className="md:hidden bg-white border-b px-4 py-2">
        <div className="flex space-x-2 overflow-x-auto">
          {[
            { key: 'all', label: '전체', emoji: '🌐' },
            { key: 'drink', label: '술', emoji: '🍻' },
            { key: 'exercise', label: '운동', emoji: '💪' },
            { key: 'other', label: '기타', emoji: '✨' },
          ].map(category => (
            <EnhancedButton
              key={category.key}
              onClick={() => handleCategoryChange(category.key)}
              variant={selectedCategory === category.key ? 'primary' : 'secondary'}
              size="xs"
              icon={category.emoji}
              rounded="full"
              animation="scale"
              className="flex-shrink-0"
            >
              {category.label}
            </EnhancedButton>
          ))}
        </div>
      </div>

      {/* 지도 영역 */}
      <div className="relative h-[calc(100vh-120px)] md:h-[calc(100vh-80px)]">
        {error ? (
          <div className="h-full flex items-center justify-center bg-gray-50 p-6">
            <EmptyState
              icon="📶"
              title="모임을 불러올 수 없습니다"
              description={error || "네트워크 연결을 확인하고 다시 시도해주세요."}
              action={{
                label: '다시 시도',
                onClick: () => loadRooms(),
                variant: 'default'
              }}
              size="lg"
            />
          </div>
        ) : (
          <MapWithCluster
            rooms={rooms}
            center={{ lat: 37.5665, lng: 126.978 }} // 서울시청
            level={3}
            onBoundsChanged={handleBoundsChanged}
            onRoomClick={handleRoomClick}
            className="w-full h-full"
          />
        )}

        {/* 로딩 오버레이 */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-10">
            <LoadingSpinner 
              size="lg" 
              text="모임을 찾는 중..." 
            />
          </div>
        )}
      </div>

      {/* 하단 네비게이션 */}
      <nav className="bg-white border-t px-4 py-2">
        <div className="flex justify-around">
          <button className="flex flex-col items-center py-2 text-primary">
            <span className="text-lg mb-1">🗺️</span>
            <span className="text-xs font-medium">지도</span>
          </button>
          <button 
            onClick={() => router.push('/requests')}
            className="flex flex-col items-center py-2 text-gray-500"
          >
            <span className="text-lg mb-1">📮</span>
            <span className="text-xs">요청함</span>
          </button>
          <button 
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 text-gray-500"
          >
            <span className="text-lg mb-1">👤</span>
            <span className="text-xs">프로필</span>
          </button>
        </div>
      </nav>

      {/* User Acquisition Components */}
      <OnboardingTrigger />
      <HelpCenter />
      <ReferralFloatingButton />
      </div>
    </PageTransition>
  )
}