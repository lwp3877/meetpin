/* 파일경로: src/app/map/page.tsx */
'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import DynamicMap from '@/components/map/DynamicMap'
import { debounce } from '@/lib/utils'
import { ThemeToggle } from '@/components/common/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import dynamic from 'next/dynamic'

// 필터 컴포넌트를 필요할 때만 로딩
const MapFilters = dynamic(() => import('@/components/map/lazy/MapFilters'), {
  ssr: false,
  loading: () => (
    <Card className="mt-6 animate-pulse">
      <CardContent className="p-8">
        <div className="h-32 rounded bg-gray-200"></div>
      </CardContent>
    </Card>
  ),
})
import {
  Search,
  SlidersHorizontal,
  Plus,
  MapPin,
  Mail,
  User,
  TrendingUp,
  X,
  Navigation,
  LogOut,
} from '@/components/icons/MapIcons'
import { isFeatureEnabled, trackFeatureUsage } from '@/lib/config/features'
import { toast } from 'sonner'
// 알림 컴포넌트들을 동적 로딩 - 초기 번들 사이즈 감소
const HostMessageNotifications = dynamic(
  () =>
    import('@/components/ui/HostMessageNotifications').then(mod => ({
      default: mod.HostMessageNotifications,
    })),
  {
    ssr: false,
    loading: () => <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />,
  }
)

const NotificationCenter = dynamic(() => import('@/components/ui/NotificationCenter'), {
  ssr: false,
  loading: () => <div className="h-6 w-6 animate-pulse rounded bg-gray-200" />,
})

