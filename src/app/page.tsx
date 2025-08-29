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

  const handleCTAClick = (action: string) => {
    trackFeatureUsage('ENABLE_RECOMMENDATION_SLIDER', action)
    router.push('/map')
  }

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_ROOMS.length)
    trackFeatureUsage('ENABLE_RECOMMENDATION_SLIDER', 'manual_next')
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_ROOMS.length) % FEATURED_ROOMS.length)
    trackFeatureUsage('ENABLE_RECOMMENDATION_SLIDER', 'manual_prev')
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
          <div className="space-y-6">
            <div className="mx-auto w-24 h-24 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform duration-300">
              <span className="text-4xl animate-bounce">📍</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold">
              <span className="bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600 bg-clip-text text-transparent">
                밋핀
              </span>
            </h1>
            <p className="text-2xl md:text-3xl text-gray-700 dark:text-gray-300 font-semibold">
              핀 찍고, 지금 모여요!
            </p>
          </div>

          {/* Description */}
          <div className="max-w-3xl mx-auto space-y-4">
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              🗺️ <strong>지도에서 방을 만들어</strong> 근처 사람들과 만나고
            </p>
            <p className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed">
              💫 <strong>새로운 인연과 추억</strong>을 만들어보세요
            </p>
            <p className="text-lg text-gray-500 dark:text-gray-400">
              술 🍻 | 운동 💪 | 취미 ✨ 모든 모임이 가능해요
            </p>
          </div>

          {/* Enhanced CTA Buttons */}
          {user ? (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button
                onClick={() => handleCTAClick('find_meetups')}
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-200"
              >
                🗺️ 지금 모임 시작하기
              </Button>
              <Button
                onClick={() => router.push('/room/new')}
                variant="outline"
                size="lg"
                className="border-2 border-purple-300 hover:border-purple-500 text-purple-700 hover:text-purple-900 dark:border-purple-600 dark:text-purple-400 dark:hover:text-purple-300 px-12 py-6 text-xl font-bold hover:bg-purple-50 dark:hover:bg-purple-900/20 transition-all duration-200"
              >
                ✨ 새 모임 만들기
              </Button>
            </div>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-12">
              <Button
                asChild
                size="lg"
                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-12 py-6 text-xl font-bold shadow-2xl hover:scale-105 transition-all duration-200"
              >
                <Link href="/auth/signup">
                  🚀 지금 시작하기
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-2 border-gray-300 hover:border-emerald-500 text-gray-700 hover:text-emerald-600 dark:border-gray-600 dark:text-gray-300 dark:hover:text-emerald-400 px-12 py-6 text-xl font-bold hover:bg-white/50 dark:hover:bg-gray-800/50 transition-all duration-200"
              >
                <Link href="/map">
                  👀 방 둘러보기
                </Link>
              </Button>
            </div>
          )}
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
                    onClick={() => handleCTAClick(`view_room_${FEATURED_ROOMS[currentSlide].id}`)}
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
      <section className="container mx-auto px-4 py-16">
        <h2 className="text-4xl font-bold text-center mb-16 text-gray-800 dark:text-gray-200">
          어떤 모임을 만날까요? 🤔
        </h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[
            {
              emoji: '🍻',
              title: '술 모임',
              desc: '맛있는 술과 안주를 함께 즐기며 새로운 친구를 만나보세요',
              color: 'from-amber-400 to-orange-500',
              bgColor: 'bg-amber-50 dark:bg-amber-900/20'
            },
            {
              emoji: '💪',
              title: '운동 모임',
              desc: '헬스, 러닝, 클라이밍 등 건강한 운동을 함께 해요',
              color: 'from-red-400 to-red-600',
              bgColor: 'bg-red-50 dark:bg-red-900/20'
            },
            {
              emoji: '✨',
              title: '기타 모임',
              desc: '영화, 카페, 쇼핑 등 다양한 취미와 관심사를 공유해요',
              color: 'from-purple-400 to-purple-600',
              bgColor: 'bg-purple-50 dark:bg-purple-900/20'
            }
          ].map((category) => (
            <Card key={category.title} className={`${category.bgColor} border-0 shadow-lg hover:shadow-2xl transition-all transform hover:scale-105 duration-300`}>
              <CardContent className="p-8 text-center space-y-6">
                <div className={`w-20 h-20 bg-gradient-to-br ${category.color} rounded-full mx-auto flex items-center justify-center text-3xl shadow-lg`}>
                  {category.emoji}
                </div>
                <h3 className="text-2xl font-bold text-gray-800 dark:text-gray-200">
                  {category.title}
                </h3>
                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                  {category.desc}
                </p>
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
      <footer className="bg-gray-900 dark:bg-gray-950 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="text-center space-y-8">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center shadow-lg">
                <span className="text-2xl">📍</span>
              </div>
              <span className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">밋핀</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-gray-300">
              <Link href="/legal/terms" className="hover:text-emerald-400 transition-colors">
                이용약관
              </Link>
              <Link href="/legal/privacy" className="hover:text-emerald-400 transition-colors">
                개인정보처리방침
              </Link>
              <Link href="/legal/location" className="hover:text-emerald-400 transition-colors">
                위치정보이용약관
              </Link>
            </div>
            
            <div className="text-gray-400 text-sm">
              © 2024 밋핀(MeetPin). Made with ❤️ for better connections
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}