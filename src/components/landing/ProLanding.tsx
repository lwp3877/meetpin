'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Users from 'lucide-react/dist/esm/icons/users'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Shield from 'lucide-react/dist/esm/icons/shield'
import Star from 'lucide-react/dist/esm/icons/star'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'
import CheckCircle from 'lucide-react/dist/esm/icons/check-circle'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'

// 실제 서울 지역 기반 리얼 모임 데이터
const LIVE_ROOMS = [
  {
    id: '1',
    title: '강남역 퇴근 후 맥주 한잔 🍺',
    category: 'drink',
    location: '강남역 2번 출구 펍',
    time: '오늘 저녁 7:30',
    participants: 4,
    maxParticipants: 8,
    host: '민수',
    hostAge: 28,
    tags: ['직장인', '20대', '소주맥주'],
    distance: '0.3km',
    fee: 0,
    image: '/api/placeholder/400/300'
  },
  {
    id: '2',
    title: '한강 야경 러닝 크루 🏃',
    category: 'exercise',
    location: '반포 한강공원',
    time: '내일 아침 6:30',
    participants: 12,
    maxParticipants: 20,
    host: '수진',
    hostAge: 32,
    tags: ['러닝', '초보환영', '건강'],
    distance: '1.2km',
    fee: 0,
    image: '/api/placeholder/400/300'
  },
  {
    id: '3',
    title: '홍대 보드게임 카페 모임 🎲',
    category: 'hobby',
    location: '홍대입구역 근처',
    time: '토요일 오후 2시',
    participants: 6,
    maxParticipants: 10,
    host: '지훈',
    hostAge: 25,
    tags: ['보드게임', '친목', '주말'],
    distance: '2.1km',
    fee: 15000,
    image: '/api/placeholder/400/300'
  },
  {
    id: '4',
    title: '압구정 와인바 소셜 🍷',
    category: 'drink',
    location: '압구정 로데오거리',
    time: '금요일 저녁 8시',
    participants: 5,
    maxParticipants: 12,
    host: '예린',
    hostAge: 30,
    tags: ['와인', '30대', '감성'],
    distance: '3.5km',
    fee: 50000,
    image: '/api/placeholder/400/300'
  },
  {
    id: '5',
    title: '망원동 클라이밍 같이해요 🧗',
    category: 'exercise',
    location: '망원동 클라이밍장',
    time: '수요일 저녁 7시',
    participants: 3,
    maxParticipants: 6,
    host: '태윤',
    hostAge: 27,
    tags: ['클라이밍', '초보가능', '운동'],
    distance: '4.2km',
    fee: 20000,
    image: '/api/placeholder/400/300'
  },
  {
    id: '6',
    title: '성수동 카페 북클럽 📚',
    category: 'hobby',
    location: '성수동 브루클린 카페',
    time: '일요일 오후 3시',
    participants: 8,
    maxParticipants: 15,
    host: '서연',
    hostAge: 29,
    tags: ['독서', '카페', '토론'],
    distance: '5.0km',
    fee: 10000,
    image: '/api/placeholder/400/300'
  },
]

const TRUST_FEATURES = [
  {
    icon: Shield,
    title: '안전한 만남',
    description: '신원 확인과 리뷰 시스템으로 안전하게',
    stat: '99.8% 안전도'
  },
  {
    icon: Users,
    title: '활발한 커뮤니티',
    description: '매일 새로운 사람들과 만나요',
    stat: '3,200+ 활동회원'
  },
  {
    icon: Star,
    title: '높은 만족도',
    description: '실제 사용자들의 평가',
    stat: '평균 4.8/5점'
  },
  {
    icon: TrendingUp,
    title: '재참여율',
    description: '한번 온 사람은 또 와요',
    stat: '94% 재참여'
  },
]

const USER_REVIEWS = [
  {
    name: '김민준',
    age: 28,
    review: '퇴근 후 혼자 있기 싫을 때 딱이에요. 같은 관심사 가진 사람들 만나서 너무 좋아요!',
    rating: 5,
    category: '술모임'
  },
  {
    name: '이서윤',
    age: 32,
    review: '러닝 크루 찾다가 밋핀 알게 됐는데, 이제 매주 한강에서 달려요. 건강도 챙기고 친구도 생기고!',
    rating: 5,
    category: '운동'
  },
  {
    name: '박지훈',
    age: 25,
    review: '취미 생활 하면서 새로운 사람들 만나는게 이렇게 쉬울 줄 몰랐어요. 강추!',
    rating: 5,
    category: '취미'
  },
]

