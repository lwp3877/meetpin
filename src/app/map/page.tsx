/* 파일경로: src/app/map/page.tsx */
'use client'


import { useState, useEffect, useCallback, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import DynamicMap from '@/components/DynamicMap'
import { debounce } from '@/lib/debounce'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { 
  Search, 
  SlidersHorizontal, 
  Plus, 
  MapPin, 
  Users, 
  Mail, 
  User, 
  TrendingUp,
  Calendar,
  DollarSign,
  Filter,
  X,
  Navigation
} from 'lucide-react'
import { isFeatureEnabled, trackFeatureUsage } from '@/lib/features'
import { toast } from 'sonner'
import { HostMessageNotifications } from '@/components/ui/HostMessageNotifications'

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
  const { user, loading } = useAuth()
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
        toast.info('이 지역에는 아직 모임이 없습니다')
      }
    } catch (err: any) {
      console.error('Rooms load error:', err)
      setError(err.message)
      toast.error('모임을 불러오는 중 오류가 발생했습니다')
    } finally {
      setIsLoading(false)
    }
  }, [selectedCategory])

  // 지도 영역 변경 시 방 목록 업데이트 (debounced)
  const debouncedLoadRooms = useMemo(
    () => debounce((bbox: BBox) => {
      if (bbox) {
        loadRooms(bbox)
      }
    }, 500),
    [loadRooms]
  )

  const handleBoundsChanged = useCallback((bbox: BBox) => {
    if (bbox && 
        bbox.south < bbox.north && 
        bbox.west < bbox.east) {
      debouncedLoadRooms(bbox)
    }
  }, [debouncedLoadRooms])

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
    try {
      if (!navigator.geolocation) {
        toast.error('위치 서비스가 지원되지 않습니다')
        return
      }

      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 600000
        })
      })

      const { latitude, longitude } = position.coords
      
      // 현재 위치 기준 1km 반경 설정
      const margin = 0.01 // 약 1km
      const bounds = {
        south: latitude - margin,
        west: longitude - margin,
        north: latitude + margin,
        east: longitude + margin
      }

      await loadRooms(bounds)
      toast.success('내 주변 모임을 찾았습니다')
      trackFeatureUsage()
    } catch (error) {
      console.error('Location error:', error)
      toast.error('위치 정보를 가져올 수 없습니다. 위치 권한을 확인해주세요')
    }
  }

  // 방 생성 페이지로 이동
  const handleCreateRoom = () => {
    router.push('/room/new')
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
    if (searchQuery && !room.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !room.place_text.toLowerCase().includes(searchQuery.toLowerCase())) {
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
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-purple-900/30 flex items-center justify-center">
        <Card className="w-full max-w-md mx-4 backdrop-blur-xl bg-white/90 dark:bg-gray-900/90 border-0 shadow-2xl">
          <CardContent className="p-8 text-center space-y-4">
            <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
              <span className="text-2xl">📍</span>
            </div>
            <div className="text-lg text-gray-600 dark:text-gray-300 font-semibold">밋핀 로딩 중...</div>
            <div className="text-sm text-gray-500 dark:text-gray-400">주변 모임을 찾고 있어요</div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 dark:from-emerald-900/20 dark:via-blue-900/10 dark:to-purple-900/20">
      {/* Enhanced Header */}
      <header className="bg-gradient-to-r from-white/95 via-emerald-50/50 to-white/95 dark:from-gray-900/95 dark:via-emerald-950/50 dark:to-gray-900/95 backdrop-blur-xl border-b border-emerald-200/30 dark:border-emerald-800/30 sticky top-0 z-50 shadow-lg shadow-emerald-500/5">
        <div className="px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="group flex items-center space-x-3 hover:bg-emerald-100/50 dark:hover:bg-emerald-900/30 p-3 rounded-2xl transition-all duration-300"
              >
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                  <span className="text-xl">📍</span>
                </div>
                <div>
                  <span className="text-xl font-black bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                    밋핀
                  </span>
                  <div className="text-xs text-gray-500 dark:text-gray-400 -mt-1">
                    지도에서 만나요
                  </div>
                </div>
              </Button>
            </div>

            {/* Enhanced Search Bar */}
            {isFeatureEnabled('ENABLE_ADVANCED_SEARCH') && (
              <div className="flex-1 max-w-xl mx-6">
                <div className="relative group">
                  <Search className="w-5 h-5 text-emerald-500 dark:text-emerald-400 absolute left-4 top-1/2 transform -translate-y-1/2 transition-all group-focus-within:scale-110" />
                  <Input
                    type="text"
                    placeholder="모임 제목이나 장소를 검색해보세요..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-12 pr-10 py-3 bg-white/80 dark:bg-gray-800/80 border-2 border-emerald-200/50 dark:border-emerald-800/50 rounded-2xl text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-400 focus:bg-white dark:focus:bg-gray-700 transition-all backdrop-blur-sm shadow-lg shadow-emerald-500/5 font-medium placeholder:text-gray-500"
                  />
                  {searchQuery ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 h-7 w-7 p-0 hover:bg-red-100 dark:hover:bg-red-900/30 rounded-full transition-all text-gray-400 hover:text-red-500"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  ) : (
                    <div className="absolute right-4 top-1/2 transform -translate-y-1/2">
                      <div className="text-xs text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-lg">
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
                className="group bg-white/90 dark:bg-gray-800/90 border-2 border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-500 dark:hover:border-emerald-400 transition-all duration-300 rounded-xl px-3 py-2 shadow-md hover:shadow-lg backdrop-blur-sm"
              >
                <Navigation className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                <span className="hidden sm:inline font-semibold">내 주변</span>
              </Button>
              
              <ThemeToggle />
              
              {/* Host Message Notifications */}
              <HostMessageNotifications
                onMessageClick={(message) => {
                  toast.success(`${message.sender?.nickname}님의 메시지를 확인했습니다`)
                }}
              />
              
              {/* Filter Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`group p-3 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${
                  showFilters 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 shadow-emerald-500/20' 
                    : 'bg-white/90 dark:bg-gray-800/90 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal className={`w-5 h-5 transition-transform ${showFilters ? 'rotate-180' : 'group-hover:scale-110'}`} />
              </Button>

              {/* User Profile */}
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="group flex items-center space-x-2 p-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-800 transition-all duration-300 shadow-md hover:shadow-lg bg-white/90 dark:bg-gray-800/90"
                >
                  <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-sm text-white font-bold shadow-lg group-hover:scale-110 transition-transform duration-300">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/auth/login')}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg hover:shadow-emerald-500/25 transition-all duration-300 rounded-xl px-4 py-2 font-semibold"
                >
                  로그인
                </Button>
              )}

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                size="sm"
                className="group bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-purple-500/25 hover:scale-105 transition-all duration-300 rounded-xl px-4 py-2 font-bold"
              >
                <Plus className="w-4 h-4 mr-2 group-hover:rotate-90 transition-transform duration-300" />
                <span className="hidden sm:inline">방 만들기</span>
                <span className="sm:hidden">생성</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <Card className="mt-6 bg-gradient-to-br from-white/98 to-emerald-50/50 dark:from-gray-900/98 dark:to-emerald-950/50 backdrop-blur-xl border-2 border-emerald-200/30 dark:border-emerald-800/30 shadow-2xl shadow-emerald-500/10 rounded-2xl animate-in slide-in-from-top-2 duration-300">
              <CardContent className="p-8">
                <div className="grid md:grid-cols-4 gap-8">
                  {/* Category Filter */}
                  <div className="space-y-4">
                    <label className="text-sm font-bold text-gray-800 dark:text-gray-200 flex items-center">
                      <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mr-3">
                        <Filter className="w-3 h-3 text-white" />
                      </div>
                      카테고리
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      {[
                        { key: 'all', label: '전체', emoji: '🌐', color: 'from-gray-400 to-gray-500' },
                        { key: 'drink', label: '술', emoji: '🍻', color: 'from-amber-400 to-orange-500' },
                        { key: 'exercise', label: '운동', emoji: '💪', color: 'from-red-400 to-pink-500' },
                        { key: 'other', label: '기타', emoji: '✨', color: 'from-purple-400 to-indigo-500' },
                      ].map(category => (
                        <Button
                          key={category.key}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleCategoryChange(category.key)}
                          className={`group p-3 rounded-xl transition-all duration-300 hover:scale-105 ${
                            selectedCategory === category.key 
                              ? `bg-gradient-to-r ${category.color} text-white shadow-lg shadow-emerald-500/25` 
                              : 'bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 shadow-md'
                          }`}
                        >
                          <div className="text-center space-y-1">
                            <div className={`text-lg ${selectedCategory === category.key ? 'animate-bounce' : 'group-hover:scale-110 transition-transform'}`}>
                              {category.emoji}
                            </div>
                            <div className={`text-xs font-semibold ${
                              selectedCategory === category.key ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                            }`}>
                              {category.label}
                            </div>
                          </div>
                        </Button>
                      ))}
                    </div>
                  </div>

                  {/* Time Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Calendar className="w-4 h-4 mr-2" />
                      시간
                    </label>
                    <Select value={timeFilter} onValueChange={setTimeFilter}>
                      <SelectTrigger className="bg-gray-50 dark:bg-gray-700 border-gray-200 dark:border-gray-600">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">전체</SelectItem>
                        <SelectItem value="today">오늘</SelectItem>
                        <SelectItem value="tomorrow">내일</SelectItem>
                        <SelectItem value="week">이번 주</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Price Range */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <DollarSign className="w-4 h-4 mr-2" />
                      참가비 (최대 {priceRange[0] === 100000 ? '10만원+' : `${priceRange[0].toLocaleString()}원`})
                    </label>
                    <div className="space-y-3">
                      <Slider
                        value={priceRange}
                        onValueChange={setPriceRange}
                        max={100000}
                        min={0}
                        step={10000}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>무료</span>
                        <span>10만원+</span>
                      </div>
                    </div>
                  </div>

                  {/* Max People */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Users className="w-4 h-4 mr-2" />
                      최대 인원 ({maxPeople[0]}명 이하)
                    </label>
                    <div className="space-y-3">
                      <Slider
                        value={maxPeople}
                        onValueChange={setMaxPeople}
                        max={20}
                        min={2}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400">
                        <span>2명</span>
                        <span>20명+</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </header>

      {/* Map Area */}
      <div className="relative h-[calc(100vh-180px)]">
        {error ? (
          <Card className="h-full flex items-center justify-center bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm m-6 border-0 shadow-2xl">
            <CardContent className="text-center space-y-6 p-8">
              <div className="w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full flex items-center justify-center mx-auto">
                <span className="text-2xl">📶</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-2">모임을 불러올 수 없습니다</h3>
                <p className="text-gray-600 dark:text-gray-400">{error || "네트워크 연결을 확인하고 다시 시도해주세요."}</p>
              </div>
              <Button
                onClick={() => loadRooms()}
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
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
            className="w-full h-full rounded-t-3xl overflow-hidden shadow-2xl"
          />
        )}

        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm flex items-center justify-center z-10 rounded-t-3xl">
            <Card className="backdrop-blur-xl bg-white/90 dark:bg-gray-800/90 border-0 shadow-2xl">
              <CardContent className="p-8 text-center space-y-4">
                <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
                <div className="space-y-2">
                  <p className="text-emerald-600 dark:text-emerald-400 font-semibold">모임을 찾는 중...</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">주변 모임을 검색하고 있어요</p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Enhanced Stats Info */}
        {rooms.length > 0 && (
          <Card className="absolute bottom-6 left-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl">
            <CardContent className="p-4">
              <div className="flex items-center space-x-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full animate-pulse"></div>
                  <span className="font-bold text-gray-800 dark:text-gray-200">
                    {filteredRooms.length}개 모임
                  </span>
                </div>
                {selectedCategory !== 'all' && (
                  <Badge variant="secondary" className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                    {selectedCategory === 'drink' && '🍻 술'}
                    {selectedCategory === 'exercise' && '💪 운동'}
                    {selectedCategory === 'other' && '✨기타'}
                  </Badge>
                )}
                {searchQuery && (
                  <Badge variant="outline" className="border-blue-300 dark:border-blue-600 text-blue-600 dark:text-blue-400">
                    &quot;{searchQuery}&quot; 검색 중
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Popular Rooms Indicator */}
        {isFeatureEnabled('ENABLE_RECOMMENDATION_SLIDER') && filteredRooms.length > 0 && (
          <Card className="absolute top-6 right-6 bg-white/90 dark:bg-gray-800/90 backdrop-blur-xl border-0 shadow-2xl">
            <CardContent className="p-3">
              <div className="flex items-center space-x-2 text-xs">
                <TrendingUp className="w-4 h-4 text-orange-500" />
                <span className="font-semibold text-gray-700 dark:text-gray-300">
                  인기 모임 {Math.min(3, filteredRooms.length)}개 표시
                </span>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Enhanced Bottom Navigation */}
      <nav className="bg-gradient-to-r from-white/95 via-emerald-50/30 to-white/95 dark:from-gray-900/95 dark:via-emerald-950/30 dark:to-gray-900/95 backdrop-blur-xl border-t-2 border-emerald-200/30 dark:border-emerald-800/30 shadow-2xl shadow-emerald-500/5">
        <div className="flex justify-around py-4 px-6">
          <Button variant="ghost" className="group flex flex-col items-center py-3 space-y-2 transition-all duration-300">
            <div className="relative w-12 h-12 bg-gradient-to-br from-emerald-500 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-xl shadow-emerald-500/25 group-hover:scale-110 transition-transform duration-300">
              <MapPin className="w-5 h-5 text-white" />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full animate-pulse"></div>
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 group-hover:text-emerald-700 dark:group-hover:text-emerald-300 transition-colors">지도</span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.push('/requests')}
            className="group flex flex-col items-center py-3 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 group-hover:shadow-lg transition-all duration-300">
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 font-medium transition-colors">요청함</span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="group flex flex-col items-center py-3 space-y-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-900/20 rounded-2xl transition-all duration-300 hover:scale-105"
          >
            <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center shadow-md group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30 group-hover:shadow-lg transition-all duration-300">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 font-medium transition-colors">프로필</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}