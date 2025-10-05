'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
import { useRouter } from 'next/navigation'
import { isDevelopmentMode } from '@/lib/config/flags'
import MobileOptimizedLayout from '@/components/mobile/mobile-optimized-layout'
import LegalFooter from '@/components/layout/LegalFooter'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Users from 'lucide-react/dist/esm/icons/users'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import Star from 'lucide-react/dist/esm/icons/star'
import ChevronLeft from 'lucide-react/dist/esm/icons/chevron-left'
import ChevronRight from 'lucide-react/dist/esm/icons/chevron-right'
import Sparkles from 'lucide-react/dist/esm/icons/sparkles'
import Zap from 'lucide-react/dist/esm/icons/zap'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import ArrowRight from 'lucide-react/dist/esm/icons/arrow-right'
import Play from 'lucide-react/dist/esm/icons/play'
import Shield from 'lucide-react/dist/esm/icons/shield'
import Globe from 'lucide-react/dist/esm/icons/globe'
import Cpu from 'lucide-react/dist/esm/icons/cpu'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import { logger } from '@/lib/observability/logger'

// 새로운 프리미엄 피처드 룸
const FEATURED_ROOMS = [
  {
    id: '1',
    title: '🥂 시그니엘 서울 스카이 라운지',
    category: 'premium',
    location: '잠실 롯데타워 79층',
    participants: 8,
    maxParticipants: 12,
    fee: 180000,
    time: '오늘 20:00',
    host: '와인 소믈리에 민서',
    isBoost: true,
    isPremium: true,
    rating: 4.9,
    tags: ['시그니엘', '스카이라운지', '프리미엄', '야경'],
    description: '서울에서 가장 높은 곳에서 즐기는 프리미엄 와인 테이스팅과 야경 감상',
    hostAge: '30대 초반',
    joinCount: 47,
    image: '/icons/meetpin.svg',
  },
  {
    id: '2',
    title: '🏌️ 청담 프라이빗 골프 클럽',
    category: 'sport',
    location: '청담동 스크린골프',
    participants: 6,
    maxParticipants: 8,
    fee: 120000,
    time: '내일 14:00',
    host: '골프 프로 태현',
    isBoost: true,
    isPremium: true,
    rating: 4.8,
    tags: ['골프', '청담', '프라이빗', '레슨'],
    description: '프로 골퍼와 함께하는 프라이빗 골프 레슨 & 네트워킹',
    hostAge: '30대 후반',
    joinCount: 32,
    image: '/icons/meetpin.svg',
  },
  {
    id: '3',
    title: '🎨 갤러리아 VIP 아트 투어',
    category: 'culture',
    location: '압구정 갤러리아',
    participants: 4,
    maxParticipants: 8,
    fee: 95000,
    time: '토요일 15:00',
    host: '아트 디렉터 수진',
    isBoost: false,
    isPremium: true,
    rating: 4.9,
    tags: ['아트', 'VIP', '갤러리아', '큐레이션'],
    description: '갤러리아 VIP 라운지에서 진행되는 큐레이터와 함께하는 프라이빗 아트 투어',
    hostAge: '30대 초반',
    joinCount: 28,
    image: '/icons/meetpin.svg',
  },
]

const LUXURY_STATS = [
  { label: '프리미엄 회원', value: '3,200+', icon: Users, color: 'text-purple-400' },
  { label: '럭셔리 모임', value: '1,850+', icon: Calendar, color: 'text-amber-400' },
  { label: '만족도', value: '4.9/5', icon: Star, color: 'text-rose-400' },
  { label: '재참여율', value: '94%', icon: TrendingUp, color: 'text-emerald-400' },
]

const PREMIUM_FEATURES = [
  {
    icon: Shield,
    title: '프리미엄 인증 시스템',
    description: '엄격한 신원 확인과 배경 검증으로 안전한 만남을 보장합니다',
    gradient: 'from-purple-600 via-purple-500 to-indigo-600',
    delay: '0',
  },
  {
    icon: Globe,
    title: '글로벌 럭셔리 네트워크',
    description: '세계 주요 도시의 프리미엄 장소와 독점 파트너십을 제공합니다',
    gradient: 'from-rose-500 via-pink-500 to-rose-600',
    delay: '100',
  },
  {
    icon: Cpu,
    title: 'AI 큐레이션 매칭',
    description: '개인의 취향과 성향을 분석하여 최적의 프리미엄 경험을 추천합니다',
    gradient: 'from-emerald-500 via-teal-500 to-cyan-600',
    delay: '200',
  },
  {
    icon: MessageCircle,
    title: '컨시어지 서비스',
    description: '24/7 전담 컨시어지가 모든 모임을 완벽하게 준비해드립니다',
    gradient: 'from-amber-500 via-orange-500 to-red-500',
    delay: '300',
  },
]

