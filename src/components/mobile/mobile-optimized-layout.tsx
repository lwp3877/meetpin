/**
 * 모바일 환경에 최적화된 레이아웃 컴포넌트
 * 터치 친화적 인터페이스와 반응형 디자인으로 모바일 사용자 경험 향상
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import PremiumButton from '@/components/ui/premium-button'
import { 
  MapPin, 
  Users, 
  Heart, 
  Star, 
  Clock, 
  ChevronDown,
  Search,
  Menu,
  X,
  Smartphone
} from 'lucide-react'

interface MobileLayoutProps {
  children?: React.ReactNode
  showMobileOptimizations?: boolean
}

// 모바일 친화적 피처드 방 데이터
const MOBILE_FEATURED_ROOMS = [
  {
    id: '1',
    title: '🍻 홍대 술집 투어',
    category: 'drink',
    location: '홍대입구역 3번 출구',
    participants: 4,
    maxParticipants: 6,
    fee: 30000,
    time: '오늘 7시',
    host: '민주',
    rating: 4.8,
    distance: '500m',
    isActive: true,
    tags: ['홍대', '맥주', '새친구']
  },
  {
    id: '2',
    title: '💪 아침 한강 러닝',
    category: 'exercise',
    location: '반포한강공원',
    participants: 3,
    maxParticipants: 5,
    fee: 0,
    time: '내일 6시',
    host: '준호',
    rating: 4.9,
    distance: '1.2km',
    isActive: true,
    tags: ['러닝', '건강', '아침']
  },
  {
    id: '3',
    title: '☕ 성수 카페 탐방',
    category: 'other',
    location: '성수역 2번 출구',
    participants: 2,
    maxParticipants: 4,
    fee: 15000,
    time: '이번 주말',
    host: '소영',
    rating: 4.7,
    distance: '800m',
    isActive: true,
    tags: ['카페', '성수', '힐링']
  }
]

export function MobileOptimizedLayout({ children, showMobileOptimizations = true }: MobileLayoutProps) {
  const [_isMobile, setIsMobile] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const [activeTab, setActiveTab] = useState('all')

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768)
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!showMobileOptimizations) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center">
              <span className="text-lg">📍</span>
            </div>
            <span className="text-xl font-bold text-gray-800">밋핀</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <PremiumButton variant="ghost" size="sm">
              <Search className="h-5 w-5" />
            </PremiumButton>
            <PremiumButton 
              variant="ghost" 
              size="sm"
              onClick={() => setShowMobileMenu(!showMobileMenu)}
            >
              {showMobileMenu ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </PremiumButton>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {showMobileMenu && (
          <div className="bg-white border-t border-gray-200 p-4 space-y-2">
            <PremiumButton variant="ghost" className="w-full justify-start">
              <MapPin className="h-4 w-4 mr-2" />
              지도에서 보기
            </PremiumButton>
            <PremiumButton variant="ghost" className="w-full justify-start">
              <Users className="h-4 w-4 mr-2" />
              내 모임
            </PremiumButton>
            <PremiumButton variant="ghost" className="w-full justify-start">
              <Heart className="h-4 w-4 mr-2" />
              찜한 방
            </PremiumButton>
          </div>
        )}
      </div>

      {/* Mobile Category Tabs */}
      <div className="md:hidden bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex space-x-1 overflow-x-auto">
          {[
            { id: 'all', label: '전체', icon: '🌟' },
            { id: 'drink', label: '술모임', icon: '🍻' },
            { id: 'exercise', label: '운동', icon: '💪' },
            { id: 'other', label: '기타', icon: '✨' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                activeTab === tab.id
                  ? 'bg-emerald-500 text-white'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span className="mr-1">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Content */}
      <div className="p-4 space-y-4">
        {/* Quick Actions - Mobile First */}
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white border-0">
            <CardContent className="p-4">
              <div className="text-center space-y-3">
                <div className="text-lg font-bold">🚀 빠른 시작</div>
                <div className="grid grid-cols-2 gap-3">
                  <PremiumButton 
                    variant="glass" 
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <MapPin className="h-4 w-4 mr-1" />
                    방 찾기
                  </PremiumButton>
                  <PremiumButton 
                    variant="glass"
                    className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                  >
                    <Users className="h-4 w-4 mr-1" />
                    방 만들기
                  </PremiumButton>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Location Based Suggestions */}
        <Card className="border-0 shadow-sm">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-bold text-gray-800 flex items-center">
                <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                내 주변 인기 모임
              </h3>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-700">
                실시간
              </Badge>
            </div>
            
            <div className="space-y-3">
              {MOBILE_FEATURED_ROOMS.slice(0, 3).map((room) => (
                <div key={room.id} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-xl flex items-center justify-center text-white font-bold">
                    {room.title.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold text-gray-800 truncate">{room.title}</div>
                    <div className="flex items-center space-x-2 text-xs text-gray-500">
                      <span className="flex items-center">
                        <MapPin className="h-3 w-3 mr-1" />
                        {room.distance}
                      </span>
                      <span className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        {room.participants}/{room.maxParticipants}
                      </span>
                      <span className="flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {room.time}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col items-end space-y-1">
                    <div className="flex items-center">
                      <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      <span className="text-xs font-medium text-gray-600">{room.rating}</span>
                    </div>
                    <div className={`w-2 h-2 rounded-full ${room.isActive ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Mobile Stats */}
        <div className="grid grid-cols-2 gap-3">
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600">1,247</div>
              <div className="text-sm text-gray-500">현재 접속자</div>
              <div className="w-full bg-emerald-100 rounded-full h-1 mt-2">
                <div className="bg-emerald-500 h-1 rounded-full w-3/4"></div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-0 shadow-sm">
            <CardContent className="p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">156</div>
              <div className="text-sm text-gray-500">활성 방</div>
              <div className="w-full bg-blue-100 rounded-full h-1 mt-2">
                <div className="bg-blue-500 h-1 rounded-full w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Featured Categories - Mobile Optimized */}
        <div className="space-y-3">
          <h3 className="font-bold text-gray-800">카테고리별 인기 모임</h3>
          <div className="space-y-2">
            {[
              { icon: '🍻', title: '술모임', count: 47, color: 'from-orange-400 to-red-500' },
              { icon: '💪', title: '운동모임', count: 32, color: 'from-green-400 to-emerald-500' },
              { icon: '☕', title: '카페모임', count: 28, color: 'from-purple-400 to-pink-500' }
            ].map((category, index) => (
              <Card key={index} className="border-0 shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-10 h-10 bg-gradient-to-r ${category.color} rounded-xl flex items-center justify-center`}>
                        <span className="text-lg">{category.icon}</span>
                      </div>
                      <div>
                        <div className="font-semibold text-gray-800">{category.title}</div>
                        <div className="text-sm text-gray-500">{category.count}개 활성 방</div>
                      </div>
                    </div>
                    <ChevronDown className="h-5 w-5 text-gray-400 rotate-270" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mobile CTA */}
        <div className="md:hidden">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0">
            <CardContent className="p-4 text-center">
              <div className="space-y-3">
                <div className="text-lg font-bold">🎉 첫 가입 특혜</div>
                <div className="text-sm opacity-90">프리미엄 기능 3일 무료!</div>
                <PremiumButton 
                  variant="glass"
                  className="w-full bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  <Smartphone className="h-4 w-4 mr-2" />
                  지금 시작하기
                </PremiumButton>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Bottom Safe Area */}
        <div className="h-6 md:hidden"></div>
      </div>

      {/* Desktop Content */}
      <div className="hidden md:block">
        {children}
      </div>
    </div>
  )
}

export default MobileOptimizedLayout