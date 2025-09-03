/* 파일경로: src/app/page.tsx */
'use client'

import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { OnboardingModal } from '@/components/onboarding-modal'
import { ThemeToggle } from '@/components/theme-toggle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ChevronLeft, ChevronRight, MapPin, Users, Calendar, Star } from 'lucide-react'
import { isFeatureEnabled, trackFeatureUsage } from '@/lib/features'

// Mock data for recommendation slider
const FEATURED_ROOMS = [
  {
    id: '1',
    title: '🍻 강남 맛집 호핑',
    category: 'drink',
    location: '강남역 2번 출구',
    participants: 3,
    maxParticipants: 4,
    fee: 50000,
    time: '오늘 19:00',
    host: '미나💕',
    isBoost: true,
    rating: 4.8
  },
  {
    id: '2', 
    title: '💪 한강 러닝 모임',
    category: 'exercise',
    location: '반포 한강공원',
    participants: 4,
    maxParticipants: 6,
    fee: 0,
    time: '내일 08:00',
    host: '지훈💪',
    isBoost: false,
    rating: 4.9
  },
  {
    id: '3',
    title: '☕ 홍대 감성카페 투어',
    category: 'other',
    location: '홍익대학교 정문',
    participants: 2,
    maxParticipants: 3,
    fee: 20000,
    time: '이번 주말',
    host: '소영☕',
    isBoost: false,
    rating: 4.7
  }
]

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [showWelcome, setShowWelcome] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)

  useEffect(() => {
    setShowWelcome(true)
  }, [])

  useEffect(() => {
    if (!isFeatureEnabled('ENABLE_RECOMMENDATION_SLIDER')) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % FEATURED_ROOMS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleCTAClick = () => {
    trackFeatureUsage()
    router.push('/map')
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_ROOMS.length)
    trackFeatureUsage()
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_ROOMS.length) % FEATURED_ROOMS.length)
    trackFeatureUsage()
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-purple-900/30 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center animate-pulse shadow-2xl">
            <span className="text-2xl">📍</span>
          </div>
          <div className="text-lg text-gray-600 dark:text-gray-300">밋핀 로딩 중...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/20 via-blue-500/10 to-purple-500/20 dark:from-emerald-900/30 dark:via-blue-900/20 dark:to-purple-900/30">
      {/* Onboarding Modal */}
      <OnboardingModal />

      {/* Navigation */}
      <nav className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-700/50 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-xl">📍</span>
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                밋핀
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              {user ? (
                <>
                  <div className="flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-900/30 rounded-full px-4 py-2">
                    <div className="w-6 h-6 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center text-xs text-white font-bold shadow">
                      {user.email?.[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-emerald-700 dark:text-emerald-300">
                      {user.email?.split('@')[0]}
                    </span>
                  </div>
                  <Button
                    onClick={() => router.push('/map')}
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg"
                  >
                    지도 보기
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={() => router.push('/profile')}
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100"
                  >
                    내 정보
                  </Button>
                </>
              ) : (
                <>
                  <Link 
                    href="/auth/login"
                    className="text-gray-600 hover:text-gray-800 dark:text-gray-300 dark:hover:text-gray-100 font-medium transition-colors"
                  >
                    로그인
                  </Link>
                  <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg">
                    <Link href="/auth/signup">
                      회원가입
                    </Link>
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className={`space-y-8 transform transition-all duration-1000 ${showWelcome ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {user && (
            <Card className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm border-0 shadow-2xl max-w-md mx-auto">
              <CardContent className="p-6">
                <div className="text-emerald-600 dark:text-emerald-400 text-lg font-semibold mb-2">
                  안녕하세요! 👋
                </div>
                <div className="text-gray-700 dark:text-gray-300 text-sm">
                  오늘도 새로운 만남을 찾아보세요
                </div>
              </CardContent>
            </Card>
          )}

          {/* Logo & Title */}
          <div className="space-y-8 relative">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-transparent to-purple-500/10 rounded-3xl blur-3xl"></div>
            
            <div className="relative z-10 mx-auto w-28 h-28 bg-gradient-to-br from-emerald-400 via-teal-500 to-emerald-600 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-500 ring-4 ring-white/20 dark:ring-gray-800/20">
              <span className="text-5xl animate-bounce filter drop-shadow-lg">📍</span>
            </div>
            
            <div className="relative z-10">
              <h1 className="text-6xl md:text-8xl font-black tracking-tight">
                <span className="bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500 bg-clip-text text-transparent drop-shadow-sm">
                  밋핀
                </span>
              </h1>
              <div className="mt-4 text-2xl md:text-4xl font-bold">
                <span className="bg-gradient-to-r from-gray-700 to-gray-500 dark:from-gray-200 dark:to-gray-400 bg-clip-text text-transparent">
                  핀 찍고, 
                </span>
                <span className="ml-2 bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  지금 모여요!
                </span>
              </div>
              <div className="mt-6 text-lg md:text-xl text-gray-600 dark:text-gray-400 font-medium">
                ✨ 새로운 인연을 위한 위치 기반 만남 서비스
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="max-w-4xl mx-auto">
            <div className="grid md:grid-cols-2 gap-6 md:gap-8">
              <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-900/20 dark:to-teal-900/20 border-emerald-200 dark:border-emerald-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">🗺️</div>
                  <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-300">지도에서 방을 만들어</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    원하는 장소에 핀을 찍고<br />근처 사람들과 연결되세요
                  </p>
                </CardContent>
              </Card>
              
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border-purple-200 dark:border-purple-800 shadow-lg hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6 text-center space-y-3">
                  <div className="text-4xl">💫</div>
                  <h3 className="text-lg font-bold text-purple-700 dark:text-purple-300">새로운 인연과 추억</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">
                    소중한 만남을 통해<br />특별한 순간들을 만들어보세요
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mt-8">
              <div className="flex flex-wrap justify-center gap-3">
                <Badge variant="secondary" className="text-base px-4 py-2 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-700">
                  🍻 술 모임
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 border-red-300 dark:border-red-700">
                  💪 운동 모임
                </Badge>
                <Badge variant="secondary" className="text-base px-4 py-2 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border-purple-300 dark:border-purple-700">
                  ✨ 취미 모임
                </Badge>
              </div>
              <p className="text-center text-gray-500 dark:text-gray-400 mt-3 text-sm">
                모든 종류의 모임이 가능해요
              </p>
            </div>
          </div>

          {/* Enhanced CTA Buttons */}
          <div className="mt-12 space-y-6">
            {user ? (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  onClick={handleCTAClick}
                  size="lg"
                  className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 rounded-full"
                >
                  <span className="flex items-center gap-2">
                    🗺️ 지금 모임 찾기
                    <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </Button>
                <Button
                  onClick={() => router.push('/room/new')}
                  variant="outline"
                  size="lg"
                  className="group relative border-2 border-purple-300 hover:border-purple-500 text-purple-700 hover:text-white hover:bg-purple-500 dark:border-purple-600 dark:text-purple-400 dark:hover:text-white dark:hover:bg-purple-600 px-12 py-4 text-lg font-bold transition-all duration-300 rounded-full backdrop-blur-sm"
                >
                  <span className="flex items-center gap-2">
                    ✨ 새 모임 만들기
                    <span className="group-hover:rotate-12 transition-transform">+</span>
                  </span>
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button
                  asChild
                  size="lg"
                  className="group relative bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-4 text-lg font-bold shadow-2xl hover:shadow-emerald-500/25 hover:scale-105 transition-all duration-300 rounded-full"
                >
                  <Link href="/auth/signup">
                    <span className="flex items-center gap-2">
                      🚀 지금 시작하기
                      <span className="group-hover:translate-x-1 transition-transform">→</span>
                    </span>
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="group relative border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 dark:border-gray-600 dark:text-gray-300 dark:hover:text-emerald-400 px-12 py-4 text-lg font-bold hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-300 rounded-full backdrop-blur-sm"
                >
                  <Link href="/map">
                    <span className="flex items-center gap-2">
                      👀 방 둘러보기
                      <span className="group-hover:scale-110 transition-transform">👁️</span>
                    </span>
                  </Link>
                </Button>
              </div>
            )}
            
            {/* Trust indicators */}
            <div className="flex justify-center items-center gap-8 text-sm text-gray-500 dark:text-gray-400 mt-8">
              <div className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                안전한 만남
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-500">✓</span>
                실시간 채팅
              </div>
              <div className="flex items-center gap-2">
                <span className="text-purple-500">✓</span>
                위치 기반 매칭
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Slider */}
      {isFeatureEnabled('ENABLE_RECOMMENDATION_SLIDER') && (
        <section className="container mx-auto px-4 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-gray-200 mb-4">
              🔥 지금 인기 있는 방
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              다른 사람들이 참여하고 있는 인기 모임들을 확인해보세요
            </p>
          </div>

          <div className="relative max-w-md mx-auto">
            <Card className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm border-0 shadow-2xl overflow-hidden">
              <CardContent className="p-0">
                <div className="relative aspect-[4/3] bg-gradient-to-br from-emerald-500/20 to-teal-500/20 dark:from-emerald-800/30 dark:to-teal-800/30 p-6 flex flex-col justify-between">
                  {/* Boost Badge */}
                  {FEATURED_ROOMS[currentSlide].isBoost && (
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-gradient-to-r from-yellow-500 to-amber-500 text-white shadow-lg">
                        <Star className="h-3 w-3 mr-1" />
                        부스트
                      </Badge>
                    </div>
                  )}

                  {/* Category Badge */}
                  <div className="flex justify-between items-start">
                    <Badge variant="secondary" className="bg-white/90 dark:bg-gray-800/90 text-gray-800 dark:text-gray-200">
                      {FEATURED_ROOMS[currentSlide].category === 'drink' ? '🍻 술' :
                       FEATURED_ROOMS[currentSlide].category === 'exercise' ? '💪 운동' : '✨ 기타'}
                    </Badge>
                    <div className="flex items-center text-yellow-500">
                      <Star className="h-4 w-4 fill-current" />
                      <span className="ml-1 text-sm font-semibold">
                        {FEATURED_ROOMS[currentSlide].rating}
                      </span>
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">
                    {FEATURED_ROOMS[currentSlide].title}
                  </h3>
                </div>

                <div className="p-6 space-y-4">
                  {/* Location & Time */}
                  <div className="space-y-2">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4 mr-2 text-emerald-500" />
                      <span className="text-sm">{FEATURED_ROOMS[currentSlide].location}</span>
                    </div>
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4 mr-2 text-blue-500" />
                      <span className="text-sm">{FEATURED_ROOMS[currentSlide].time}</span>
                    </div>
                  </div>

                  {/* Stats */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center text-gray-600 dark:text-gray-400">
                      <Users className="h-4 w-4 mr-2 text-purple-500" />
                      <span className="text-sm">
                        {FEATURED_ROOMS[currentSlide].participants}/{FEATURED_ROOMS[currentSlide].maxParticipants}명 참여
                      </span>
                    </div>
                    <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                      {FEATURED_ROOMS[currentSlide].fee === 0 ? '무료' : `${FEATURED_ROOMS[currentSlide].fee.toLocaleString()}원`}
                    </div>
                  </div>

                  {/* Host */}
                  <div className="text-center pt-2 border-t border-gray-200 dark:border-gray-700">
                    <span className="text-sm text-gray-500 dark:text-gray-400">호스트: </span>
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                      {FEATURED_ROOMS[currentSlide].host}
                    </span>
                  </div>

                  {/* CTA */}
                  <Button 
                    onClick={handleCTAClick}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white"
                  >
                    참여하러 가기
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Navigation */}
            <Button
              variant="ghost"
              size="sm"
              onClick={prevSlide}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-full p-2"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextSlide}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/90 dark:bg-gray-800/90 hover:bg-white dark:hover:bg-gray-800 shadow-lg rounded-full p-2"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>

            {/* Dots */}
            <div className="flex justify-center mt-6 space-x-2">
              {FEATURED_ROOMS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    index === currentSlide ? 'bg-emerald-500' : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="text-center mb-16 space-y-4">
          <h2 className="text-4xl md:text-5xl font-black text-gray-800 dark:text-gray-200">
            어떤 모임을 만날까요? 🤔
          </h2>
          <p className="text-xl text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            다양한 카테고리의 모임에서 당신만의 특별한 순간을 찾아보세요
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {[
            {
              emoji: '🍻',
              title: '술 모임',
              desc: '맛있는 술과 안주를 함께 즐기며 새로운 친구를 만나보세요',
              color: 'from-amber-400 to-orange-500',
              bgColor: 'bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/20 dark:to-orange-900/20',
              hoverColor: 'hover:from-amber-100 hover:to-orange-100 dark:hover:from-amber-900/30 dark:hover:to-orange-900/30',
              examples: ['맥주 한 잔', '와인 테이스팅', '칵테일 바']
            },
            {
              emoji: '💪',
              title: '운동 모임',
              desc: '헬스, 러닝, 클라이밍 등 건강한 운동을 함께 해요',
              color: 'from-red-400 to-red-600',
              bgColor: 'bg-gradient-to-br from-red-50 to-pink-50 dark:from-red-900/20 dark:to-pink-900/20',
              hoverColor: 'hover:from-red-100 hover:to-pink-100 dark:hover:from-red-900/30 dark:hover:to-pink-900/30',
              examples: ['헬스장', '한강 러닝', '클라이밍']
            },
            {
              emoji: '✨',
              title: '취미 모임',
              desc: '영화, 카페, 쇼핑 등 다양한 취미와 관심사를 공유해요',
              color: 'from-purple-400 to-purple-600',
              bgColor: 'bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20',
              hoverColor: 'hover:from-purple-100 hover:to-indigo-100 dark:hover:from-purple-900/30 dark:hover:to-indigo-900/30',
              examples: ['영화 관람', '카페 투어', '독서 모임']
            }
          ].map((category) => (
            <Card 
              key={category.title} 
              className={`group ${category.bgColor} ${category.hoverColor} border-0 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 duration-500 cursor-pointer relative overflow-hidden`}
            >
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
              
              <CardContent className="p-8 text-center space-y-6 relative z-10">
                <div className={`w-24 h-24 bg-gradient-to-br ${category.color} rounded-full mx-auto flex items-center justify-center text-4xl shadow-2xl group-hover:rotate-12 group-hover:scale-110 transition-all duration-500`}>
                  {category.emoji}
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200 group-hover:text-gray-900 dark:group-hover:text-gray-100 transition-colors">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400 leading-relaxed text-sm">
                    {category.desc}
                  </p>
                </div>
                
                {/* Examples */}
                <div className="space-y-2">
                  <div className="flex flex-wrap justify-center gap-2">
                    {category.examples.map((example) => (
                      <Badge 
                        key={example}
                        variant="secondary"
                        className="text-xs px-2 py-1 bg-white/50 dark:bg-gray-800/50 text-gray-700 dark:text-gray-300 border-0"
                      >
                        {example}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                {/* Action hint */}
                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 pt-2">
                  <span className="text-sm text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1">
                    클릭해서 탐색하기 <span className="group-hover:translate-x-1 transition-transform">→</span>
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm py-20">
        <div className="container mx-auto px-4">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">
            이렇게 만나요! 🚀
          </h2>
          <div className="grid md:grid-cols-4 gap-8">
            {[
              { 
                step: '1', 
                emoji: '📍',
                title: '위치 찾기', 
                desc: '지도에서 만날 장소를 핀으로 찍어보세요',
                color: 'from-blue-400 to-blue-600'
              },
              { 
                step: '2', 
                emoji: '🏠',
                title: '방 만들기', 
                desc: '모임 정보를 입력하고 방을 생성하세요',
                color: 'from-green-400 to-green-600'
              },
              { 
                step: '3', 
                emoji: '✋',
                title: '참가 신청', 
                desc: '마음에 드는 모임에 참가 신청을 보내세요',
                color: 'from-purple-400 to-purple-600'
              },
              { 
                step: '4', 
                emoji: '💬',
                title: '채팅하기', 
                desc: '수락되면 1:1 채팅으로 자세한 내용을 나눠요',
                color: 'from-pink-400 to-pink-600'
              },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-6 group">
                <div className={`w-16 h-16 bg-gradient-to-br ${item.color} text-white rounded-full mx-auto flex items-center justify-center font-bold text-2xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                  {item.emoji}
                </div>
                <h3 className="text-xl font-bold text-gray-800 dark:text-gray-200">{item.title}</h3>
                <p className="text-gray-600 dark:text-gray-400 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="bg-gradient-to-r from-emerald-500 to-teal-500 py-16">
        <div className="container mx-auto px-4 text-center">
          <div className="grid md:grid-cols-3 gap-8 text-white">
            <div className="space-y-2">
              <div className="text-4xl font-bold">1,000+</div>
              <div className="text-lg opacity-90">활성 사용자</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">5,000+</div>
              <div className="text-lg opacity-90">성공한 모임</div>
            </div>
            <div className="space-y-2">
              <div className="text-4xl font-bold">50+</div>
              <div className="text-lg opacity-90">서울 전 지역</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-br from-gray-900 via-gray-900 to-emerald-950 dark:from-gray-950 dark:via-gray-950 dark:to-emerald-950 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Brand Section */}
            <div className="text-center md:text-left space-y-4">
              <div className="flex items-center justify-center md:justify-start space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                  <span className="text-2xl">📍</span>
                </div>
                <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">밋핀</span>
              </div>
              <p className="text-gray-400 text-sm max-w-xs mx-auto md:mx-0">
                새로운 인연을 위한 위치 기반 만남 서비스
              </p>
              <div className="flex justify-center md:justify-start space-x-2">
                <Badge variant="secondary" className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                  안전한 만남
                </Badge>
                <Badge variant="secondary" className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                  실시간 채팅
                </Badge>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="text-center space-y-4">
              <h3 className="text-lg font-semibold text-gray-200">빠른 링크</h3>
              <div className="space-y-2">
                <Link href="/map" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  지도에서 모임 찾기
                </Link>
                <Link href="/room/new" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  새 모임 만들기
                </Link>
                <Link href="/profile" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  내 프로필
                </Link>
              </div>
            </div>
            
            {/* Company & Support Links */}
            <div className="text-center md:text-right space-y-4">
              <h3 className="text-lg font-semibold text-gray-200">회사 & 지원</h3>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  회사 소개
                </Link>
                <Link href="/help" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  도움말 & FAQ
                </Link>
                <Link href="/contact" className="block text-gray-400 hover:text-emerald-400 transition-colors">
                  문의하기
                </Link>
                <Link href="/legal/terms" className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  이용약관
                </Link>
                <Link href="/legal/privacy" className="block text-gray-400 hover:text-emerald-400 transition-colors text-sm">
                  개인정보처리방침
                </Link>
              </div>
            </div>
          </div>
          
          {/* Divider */}
          <div className="border-t border-gray-700 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="text-gray-400 text-sm">
                © 2024 밋핀(MeetPin). Made with ❤️ for better connections
              </div>
              <div className="flex items-center space-x-4 text-gray-400 text-sm">
                <span>🌏 Seoul, Korea</span>
                <span>•</span>
                <span>v1.0.0</span>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}