export default function EnhancedLanding() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    // 🚨 강력한 리다이렉트 방지 - 어떤 상황에서도 메인 페이지에서 벗어나지 않도록 함
    if (typeof window === 'undefined') return

    // 개발 모드에서 mock 사용자 데이터가 있지만 랜딩 페이지를 보려는 경우 제거
    if (isDevelopmentMode) {
      const mockUser = localStorage.getItem('meetpin_user')
      if (mockUser) {
        localStorage.removeItem('meetpin_user')
        // 쿠키도 제거
        if (typeof document !== 'undefined') {
          document.cookie = 'meetpin_mock_user=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'
        }
      }
    }

    // 모든 링크 클릭 방지
    document.addEventListener('click', (e) => {
      const target = e.target as HTMLElement
      if (target.tagName === 'A' && target.getAttribute('href') !== '#') {
        e.preventDefault()
        e.stopPropagation()
      }
    })

    // History API 조작 방지
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      logger.info('🚨 [Landing] history.pushState 차단됨', { args })
      return undefined
    }

    window.history.replaceState = function(...args) {
      logger.info('🚨 [Landing] history.replaceState 차단됨', { args })
      return undefined
    }

    // window.location 변경 시도 감지
    const currentPath = window.location.pathname
    const checkLocation = () => {
      if (window.location.pathname !== currentPath) {
        logger.info('🚨 [Landing] 위치 변경 감지됨, 복원', { from: currentPath, to: window.location.pathname })
        window.history.replaceState(null, '', currentPath)
      }
    }

    const locationWatcher = setInterval(checkLocation, 100)

    return () => {
      clearInterval(locationWatcher)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  useEffect(() => {
    setIsVisible(true)

    // 마우스 트래킹 for 인터랙티브 효과
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      })
    }

    window.addEventListener('mousemove', handleMouseMove)

    // 자동 슬라이드
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % FEATURED_ROOMS.length)
    }, 6000)

    return () => {
      clearInterval(interval)
      window.removeEventListener('mousemove', handleMouseMove)
    }
  }, [])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % FEATURED_ROOMS.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + FEATURED_ROOMS.length) % FEATURED_ROOMS.length)
  }

  if (user) {
    // 하이드레이션 안정용: 고정된 skeleton만 노출
    return <div aria-busy="true" className="p-6 text-sm text-neutral-500">이동 중…</div>
  }

  return (
    <MobileOptimizedLayout>
      <div className="relative min-h-screen bg-black text-white overflow-hidden">
        {/* Animated Background */}
        <div className="fixed inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-black to-rose-900/20" />
          <div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-purple-600/30 to-pink-600/30 blur-3xl transition-all duration-1000 ease-out"
            style={{
              left: `${mousePosition.x}%`,
              top: `${mousePosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />
          <div
            className="absolute w-96 h-96 rounded-full bg-gradient-to-r from-emerald-600/20 to-cyan-600/20 blur-3xl transition-all duration-1500 ease-out"
            style={{
              left: `${100 - mousePosition.x}%`,
              top: `${100 - mousePosition.y}%`,
              transform: 'translate(-50%, -50%)',
            }}
          />

          {/* Floating orbs */}
          <div className="absolute top-1/4 left-1/4 w-32 h-32 rounded-full bg-gradient-to-r from-purple-500/10 to-pink-500/10 blur-xl animate-pulse" />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 rounded-full bg-gradient-to-r from-emerald-500/10 to-teal-500/10 blur-xl animate-pulse delay-1000" />
          <div className="absolute top-1/2 right-1/3 w-40 h-40 rounded-full bg-gradient-to-r from-amber-500/5 to-orange-500/5 blur-xl animate-pulse delay-2000" />
        </div>

        {/* Hero Section */}
        <section className="relative z-10 min-h-screen flex items-center justify-center pt-20 pb-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div
              className={`text-center transition-all duration-1500 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
              }`}
            >
              {/* Premium Badge */}
              <div className="inline-flex items-center gap-3 px-6 py-3 mb-8 rounded-full bg-gradient-to-r from-purple-600/20 to-pink-600/20 border border-purple-500/30 backdrop-blur-xl">
                <div className="w-2 h-2 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 animate-pulse" />
                <span className="text-purple-200 font-medium tracking-wide">PREMIUM SOCIAL PLATFORM</span>
                <Sparkles className="w-4 h-4 text-purple-300" />
              </div>

              {/* Main Title with dramatic effect */}
              <div className="mb-8 relative">
                <h1 className="text-8xl md:text-9xl font-black mb-4 relative">
                  <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent bg-[length:200%_100%] animate-gradient">
                    밋핀
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-400/20 via-pink-400/20 to-purple-400/20 blur-2xl -z-10 animate-pulse" />
                </h1>

                <div className="relative">
                  <p className="text-2xl md:text-4xl font-light text-gray-300 mb-6 tracking-wider">
                    럭셔리 소셜 익스피리언스
                  </p>
                  <div className="w-32 h-1 bg-gradient-to-r from-purple-500 to-pink-500 mx-auto rounded-full" />
                </div>
              </div>

              {/* Hero Description */}
              <div className="max-w-3xl mx-auto mb-12">
                <p className="text-xl md:text-2xl leading-relaxed text-gray-300 mb-8">
                  서울의 가장 프리미엄한 장소에서
                  <br />
                  <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent font-semibold">
                    특별한 사람들과의 럭셔리한 만남
                  </span>
                  을 경험하세요
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16">
                <button
                  onClick={() => {
                    logger.info('[DEBUG] 버튼 클릭됨 - 리다이렉트 방지됨')
                    alert('버튼이 클릭되었습니다. 리다이렉트가 비활성화되어 있습니다.')
                  }}
                  className="group relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-lg overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                  <div className="relative flex items-center gap-3">
                    <span>🌟</span>
                    프리미엄 경험 시작하기
                    <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
                  </div>
                </button>

                <button
                  onClick={() => router.push('/auth/signup')}
                  className="group px-8 py-4 bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white/20 hover:scale-105"
                >
                  <div className="flex items-center gap-3">
                    <Play className="w-5 h-5" />
                    데모 체험하기
                  </div>
                </button>
              </div>

              {/* Luxury Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
                {LUXURY_STATS.map((stat, _index) => (
                  <div
                    key={stat.label}
                    className={`transition-all duration-1000 delay-${_index * 150} ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                    }`}
                  >
                    <div className="group relative p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:scale-105">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-600/5 to-pink-600/5 rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                      <div className="relative">
                        <stat.icon className={`w-8 h-8 ${stat.color} mx-auto mb-3`} />
                        <div className="text-2xl font-bold text-white mb-1">{stat.value}</div>
                        <div className="text-sm text-gray-400">{stat.label}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium Rooms Showcase */}
        <section className="relative z-10 py-20 px-6 bg-gradient-to-b from-transparent to-black/50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                독점 프리미엄 모임
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                서울의 가장 럭셔리한 장소에서 진행되는 특별한 경험들
              </p>
            </div>

            <div className="relative">
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-700 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {FEATURED_ROOMS.map((room, _index) => (
                    <div key={room.id} className="w-full flex-shrink-0 px-4">
                      <div className="group relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:bg-white/10">
                        {/* Room Image */}
                        <div className="relative aspect-[16/10] overflow-hidden">
                          <Image
                            src={room.image}
                            alt={room.title}
                            fill
                            className="object-cover transition-transform duration-700 group-hover:scale-110"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                          {/* Premium Badge */}
                          <div className="absolute top-6 left-6">
                            <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full text-white font-bold text-sm">
                              <Sparkles className="w-4 h-4" />
                              PREMIUM
                            </div>
                          </div>

                          {/* Boost Badge */}
                          {room.isBoost && (
                            <div className="absolute top-6 right-6">
                              <div className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full text-white font-bold text-sm">
                                <Zap className="w-4 h-4" />
                                부스트
                              </div>
                            </div>
                          )}

                          {/* Price */}
                          <div className="absolute bottom-6 right-6">
                            <div className="px-4 py-2 bg-black/60 backdrop-blur-xl rounded-xl border border-white/20">
                              <div className="text-2xl font-bold text-white">
                                {room.fee.toLocaleString()}원
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Room Content */}
                        <div className="p-8">
                          <div className="mb-6">
                            <h3 className="text-2xl font-bold text-white mb-3">
                              {room.title}
                            </h3>
                            <p className="text-gray-300 leading-relaxed">
                              {room.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-gray-400 mb-6">
                            <div className="flex items-center gap-6">
                              <div className="flex items-center gap-2">
                                <MapPin className="w-4 h-4" />
                                {room.location}
                              </div>
                              <div className="flex items-center gap-2">
                                <Calendar className="w-4 h-4" />
                                {room.time}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-2 text-amber-400">
                                <Star className="w-5 h-5 fill-current" />
                                <span className="font-bold text-lg">{room.rating}</span>
                              </div>
                              <span className="text-gray-500">•</span>
                              <span className="text-gray-400">
                                {room.joinCount}회 참여
                              </span>
                            </div>

                            <div className="text-right">
                              <div className="text-gray-300">
                                {room.participants}/{room.maxParticipants}명 참여
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 mt-6">
                            {room.tags.map(tag => (
                              <span key={tag} className="px-3 py-1 bg-white/10 backdrop-blur-xl rounded-full text-sm text-gray-300 border border-white/20">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Controls */}
              <button
                onClick={prevSlide}
                className="absolute top-1/2 -left-6 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>

              <button
                onClick={nextSlide}
                className="absolute top-1/2 -right-6 transform -translate-y-1/2 w-12 h-12 bg-white/10 backdrop-blur-xl border border-white/20 rounded-full flex items-center justify-center text-white transition-all duration-300 hover:bg-white/20 hover:scale-110"
              >
                <ChevronRight className="w-6 h-6" />
              </button>

              {/* Slide Indicators */}
              <div className="flex justify-center gap-3 mt-8">
                {FEATURED_ROOMS.map((_, _index) => (
                  <button
                    key={_index}
                    onClick={() => setCurrentSlide(_index)}
                    className={`w-3 h-3 rounded-full transition-all duration-300 ${
                      _index === currentSlide
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 scale-125'
                        : 'bg-white/30 hover:bg-white/50'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Premium Features */}
        <section className="relative z-10 py-20 px-6">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                프리미엄 서비스
              </h2>
              <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                럭셔리 라이프스타일을 위한 완벽한 서비스
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {PREMIUM_FEATURES.map((feature, _index) => (
                <div
                  key={feature.title}
                  className={`group transition-all duration-1000 delay-${feature.delay} ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-20 opacity-0'
                  }`}
                >
                  <div className="relative p-8 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-all duration-500 hover:bg-white/10 hover:scale-105">
                    <div className="absolute inset-0 bg-gradient-to-r opacity-0 transition-opacity duration-500 group-hover:opacity-10 rounded-2xl" style={{background: `linear-gradient(135deg, ${feature.gradient.replace('from-', '').replace('via-', '').replace('to-', '').split(' ').join(', ')})`}} />

                    <div className="relative">
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mb-6 transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3`}>
                        <feature.icon className="w-8 h-8 text-white" />
                      </div>

                      <h3 className="text-2xl font-bold text-white mb-4">{feature.title}</h3>
                      <p className="text-gray-300 leading-relaxed">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="relative z-10 py-20 px-6 bg-gradient-to-t from-black to-transparent">
          <div className="container mx-auto max-w-4xl text-center">
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
              지금 시작하세요
            </h2>
            <p className="text-xl text-gray-300 mb-12 max-w-2xl mx-auto">
              서울의 프리미엄 소셜 네트워크에 참여하여 특별한 경험을 만나보세요
            </p>

            <button
              onClick={() => {
                logger.info('[DEBUG] 하단 버튼 클릭됨 - 리다이렉트 방지됨')
                alert('하단 버튼이 클릭되었습니다. 리다이렉트가 비활성화되어 있습니다.')
              }}
              className="group relative px-12 py-6 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl font-bold text-xl overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-2xl"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
              <div className="relative flex items-center gap-3">
                <span>🚀</span>
                밋핀 프리미엄 체험하기
                <ArrowRight className="w-6 h-6 transition-transform duration-300 group-hover:translate-x-2" />
              </div>
            </button>
          </div>
        </section>

        {/* Legal Footer */}
        <div className="relative z-10">
          <LegalFooter variant="dark" />
        </div>
      </div>

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes gradient {
          0%, 100% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
        }
        .animate-gradient {
          animation: gradient 3s ease infinite;
        }
      `}</style>
    </MobileOptimizedLayout>
  )
}