export default function ProLanding() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)
  const [activeCategory, setActiveCategory] = useState<string>('all')

  useEffect(() => {
    setMounted(true)
  }, [])

  const filteredRooms = activeCategory === 'all'
    ? LIVE_ROOMS
    : LIVE_ROOMS.filter(room => room.category === activeCategory)

  const handleGetStarted = () => {
    if (user) {
      router.push('/map')
    } else {
      router.push('/auth/signup')
    }
  }

  const handleExploreMap = () => {
    router.push('/map')
  }

  const handleRoomClick = (roomId: string) => {
    router.push(`/room/${roomId}`)
  }

  if (!mounted) return null

  return (
    <div className="min-h-screen bg-white">
      {/* 헤더 - 심플하고 깔끔하게 */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button onClick={() => router.push('/')} className="flex items-center space-x-2 group">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-emerald-700 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform">
                <MapPin className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-emerald-700 bg-clip-text text-transparent">
                밋핀
              </span>
            </button>

            <div className="flex items-center space-x-3">
              {user ? (
                <button
                  onClick={() => router.push('/map')}
                  className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
                >
                  지도 보기
                </button>
              ) : (
                <>
                  <button
                    onClick={() => router.push('/auth/login')}
                    className="px-4 py-2 text-gray-600 hover:text-primary-600 font-medium transition-colors"
                  >
                    로그인
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-2.5 bg-gradient-to-r from-primary-600 to-emerald-700 text-white rounded-full font-semibold hover:shadow-lg hover:scale-105 transition-all"
                  >
                    시작하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 - 강력한 첫인상 */}
      <section className="relative overflow-hidden bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 pt-20 pb-32">
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="text-center max-w-4xl mx-auto">
            {/* 라이브 뱃지 */}
            <div className="inline-flex items-center space-x-2 bg-white shadow-sm px-4 py-2 rounded-full mb-8 border border-primary-100">
              <div className="w-2 h-2 bg-primary-600 rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-gray-700">
                지금 <span className="text-primary-600 font-bold">127개 모임</span>이 진행중이에요
              </span>
            </div>

            {/* 메인 헤드라인 */}
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
              내 주변에서
              <br />
              <span className="bg-gradient-to-r from-primary-600 via-emerald-700 to-teal-700 bg-clip-text text-transparent">
                바로 만나요
              </span>
            </h1>

            <p className="text-xl sm:text-2xl text-gray-600 mb-10 leading-relaxed">
              술 한잔, 운동, 취미까지<br className="sm:hidden" />
              <span className="font-semibold text-primary-600">오늘 바로 만날 수 있어요</span>
            </p>

            {/* CTA 버튼 */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12">
              <button
                onClick={handleGetStarted}
                className="w-full sm:w-auto group px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-700 text-white rounded-full font-bold text-lg hover:shadow-2xl hover:scale-105 transition-all flex items-center justify-center space-x-2"
              >
                <span>무료로 시작하기</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </button>
              <button
                onClick={handleExploreMap}
                className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-full font-bold text-lg hover:shadow-xl transition-all border-2 border-gray-200 flex items-center justify-center space-x-2"
              >
                <MapPin className="w-5 h-5 text-primary-600" />
                <span>지도에서 둘러보기</span>
              </button>
            </div>

            {/* 소셜 프루프 */}
            <div className="flex flex-wrap items-center justify-center gap-8 text-sm text-gray-600">
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-600" />
                <span className="font-medium">신용카드 필요 없음</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-primary-600" />
                <span className="font-medium">3,200+ 활동 회원</span>
              </div>
              <div className="flex items-center space-x-2">
                <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                <span className="font-medium">평균 4.8점 만족도</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 실시간 모임 섹션 - 가장 중요! */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              🔥 지금 열리는 모임
            </h2>
            <p className="text-xl text-gray-600">
              실제로 오늘 만날 수 있는 모임들이에요
            </p>
          </div>

          {/* 카테고리 필터 */}
          <div className="flex justify-center mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 space-x-1">
              <button
                onClick={() => setActiveCategory('all')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === 'all'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                전체
              </button>
              <button
                onClick={() => setActiveCategory('drink')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === 'drink'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🍺 술모임
              </button>
              <button
                onClick={() => setActiveCategory('exercise')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === 'exercise'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                💪 운동
              </button>
              <button
                onClick={() => setActiveCategory('hobby')}
                className={`px-6 py-2 rounded-full font-medium transition-all ${
                  activeCategory === 'hobby'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                🎨 취미
              </button>
            </div>
          </div>

          {/* 모임 카드 그리드 */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {filteredRooms.map((room) => (
              <div
                key={room.id}
                onClick={() => handleRoomClick(room.id)}
                className="group bg-white rounded-2xl border-2 border-gray-100 hover:border-primary-600 p-6 cursor-pointer hover:shadow-xl transition-all transform hover:-translate-y-1"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex-1 group-hover:text-primary-600 transition-colors">
                    {room.title}
                  </h3>
                  <span className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-sm font-semibold">
                    {room.participants}/{room.maxParticipants}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-primary-600 flex-shrink-0" />
                    <span className="truncate">{room.location}</span>
                    <span className="ml-auto text-xs text-gray-500">{room.distance}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Clock className="w-4 h-4 mr-2 text-blue-600 flex-shrink-0" />
                    <span>{room.time}</span>
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Users className="w-4 h-4 mr-2 text-purple-600 flex-shrink-0" />
                    <span>{room.host} • {room.hostAge}세</span>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {room.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs font-medium"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                  <span className="text-sm font-semibold text-gray-900">
                    {room.fee === 0 ? '무료' : `₩${room.fee.toLocaleString()}`}
                  </span>
                  <ChevronRight className="w-5 h-5 text-primary-700 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleExploreMap}
              className="px-8 py-4 bg-gradient-to-r from-primary-600 to-emerald-700 text-white rounded-full font-bold text-lg hover:shadow-xl hover:scale-105 transition-all inline-flex items-center space-x-2"
            >
              <span>지도에서 더 많은 모임 보기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* 신뢰 요소 */}
      <section className="py-20 bg-gradient-to-br from-gray-50 to-green-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {TRUST_FEATURES.map((feature, idx) => {
              const Icon = feature.icon
              return (
                <div key={idx} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary-600 to-emerald-700 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                    <Icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-3">
                    {feature.description}
                  </p>
                  <p className="text-2xl font-bold text-primary-600">
                    {feature.stat}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* 실제 사용자 후기 */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              이미 3,200명이 경험했어요
            </h2>
            <p className="text-xl text-gray-600">
              실제 사용자들의 생생한 후기
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {USER_REVIEWS.map((review, idx) => (
              <div key={idx} className="bg-white rounded-2xl border-2 border-gray-100 p-6 hover:shadow-lg transition-all">
                <div className="flex items-center space-x-1 mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                  ))}
                </div>
                <p className="text-gray-700 mb-4 leading-relaxed">
                  "{review.review}"
                </p>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-sm text-gray-500">{review.age}세 • {review.category}</p>
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-primary-600 to-emerald-700 rounded-full flex items-center justify-center text-white font-bold">
                    {review.name[0]}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-24 bg-gradient-to-br from-primary-600 via-emerald-600 to-teal-600 relative overflow-hidden">
        <div className="absolute inset-0 bg-grid-pattern opacity-10"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            오늘 바로 만나보세요
          </h2>
          <p className="text-xl text-primary-100 mb-10">
            회원가입 30초면 끝. 지금 바로 내 주변 모임을 찾아보세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-10 py-5 bg-white text-primary-600 rounded-full font-bold text-xl hover:bg-gray-100 transition-all transform hover:scale-105 shadow-2xl flex items-center justify-center space-x-2"
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-primary-100">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>신용카드 불필요</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>언제든 취소 가능</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">서비스</h4>
              <ul className="space-y-2">
                <li><button onClick={() => router.push('/map')} className="hover:text-primary-500 transition-colors">모임 찾기</button></li>
                <li><button onClick={() => router.push('/room/new')} className="hover:text-primary-500 transition-colors">모임 만들기</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">고객지원</h4>
              <ul className="space-y-2">
                <li><button onClick={() => router.push('/help')} className="hover:text-primary-500 transition-colors">도움말</button></li>
                <li><button onClick={() => router.push('/contact')} className="hover:text-primary-500 transition-colors">문의하기</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">법적고지</h4>
              <ul className="space-y-2">
                <li><button onClick={() => router.push('/legal/terms')} className="hover:text-primary-500 transition-colors">이용약관</button></li>
                <li><button onClick={() => router.push('/legal/privacy')} className="hover:text-primary-500 transition-colors">개인정보처리방침</button></li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">밋핀</h4>
              <p className="text-sm mb-4">내 주변에서 바로 만나요</p>
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-600 to-emerald-700 rounded-lg flex items-center justify-center">
                  <MapPin className="w-5 h-5 text-white" />
                </div>
                <span className="text-white font-bold">밋핀</span>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-8 text-center text-sm">
            <p>&copy; 2025 밋핀(MeetPin). All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}