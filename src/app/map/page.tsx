/* 파일경로: src/app/map/page.tsx */
'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import MapWithCluster from '@/components/MapWithCluster'
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
  const debouncedLoadRooms = useCallback(
    debounce((bbox: BBox) => {
      if (bbox) {
        loadRooms(bbox)
      }
    }, 500),
    [loadRooms]
  )

  const handleBoundsChanged = useCallback((bbox: BBox) => {
    setCurrentBounds(bbox)
    if (bbox && 
        bbox.south < bbox.north && 
        bbox.west < bbox.east) {
      debouncedLoadRooms(bbox)
    }
  }, [debouncedLoadRooms])

  // 방 클릭 핸들러
  const handleRoomClick = (room: Room) => {
    trackFeatureUsage('ENABLE_ADVANCED_SEARCH', 'room_clicked')
    router.push(`/room/${room.id}`)
  }

  // 카테고리 변경
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    trackFeatureUsage('ENABLE_ADVANCED_SEARCH', `category_${category}`)
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

      setCurrentBounds(bounds)
      await loadRooms(bounds)
      toast.success('내 주변 모임을 찾았습니다')
      trackFeatureUsage('ENABLE_LOCATION_FILTER', 'near_me_used')
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
    trackFeatureUsage('ENABLE_ADVANCED_SEARCH', 'search_used')
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
      <header className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-b border-white/20 dark:border-gray-700/20 sticky top-0 z-50">
        <div className="px-4 py-3">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center">
              <Button
                variant="ghost"
                onClick={() => router.push('/')}
                className="flex items-center space-x-2 hover:bg-gray-100/50 dark:hover:bg-gray-800/50 p-2 rounded-xl"
              >
                <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-lg">📍</span>
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  밋핀
                </span>
              </Button>
            </div>

            {/* Enhanced Search Bar */}
            {isFeatureEnabled('ENABLE_ADVANCED_SEARCH') && (
              <div className="flex-1 max-w-lg mx-4">
                <div className="relative">
                  <Search className="w-4 h-4 text-gray-400 dark:text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2" />
                  <Input
                    type="text"
                    placeholder="모임 제목이나 장소 검색..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-gray-100/80 dark:bg-gray-800/80 border-0 rounded-full text-sm focus:ring-2 focus:ring-emerald-500 focus:bg-white dark:focus:bg-gray-700 transition-all backdrop-blur-sm"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-full"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Right Actions */}
            <div className="flex items-center space-x-2">
              {/* Near Me Button */}
              <Button
                onClick={handleNearMe}
                variant="outline"
                size="sm"
                className="bg-white/80 dark:bg-gray-800/80 border-emerald-300 dark:border-emerald-600 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:border-emerald-400 dark:hover:border-emerald-500 transition-all duration-200"
              >
                <Navigation className="w-4 h-4 mr-1" />
                <span className="hidden sm:inline">내 주변</span>
              </Button>
              
              <ThemeToggle />
              
              {/* Filter Toggle */}
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className={`p-2 rounded-full transition-all ${
                  showFilters 
                    ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-800'
                }`}
              >
                <SlidersHorizontal className="w-5 h-5" />
              </Button>

              {/* User Profile */}
              {user ? (
                <Button
                  variant="ghost"
                  onClick={() => router.push('/profile')}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow">
                    {user.email?.[0].toUpperCase()}
                  </div>
                </Button>
              ) : (
                <Button
                  onClick={() => router.push('/auth/login')}
                  size="sm"
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                >
                  로그인
                </Button>
              )}

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                size="sm"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:scale-105 transition-transform"
              >
                <Plus className="w-4 h-4 mr-1" />
                방 만들기
              </Button>
            </div>
          </div>

          {/* Enhanced Filters Panel */}
          {showFilters && (
            <Card className="mt-4 bg-white/95 dark:bg-gray-800/95 backdrop-blur-xl border-0 shadow-2xl">
              <CardContent className="p-6">
                <div className="grid md:grid-cols-4 gap-6">
                  {/* Category Filter */}
                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center">
                      <Filter className="w-4 h-4 mr-2" />
                      카테고리
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { key: 'all', label: '전체', emoji: '🌐', color: 'bg-gray-100 dark:bg-gray-700' },
                        { key: 'drink', label: '술', emoji: '🍻', color: 'bg-amber-100 dark:bg-amber-900/30' },
                        { key: 'exercise', label: '운동', emoji: '💪', color: 'bg-red-100 dark:bg-red-900/30' },
                        { key: 'other', label: '기타', emoji: '✨', color: 'bg-purple-100 dark:bg-purple-900/30' },
                      ].map(category => (
                        <Button
                          key={category.key}
                          variant={selectedCategory === category.key ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleCategoryChange(category.key)}
                          className={`${
                            selectedCategory === category.key 
                              ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg scale-105' 
                              : `${category.color} hover:shadow-md dark:text-gray-200`
                          } transition-all duration-200`}
                        >
                          <span className="mr-2">{category.emoji}</span>
                          {category.label}
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
          <MapWithCluster
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
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border-t border-white/20 dark:border-gray-700/20">
        <div className="flex justify-around py-3">
          <Button variant="ghost" className="flex flex-col items-center py-2 space-y-1">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
              <MapPin className="w-4 h-4 text-white" />
            </div>
            <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">지도</span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.push('/requests')}
            className="flex flex-col items-center py-2 space-y-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <Mail className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">요청함</span>
          </Button>
          
          <Button 
            variant="ghost"
            onClick={() => router.push('/profile')}
            className="flex flex-col items-center py-2 space-y-1 hover:bg-gray-100 dark:hover:bg-gray-800"
          >
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
              <User className="w-4 h-4 text-gray-600 dark:text-gray-400" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400">프로필</span>
          </Button>
        </div>
      </nav>
    </div>
  )
}