// 서울 기본 영역 상수
const DEFAULT_BOUNDS = {
  south: 37.4563,
  west: 126.8226,
  north: 37.6761,
  east: 127.1836,
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

export default function MapPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()
  const [rooms, setRooms] = useState<Room[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([100000])
  const [maxPeople, setMaxPeople] = useState([20])
  const [timeFilter, setTimeFilter] = useState('all')

  // BBox 타입 정의
  type BBox = {
    south: number
    west: number
    north: number
    east: number
  } | null

  // 방 목록 로드 (재시도 메커니즘 포함)
  const loadRooms = useCallback(
    async (bbox?: BBox, retryCount = 0) => {
      const MAX_RETRIES = 3
      const RETRY_DELAY = 1000 // 1초

      try {
        setIsLoading(true)
        setError(null)

        const bounds = bbox || DEFAULT_BOUNDS
        const bboxParam = `${bounds.south},${bounds.west},${bounds.north},${bounds.east}`

        let url = `/api/rooms?bbox=${bboxParam}&limit=100`
        if (selectedCategory !== 'all') {
          url += `&category=${selectedCategory}`
        }

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 10000) // 10초 타임아웃

        const response = await fetch(url, {
          signal: controller.signal,
          headers: {
            'Content-Type': 'application/json',
          },
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          if (response.status >= 500 && retryCount < MAX_RETRIES) {
            // 서버 오류 시 재시도
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
        if (result.data.rooms?.length === 0) {
          toast.info('이 지역에는 아직 모임이 없습니다. 첫 번째 모임을 만들어보세요! 🎉')
        }
      } catch (err: any) {
        console.error('Rooms load error:', err)

        if (err.name === 'AbortError') {
          setError('요청 시간이 초과되었습니다')
          toast.error('네트워크가 느려 요청이 취소되었습니다. 다시 시도해주세요')
        } else if (err.message?.includes('fetch')) {
          setError('인터넷 연결을 확인해주세요')
          toast.error('인터넷 연결이 불안정합니다. 연결을 확인하고 다시 시도해주세요')
        } else {
          setError(err.message || '알 수 없는 오류가 발생했습니다')
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
    [selectedCategory]
  )

  // 지도 영역 변경 시 방 목록 업데이트 (debounced)
  const debouncedLoadRooms = useMemo(
    () =>
      debounce((bbox: BBox) => {
        if (bbox) {
          loadRooms(bbox)
        }
      }, 500),
    [loadRooms]
  )

  const handleBoundsChanged = useCallback(
    (bbox: BBox) => {
      if (bbox && bbox.south < bbox.north && bbox.west < bbox.east) {
        debouncedLoadRooms(bbox)
      }
    },
    [debouncedLoadRooms]
  )

  // 방 클릭 핸들러
  const handleRoomClick = (room: Room) => {
    trackFeatureUsage()
    router.push(`/room/${room.id}`)
  }

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    trackFeatureUsage()
  }

  // 내 주변 버튼 핸들러
  const handleNearMe = async () => {
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
          maximumAge: 300000, // 5분
        })
      })

      const { latitude, longitude } = position.coords

      // 현재 위치 기준 1km 반경 설정
      const margin = 0.01 // 약 1km
      const bounds = {
        south: latitude - margin,
        west: longitude - margin,
        north: latitude + margin,
        east: longitude + margin,
      }

      await loadRooms(bounds)
      toast.success('내 주변 모임을 찾았습니다', { id: 'location-loading' })
      trackFeatureUsage()
    } catch (error: any) {
      console.error('Location error:', error)
      toast.dismiss('location-loading')

      if (error.code === 1) {
        toast.error('위치 권한이 거부되었습니다. 브라우저 설정에서 위치 권한을 허용해주세요', {
          duration: 5000,
        })
      } else if (error.code === 2) {
        toast.error('위치를 찾을 수 없습니다. 인터넷 연결과 GPS를 확인해주세요')
      } else if (error.code === 3) {
        toast.error('위치 요청 시간이 초과되었습니다. 다시 시도해주세요')
      } else {
        toast.error('위치 정보를 가져올 수 없습니다. 브라우저 설정을 확인해주세요')
      }
    }
  }

  // 방 생성 페이지로 이동
  const handleCreateRoom = () => {
    router.push('/room/new')
  }

  // 로그아웃 핸들러
  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('성공적으로 로그아웃되었습니다')
      router.push('/auth/login')
    } catch (_error) {
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

  // 검색 핸들러
  const handleSearch = (query: string) => {
    setSearchQuery(query)
    trackFeatureUsage()
  }

  // 필터링된 방 목록 계산
  const filteredRooms = rooms.filter(room => {
    // 카테고리 필터
    if (selectedCategory !== 'all' && room.category !== selectedCategory) {
      return false
    }

    // 검색어 필터
    if (
      searchQuery &&
      !room.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !room.place_text.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false
    }

    // 가격 필터
    if (room.fee > priceRange[0]) {
      return false
    }

    // 최대 인원 필터
    if (room.max_people > maxPeople[0]) {
      return false
    }

    // 시간 필터
    const roomDate = new Date(room.start_at)
    const today = new Date()
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000)
    const weekEnd = new Date(today.getTime() + 7 * 24 * 60 * 60 * 1000)

    switch (timeFilter) {
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
  })

  // 초기 로드
  useEffect(() => {
    loadRooms()
  }, [loadRooms])

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-purple-900/30">
        <Card className="mx-4 w-full max-w-md border-0 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-900/90">
          <CardContent className="space-y-4 p-8 text-center">
            <div className="flex h-16 w-16 animate-pulse items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl">
              <span className="text-2xl">📍</span>
            </div>
            <div className="text-lg font-semibold text-gray-600 dark:text-gray-300">
              밋핀 로딩 중...
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">주변 모임을 찾고 있어요</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 dark:from-emerald-900/20 dark:via-blue-900/10 dark:to-purple-900/20">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-200/30 bg-gradient-to-r from-white/95 via-emerald-50/50 to-white/95 shadow-lg shadow-emerald-500/5 backdrop-blur-xl dark:border-emerald-800/30 dark:from-gray-900/95 dark:via-emerald-950/50 dark:to-gray-900/95">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="group flex items-center space-x-3 rounded-2xl p-3 transition-all duration-300 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-xl transition-transform duration-300 group-hover:scale-110">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <span className="bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-xl font-black text-transparent">
                    밋핀
                  </span>
                  <div className="-mt-1 text-xs text-gray-500 dark:text-gray-400">
                    지도에서 만나요
                  </div>
                </div>
              </Button>
            </div>

            {/* Enhanced Search Bar */}
            {isFeatureEnabled('ENABLE_ADVANCED_SEARCH') && (
              <div className="mx-6 max-w-xl flex-1">
                <div className="group relative">
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-emerald-500 transition-all group-focus-within:scale-110 dark:text-emerald-400" />
                  <Input
                    type="text"
                    placeholder="모임 제목이나 장소를 검색해보세요..."
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    className="rounded-2xl border-2 border-emerald-200/50 bg-white/80 py-3 pr-10 pl-12 text-sm font-medium shadow-lg shadow-emerald-500/5 backdrop-blur-sm transition-all placeholder:text-gray-500 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800/50 dark:bg-gray-800/80 dark:focus:bg-gray-700"
                  />
                  {searchQuery ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute top-1/2 right-3 h-7 w-7 -translate-y-1/2 transform rounded-full p-0 text-gray-400 transition-all hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
                      <div className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-400 dark:bg-gray-700">
                        ⌘K
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center space-x-3">
              {/* Near Me Button */}
              <Button
                onClick={handleNearMe}
                variant="outline"
                size="sm"
                className="group rounded-xl border-2 border-emerald-300 bg-white/90 px-3 py-2 text-emerald-600 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg dark:border-emerald-600 dark:bg-gray-800/90 dark:text-emerald-400 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/30"
              >
                <Navigation className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" />
                <span className="hidden font-semibold sm:inline">내 주변</span>
              </Button>

              <ThemeToggle />

              {/* Host Message Notifications */}
              <HostMessageNotifications
                onMessageClick={message => {
                  toast.success(`${message.sender?.nickname}님의 메시지를 확인했습니다`)
                }}
              />

              {/* General Notifications */}
              <NotificationCenter />

              {/* Filter Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`group rounded-xl p-3 shadow-md transition-all duration-300 hover:shadow-lg ${
                  showFilters
                    ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-white/90 hover:bg-gray-50 dark:bg-gray-800/90 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal
                  className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : 'group-hover:scale-110'}`}
                />
              </Button>

              {/* User Profile & Logout */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Profile Button */}
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                    className="group flex items-center space-x-2 rounded-xl bg-white/90 p-2 shadow-md transition-all duration-300 hover:bg-gray-50 hover:shadow-lg dark:bg-gray-800/90 dark:hover:bg-gray-800"
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-sm font-bold text-white shadow-lg transition-transform duration-300 group-hover:scale-110">
                      {user.email?.[0].toUpperCase()}
                    </div>
                  </Button>

                  {/* Logout Button */}
                  <Button
                    variant="ghost"
                    onClick={handleSignOut}
                    size="sm"
                    className="group rounded-xl bg-white/90 p-3 text-red-600 shadow-md transition-all duration-300 hover:bg-red-50 hover:text-red-700 hover:shadow-lg dark:bg-gray-800/90 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                    title="로그아웃"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => router.push('/auth/login')}
                  size="sm"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/25"
                >
                  로그인
                </Button>
              )}

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                size="sm"
                className="group rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/25"
              >
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" />
                <span className="hidden sm:inline">방 만들기</span>
                <span className="sm:hidden">생성</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <MapFilters
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryChange}
              priceRange={priceRange}
              setPriceRange={setPriceRange}
              maxPeople={maxPeople}
              setMaxPeople={setMaxPeople}
              timeFilter={timeFilter}
              setTimeFilter={setTimeFilter}
            />
          )}
        </div>
      </header>

      {/* Map Area */}
      <div className="relative h-[calc(100vh-180px)]">
        {error ? (
          <Card className="m-6 flex h-full items-center justify-center border-0 bg-white/50 shadow-2xl backdrop-blur-sm dark:bg-gray-800/50">
            <CardContent className="space-y-6 p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
                <span className="text-2xl">📶</span>
              </div>
              <div>
                <h3 className="mb-2 text-xl font-bold text-gray-800 dark:text-gray-200">
                  모임을 불러올 수 없습니다
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {error || '네트워크 연결을 확인하고 다시 시도해주세요.'}
                </p>
              </div>
              <Button
                onClick={() => loadRooms()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600"
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : (
          <DynamicMap
            rooms={filteredRooms}
            center={{ lat: 37.5665, lng: 126.978 }}
            level={3}
            onBoundsChanged={handleBoundsChanged}
            onRoomClick={handleRoomClick}
            className="h-full w-full overflow-hidden rounded-t-3xl shadow-2xl"
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-t-3xl bg-white/80 backdrop-blur-sm dark:bg-gray-900/80">
            <Card className="border-0 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
              <CardContent className="space-y-4 p-8 text-center">
                <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                <div className="space-y-2">
                  <p className="font-semibold text-emerald-600 dark:text-emerald-400">
                    모임을 찾는 중...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    주변 모임을 검색하고 있어요
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Stats Info */}
        {rooms.length > 0 && (
          <Card className="absolute bottom-6 left-6 border-0 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="h-3 w-3 animate-pulse rounded-full bg-gradient-to-r from-emerald-500 to-teal-500"></div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {filteredRooms.length}개 모임
                  </span>
                </div>
                {selectedCategory !== 'all' && (
                  <Badge
                    variant="secondary"
                    className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300"
                  >
                    {selectedCategory === 'drink' && '🍻 술'}
                    {selectedCategory === 'exercise' && '💪 운동'}
                    {selectedCategory === 'other' && '✨기타'}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge
                    variant="outline"
                    className="border-blue-300 text-blue-600 dark:border-blue-600 dark:text-blue-400"
                  >
                    &quot;{searchQuery}&quot; 검색 중
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Rooms Indicator */}
        {isFeatureEnabled('ENABLE_RECOMMENDATION_SLIDER') && filteredRooms.length > 0 && (
          <Card className="absolute top-6 right-6 border-0 bg-white/90 shadow-2xl backdrop-blur-xl dark:bg-gray-800/90">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp className="h-4 w-4 text-orange-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  인기 모임 {Math.min(3, filteredRooms.length)}개 표시
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Bottom Navigation */}
      <nav className="border-t-2 border-emerald-200/30 bg-gradient-to-r from-white/95 via-emerald-50/30 to-white/95 shadow-2xl shadow-emerald-500/5 backdrop-blur-xl dark:border-emerald-800/30 dark:from-gray-900/95 dark:via-emerald-950/30 dark:to-gray-900/95">
        <div className="flex justify-around px-6 py-4">
          <Button
            variant="ghost"
            className="group flex flex-col items-center space-y-2 py-3 transition-all duration-300"
          >
            <div className="relative flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 shadow-xl shadow-emerald-500/25 transition-transform duration-300 group-hover:scale-110">
              <MapPin className="h-5 w-5 text-white" />
              <div className="absolute -top-1 -right-1 h-4 w-4 animate-pulse rounded-full bg-yellow-400"></div>
            </div>
            <span className="text-xs font-bold text-emerald-600 transition-colors group-hover:text-emerald-700 dark:text-emerald-400 dark:group-hover:text-emerald-300">
              지도
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push('/requests')}
            className="group flex flex-col items-center space-y-2 rounded-2xl py-3 transition-all duration-300 hover:scale-105 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 shadow-md transition-all duration-300 group-hover:bg-blue-100 group-hover:shadow-lg dark:bg-gray-700 dark:group-hover:bg-blue-900/30">
              <Mail className="h-4 w-4 text-gray-600 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 transition-colors group-hover:text-blue-600 dark:text-gray-400 dark:group-hover:text-blue-400">
              요청함
            </span>
          </Button>

          <Button
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="group flex flex-col items-center space-y-2 rounded-2xl py-3 transition-all duration-300 hover:scale-105 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20"
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-200 shadow-md transition-all duration-300 group-hover:bg-purple-100 group-hover:shadow-lg dark:bg-gray-700 dark:group-hover:bg-purple-900/30">
              <User className="h-4 w-4 text-gray-600 transition-colors group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400" />
            </div>
            <span className="text-xs font-medium text-gray-500 transition-colors group-hover:text-purple-600 dark:text-gray-400 dark:group-hover:text-purple-400">
              프로필
            </span>
          </Button>
        </div>
      </nav>
    </div>
  )
}
