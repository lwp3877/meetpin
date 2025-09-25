'use client'

import React, { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
// Link imported but handled via PremiumButton
import { useRouter } from 'next/navigation'
import PremiumButton from '@/components/ui/premium-button'
import { RoomCard } from '@/components/ui/premium-card'
import { Badge } from '@/components/ui/badge'
import LiveActivityStats from '@/components/home/live-activity-stats'
import SignupIncentive from '@/components/onboarding/signup-incentive'
// WelcomeTour available for future implementation
import MobileOptimizedLayout from '@/components/mobile/mobile-optimized-layout'
import LegalFooter from '@/components/layout/LegalFooter'
import {
  MapPin,
  Users,
  Calendar,
  Star,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Zap,
  Heart,
  TrendingUp,
} from 'lucide-react'

// Enhanced featured rooms with premium styling
const FEATURED_ROOMS = [
  {
    id: '1',
    title: '🍻 강남 프리미엄 루프탑 바 투어',
    category: 'drink',
    location: '강남역 2번 출구',
    participants: 6,
    maxParticipants: 8,
    fee: 85000,
    time: '오늘 19:30',
    host: '소믈리에 미나',
    isBoost: true,
    isPremium: true,
    rating: 4.9,
    tags: ['프리미엄', '루프탑', '와인', '강남'],
    description: '강남 최고급 루프탑 바 3곳을 돌며 야경과 함께 프리미엄 칵테일을 즐겨요!',
    hostAge: '20대 후반',
    joinCount: 23,
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop',
  },
  {
    id: '2',
    title: '💪 한강 선셋 요가 & 명상',
    category: 'exercise',
    location: '반포 한강공원',
    participants: 8,
    maxParticipants: 12,
    fee: 25000,
    time: '내일 18:00',
    host: '요가 마스터 지훈',
    isBoost: true,
    isPremium: true,
    rating: 4.8,
    tags: ['요가', '명상', '선셋', '힐링'],
    description: '한강 노을을 배경으로 하는 특별한 요가와 명상 클래스예요!',
    hostAge: '30대 초반',
    joinCount: 34,
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop',
  },
  {
    id: '3',
    title: '✨ 성수동 아트 갤러리 & 브런치',
    category: 'other',
    location: '성수역 3번 출구',
    participants: 4,
    maxParticipants: 6,
    fee: 45000,
    time: '토요일 11:00',
    host: '아트 큐레이터 수진',
    isBoost: false,
    isPremium: true,
    rating: 4.7,
    tags: ['아트', '갤러리', '브런치', '성수'],
    description: '트렌디한 성수동 갤러리 투어와 감성 브런치 카페를 함께 즐겨요!',
    hostAge: '20대 후반',
    joinCount: 18,
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop',
  },
]

const STATS = [
  { label: '활성 사용자', value: '2,840+', icon: Users, color: 'text-primary-500' },
  { label: '성사된 모임', value: '1,256+', icon: Calendar, color: 'text-boost-500' },
  { label: '만족도', value: '4.8/5', icon: Star, color: 'text-accent-500' },
  { label: '월 성장률', value: '+127%', icon: TrendingUp, color: 'text-emerald-500' },
]

const FEATURES = [
  {
    icon: MapPin,
    title: '실시간 위치 기반 매칭',
    description: '내 주변 사람들과 즉석에서 만날 수 있어요',
    gradient: 'from-primary-500 to-emerald-500',
  },
  {
    icon: Zap,
    title: '스마트 AI 추천',
    description: '취향과 관심사를 분석해 최적의 모임을 추천해드려요',
    gradient: 'from-boost-500 to-amber-500',
  },
  {
    icon: Heart,
    title: '안전한 만남 보장',
    description: '프로필 인증과 평점 시스템으로 신뢰할 수 있는 만남',
    gradient: 'from-pink-500 to-rose-500',
  },
  {
    icon: Sparkles,
    title: '프리미엄 경험',
    description: '고급스러운 장소와 특별한 경험을 함께 나눠요',
    gradient: 'from-purple-500 to-indigo-500',
  },
]

export default function EnhancedLanding() {
  const { user } = useAuth()
  const router = useRouter()
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    setIsVisible(true)

    // 자동 슬라이드
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % FEATURED_ROOMS.length)
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide(prev => (prev + 1) % FEATURED_ROOMS.length)
  }

  const prevSlide = () => {
    setCurrentSlide(prev => (prev - 1 + FEATURED_ROOMS.length) % FEATURED_ROOMS.length)
  }

  if (user) {
    router.push('/map')
    return null
  }

  return (
    <MobileOptimizedLayout>
      <div className="to-primary-50 min-h-screen bg-gradient-to-br from-neutral-50 via-white">
        {/* Hero Section */}
        <section className="relative overflow-hidden pt-20 pb-32">
          {/* Background Effects */}
          <div className="from-primary-100/50 to-boost-100/50 absolute inset-0 bg-gradient-to-r" />
          <div className="from-primary-400/20 absolute top-0 right-0 h-96 w-96 rounded-full bg-gradient-to-br to-transparent blur-3xl" />
          <div className="from-boost-400/20 absolute bottom-0 left-0 h-96 w-96 rounded-full bg-gradient-to-tr to-transparent blur-3xl" />

          <div className="relative container mx-auto px-6">
            <div
              className={`text-center transition-all duration-1000 ${
                isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
              }`}
            >
              {/* Premium Badge */}
              <div className="from-primary-500/10 to-boost-500/10 border-primary-200 mb-6 inline-flex items-center gap-2 rounded-full border bg-gradient-to-r px-4 py-2">
                <Sparkles className="text-primary-500 h-4 w-4" />
                <span className="text-primary-700 text-sm font-medium">프리미엄 소셜 플랫폼</span>
              </div>

              {/* Main Title */}
              <h1 className="mb-6 text-6xl font-bold md:text-7xl">
                <span className="text-gradient from-primary-600 to-boost-600 bg-gradient-to-r">
                  밋핀
                </span>
              </h1>

              <p className="mb-4 text-2xl font-light text-neutral-600 md:text-3xl">
                핀 찍고, 지금 모여요
              </p>

              <p className="mx-auto mb-12 max-w-2xl text-lg leading-relaxed text-neutral-500">
                지도에서 방을 만들어 근처 사람들과 만나보세요.
                <br />
                <span className="text-primary-600 font-medium">술, 운동, 취미 활동</span>까지 다양한
                모임을 즐길 수 있습니다.
              </p>

              {/* CTA Buttons */}
              <div className="mb-16 flex flex-col items-center justify-center gap-4 sm:flex-row">
                <PremiumButton
                  variant="gradient"
                  size="xl"
                  glow
                  className="group min-w-[200px]"
                  onClick={() => router.push('/map')}
                >
                  <span className="mr-2">🗺️</span>
                  지도에서 시작하기
                  <div className="absolute inset-0 rounded-xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                </PremiumButton>

                <PremiumButton
                  variant="outline"
                  size="xl"
                  className="min-w-[200px]"
                  onClick={() => router.push('/auth/signup')}
                >
                  <span className="mr-2">✨</span>
                  회원가입
                </PremiumButton>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
                {STATS.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={`text-center transition-all duration-700 delay-${index * 100} ${
                      isVisible ? 'translate-y-0 opacity-100' : 'translate-y-5 opacity-0'
                    }`}
                  >
                    <div className="glass rounded-2xl p-6 transition-all duration-300 hover:shadow-lg">
                      <stat.icon className={`mx-auto mb-3 h-8 w-8 ${stat.color}`} />
                      <div className="mb-1 text-2xl font-bold text-neutral-800">{stat.value}</div>
                      <div className="text-sm text-neutral-500">{stat.label}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Featured Rooms Section */}
        <section className="bg-white/80 py-20 backdrop-blur-sm">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-neutral-800">
                <span className="text-gradient">지금 인기있는 모임</span>
              </h2>
              <p className="text-lg text-neutral-600">프리미엄 경험을 제공하는 특별한 모임들</p>
            </div>

            <div className="relative mx-auto max-w-4xl">
              <div className="overflow-hidden rounded-3xl">
                <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                >
                  {FEATURED_ROOMS.map(room => (
                    <div key={room.id} className="w-full flex-shrink-0 px-4">
                      <RoomCard className="relative overflow-hidden">
                        {/* Room Image */}
                        <div className="relative mb-6 aspect-video overflow-hidden rounded-xl">
                          <Image
                            src={room.image}
                            alt={room.title}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />

                          {/* Premium Badge */}
                          {room.isPremium && (
                            <div className="absolute top-4 left-4">
                              <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                                <Sparkles className="mr-1 h-3 w-3" />
                                Premium
                              </Badge>
                            </div>
                          )}

                          {/* Boost Badge */}
                          {room.isBoost && (
                            <div className="absolute top-4 right-4">
                              <Badge className="from-primary-500 bg-gradient-to-r to-emerald-500 text-white">
                                <Zap className="mr-1 h-3 w-3" />
                                부스트
                              </Badge>
                            </div>
                          )}
                        </div>

                        {/* Room Content */}
                        <div className="space-y-4">
                          <div>
                            <h3 className="mb-2 text-xl font-bold text-neutral-800">
                              {room.title}
                            </h3>
                            <p className="text-sm leading-relaxed text-neutral-600">
                              {room.description}
                            </p>
                          </div>

                          <div className="flex items-center justify-between text-sm text-neutral-500">
                            <div className="flex items-center gap-4">
                              <div className="flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {room.location}
                              </div>
                              <div className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                {room.time}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="flex items-center gap-1 text-amber-500">
                                <Star className="h-4 w-4 fill-current" />
                                <span className="font-medium">{room.rating}</span>
                              </div>
                              <span className="text-neutral-400">•</span>
                              <span className="text-sm text-neutral-500">
                                {room.joinCount}회 참여
                              </span>
                            </div>

                            <div className="text-right">
                              <div className="text-primary-600 text-lg font-bold">
                                {room.fee.toLocaleString()}원
                              </div>
                              <div className="text-xs text-neutral-500">
                                {room.participants}/{room.maxParticipants}명
                              </div>
                            </div>
                          </div>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {room.tags.map(tag => (
                              <Badge key={tag} variant="secondary" className="text-xs">
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      </RoomCard>
                    </div>
                  ))}
                </div>
              </div>

              {/* Slide Controls */}
              <button
                onClick={prevSlide}
                className="glass hover:text-primary-600 absolute top-1/2 left-0 flex h-12 w-12 -translate-x-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-600 transition-colors duration-200"
              >
                <ChevronLeft className="h-6 w-6" />
              </button>

              <button
                onClick={nextSlide}
                className="glass hover:text-primary-600 absolute top-1/2 right-0 flex h-12 w-12 translate-x-6 -translate-y-1/2 items-center justify-center rounded-full text-neutral-600 transition-colors duration-200"
              >
                <ChevronRight className="h-6 w-6" />
              </button>

              {/* Slide Indicators */}
              <div className="mt-8 flex justify-center gap-2">
                {FEATURED_ROOMS.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setCurrentSlide(index)}
                    className={`h-3 w-3 rounded-full transition-all duration-300 ${
                      index === currentSlide
                        ? 'bg-primary-500 scale-125'
                        : 'bg-neutral-300 hover:bg-neutral-400'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="to-primary-50 bg-gradient-to-br from-neutral-50 py-20">
          <div className="container mx-auto px-6">
            <div className="mb-16 text-center">
              <h2 className="mb-4 text-4xl font-bold text-neutral-800">
                특별한 <span className="text-gradient">밋핀 경험</span>
              </h2>
              <p className="mx-auto max-w-2xl text-lg text-neutral-600">
                단순한 만남을 넘어서, 프리미엄 소셜 경험을 제공합니다
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
              {FEATURES.map((feature, index) => (
                <div
                  key={feature.title}
                  className={`text-center transition-all duration-700 delay-${index * 100} ${
                    isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                  }`}
                >
                  <div className="glass group rounded-2xl p-8 transition-all duration-300 hover:shadow-xl">
                    <div
                      className={`h-16 w-16 rounded-2xl bg-gradient-to-r ${feature.gradient} mx-auto mb-6 flex items-center justify-center transition-transform duration-300 group-hover:scale-110`}
                    >
                      <feature.icon className="h-8 w-8 text-white" />
                    </div>

                    <h3 className="mb-4 text-xl font-bold text-neutral-800">{feature.title}</h3>
                    <p className="leading-relaxed text-neutral-600">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Live Activity Stats Section */}
        <section className="to-primary-50 bg-gradient-to-br from-gray-50 py-20">
          <div className="container mx-auto px-6">
            <LiveActivityStats />
          </div>
        </section>

        {/* Signup Incentive Section */}
        <section className="bg-white py-20">
          <div className="container mx-auto px-6">
            <div className="mb-12 text-center">
              <h2 className="mb-4 text-4xl font-bold text-neutral-800">
                <span className="text-gradient">지금 가입하면 특별 혜택</span>
              </h2>
              <p className="text-lg text-neutral-600">
                한정 기간 동안만 제공되는 프리미엄 혜택을 놓치지 마세요!
              </p>
            </div>
            <SignupIncentive />
          </div>
        </section>

        {/* Final CTA Section */}
        <section className="from-primary-600 to-boost-600 bg-gradient-to-r py-20 text-white">
          <div className="container mx-auto px-6 text-center">
            <h2 className="mb-4 text-4xl font-bold">지금 바로 시작해보세요</h2>
            <p className="mb-8 text-xl opacity-90">
              새로운 사람들과의 특별한 만남이 기다리고 있어요
            </p>

            <PremiumButton
              variant="glass"
              size="xl"
              className="min-w-[250px]"
              onClick={() => router.push('/map')}
            >
              <span className="mr-2">🚀</span>
              밋핀 시작하기
            </PremiumButton>
          </div>
        </section>

        {/* Legal Footer */}
        <LegalFooter variant="default" />
      </div>
    </MobileOptimizedLayout>
  )
}
