/* 파일경로: src/app/map/page.tsx */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import DynamicMap from '@/components/map/DynamicMap'
import { useMapRooms } from '@/hooks/useMapRooms'
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
import { isFeatureEnabled } from '@/lib/config/features'
import toast from 'react-hot-toast'
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

export default function MapPage() {
  const { user, loading, signOut } = useAuth()
  const router = useRouter()

  // UI 상태 (필터 조건들)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [showFilters, setShowFilters] = useState(false)
  const [priceRange, setPriceRange] = useState([100000])
  const [maxPeople, setMaxPeople] = useState([20])
  const [timeFilter, setTimeFilter] = useState('all')

  // 방 목록 로딩·필터링·위치 검색 로직 (훅으로 분리)
  const { rooms, filteredRooms, isLoading, error, loadRooms, handleBoundsChanged, handleRoomClick, handleNearMe } =
    useMapRooms({ selectedCategory, searchQuery, priceRange, maxPeople, timeFilter })

  const handleCategoryChange = (category: string) => setSelectedCategory(category)
  const handleSearch = (query: string) => setSearchQuery(query)
  const handleCreateRoom = () => router.push('/room/new')

  const handleSignOut = async () => {
    try {
      await signOut()
      toast.success('성공적으로 로그아웃되었습니다')
      router.push('/auth/login')
    } catch (_error) {
      toast.error('로그아웃 중 오류가 발생했습니다')
    }
  }

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
                aria-label="홈으로 이동"
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
                  <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-emerald-500 transition-all group-focus-within:scale-110 dark:text-emerald-400" aria-hidden="true" />
                  <Input
                    type="text"
                    placeholder="모임 제목이나 장소를 검색해보세요..."
                    value={searchQuery}
                    onChange={e => handleSearch(e.target.value)}
                    aria-label="모임 검색"
                    className="rounded-2xl border-2 border-emerald-200/50 bg-white/80 py-3 pr-10 pl-12 text-sm font-medium shadow-lg shadow-emerald-500/5 backdrop-blur-sm transition-all placeholder:text-gray-500 focus:border-emerald-400 focus:bg-white focus:ring-2 focus:ring-emerald-500 dark:border-emerald-800/50 dark:bg-gray-800/80 dark:focus:bg-gray-700"
                  />
                  {searchQuery ? (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSearchQuery('')}
                      aria-label="검색어 지우기"
                      className="absolute top-1/2 right-3 h-7 w-7 -translate-y-1/2 transform rounded-full p-0 text-gray-400 transition-all hover:bg-red-100 hover:text-red-500 dark:hover:bg-red-900/30"
                    >
                      <X className="h-4 w-4" aria-hidden="true" />
                    </Button>
                  ) : (
                    <div className="absolute top-1/2 right-4 -translate-y-1/2 transform">
                      <div className="rounded-lg bg-gray-100 px-2 py-1 text-xs text-gray-600 dark:bg-gray-700 dark:text-gray-300">
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
                aria-label="내 주변 모임 찾기"
                className="group rounded-xl border-2 border-emerald-300 bg-white/90 px-3 py-2 text-emerald-600 shadow-md backdrop-blur-sm transition-all duration-300 hover:border-emerald-500 hover:bg-emerald-50 hover:shadow-lg dark:border-emerald-600 dark:bg-gray-800/90 dark:text-emerald-400 dark:hover:border-emerald-400 dark:hover:bg-emerald-900/30"
              >
                <Navigation className="mr-2 h-4 w-4 transition-transform group-hover:scale-110" aria-hidden="true" />
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
                aria-label={showFilters ? "필터 닫기" : "필터 열기"}
                aria-expanded={showFilters}
                className={`group rounded-xl p-3 shadow-md transition-all duration-300 hover:shadow-lg ${
                  showFilters
                    ? 'bg-emerald-100 text-emerald-600 shadow-emerald-500/20 dark:bg-emerald-900/30 dark:text-emerald-400'
                    : 'bg-white/90 hover:bg-gray-50 dark:bg-gray-800/90 dark:hover:bg-gray-700'
                }`}
              >
                <SlidersHorizontal
                  className={`h-5 w-5 transition-transform ${showFilters ? 'rotate-180' : 'group-hover:scale-110'}`}
                  aria-hidden="true"
                />
              </Button>

              {/* User Profile & Logout */}
              {user ? (
                <div className="flex items-center space-x-2">
                  {/* Profile Button */}
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                    aria-label="내 프로필 보기"
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
                    aria-label="로그아웃"
                    className="group rounded-xl bg-white/90 p-3 text-red-600 shadow-md transition-all duration-300 hover:bg-red-50 hover:text-red-700 hover:shadow-lg dark:bg-gray-800/90 dark:text-red-400 dark:hover:bg-red-900/30 dark:hover:text-red-300"
                    title="로그아웃"
                  >
                    <LogOut className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" aria-hidden="true" />
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={() => router.push('/auth/login')}
                  size="sm"
                  aria-label="로그인"
                  className="rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 font-semibold text-white shadow-lg transition-all duration-300 hover:from-emerald-600 hover:to-teal-600 hover:shadow-emerald-500/25"
                >
                  로그인
                </Button>
              )}

              {/* Create Room Button */}
              <Button
                onClick={handleCreateRoom}
                size="sm"
                aria-label="새로운 방 만들기"
                className="group rounded-xl bg-gradient-to-r from-purple-500 to-pink-500 px-4 py-2 font-bold text-white shadow-lg transition-all duration-300 hover:scale-105 hover:from-purple-600 hover:to-pink-600 hover:shadow-purple-500/25"
              >
                <Plus className="mr-2 h-4 w-4 transition-transform duration-300 group-hover:rotate-90" aria-hidden="true" />
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
                aria-label="모임 다시 불러오기"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg hover:from-emerald-600 hover:to-teal-600"
              >
                다시 시도
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div role="region" aria-label="지도 영역">
            <DynamicMap
              rooms={filteredRooms}
              center={{ lat: 37.5665, lng: 126.978 }}
              level={3}
              onBoundsChanged={handleBoundsChanged}
              onRoomClick={handleRoomClick}
              className="h-full w-full overflow-hidden rounded-t-3xl shadow-2xl"
            />
          </div>
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
