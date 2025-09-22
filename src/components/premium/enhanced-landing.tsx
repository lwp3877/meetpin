'use client'

import React, { useState, useEffect } from 'react'
import { useAuth } from '@/lib/useAuth'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import PremiumButton from '@/components/ui/premium-button'
import { RoomCard } from '@/components/ui/premium-card'
import { Badge } from '@/components/ui/badge'
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
  TrendingUp
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
    image: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?w=400&h=300&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?w=400&h=300&fit=crop'
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
    image: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=400&h=300&fit=crop'
  }
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
    gradient: 'from-primary-500 to-emerald-500'
  },
  {
    icon: Zap,
    title: '스마트 AI 추천',
    description: '취향과 관심사를 분석해 최적의 모임을 추천해드려요',
    gradient: 'from-boost-500 to-amber-500'
  },
  {
    icon: Heart,
    title: '안전한 만남 보장',
    description: '프로필 인증과 평점 시스템으로 신뢰할 수 있는 만남',
    gradient: 'from-pink-500 to-rose-500'
  },
  {
    icon: Sparkles,
    title: '프리미엄 경험',
    description: '고급스러운 장소와 특별한 경험을 함께 나눠요',
    gradient: 'from-purple-500 to-indigo-500'
  }
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
      setCurrentSlide((prev) => (prev + 1) % FEATURED_ROOMS.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }, [])

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % FEATURED_ROOMS.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + FEATURED_ROOMS.length) % FEATURED_ROOMS.length)
  }

  if (user) {
    router.push('/map')
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 via-white to-primary-50">
      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        {/* Background Effects */}
        <div className="absolute inset-0 bg-gradient-to-r from-primary-100/50 to-boost-100/50" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-primary-400/20 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-gradient-to-tr from-boost-400/20 to-transparent rounded-full blur-3xl" />
        
        <div className="relative container mx-auto px-6">
          <div className={`text-center transition-all duration-1000 ${
            isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
          }`}>
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary-500/10 to-boost-500/10 border border-primary-200 mb-6">
              <Sparkles className="w-4 h-4 text-primary-500" />
              <span className="text-sm font-medium text-primary-700">프리미엄 소셜 플랫폼</span>
            </div>
            
            {/* Main Title */}
            <h1 className="text-6xl md:text-7xl font-bold mb-6">
              <span className="text-gradient bg-gradient-to-r from-primary-600 to-boost-600">밋핀</span>
            </h1>
            
            <p className="text-2xl md:text-3xl font-light text-neutral-600 mb-4">
              핀 찍고, 지금 모여요
            </p>
            
            <p className="text-lg text-neutral-500 mb-12 max-w-2xl mx-auto leading-relaxed">
              지도에서 방을 만들어 근처 사람들과 만나보세요.<br />
              <span className="font-medium text-primary-600">술, 운동, 취미 활동</span>까지 다양한 모임을 즐길 수 있습니다.
            </p>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
              <PremiumButton
                variant="gradient"
                size="xl"
                glow
                className="min-w-[200px] group"
                onClick={() => router.push('/map')}
              >
                <span className="mr-2">🗺️</span>
                지도에서 시작하기
                <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
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
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {STATS.map((stat, index) => (
                <div
                  key={stat.label}
                  className={`text-center transition-all duration-700 delay-${index * 100} ${
                    isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-5'
                  }`}
                >
                  <div className="glass rounded-2xl p-6 hover:shadow-lg transition-all duration-300">
                    <stat.icon className={`w-8 h-8 mx-auto mb-3 ${stat.color}`} />
                    <div className="text-2xl font-bold text-neutral-800 mb-1">{stat.value}</div>
                    <div className="text-sm text-neutral-500">{stat.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Rooms Section */}
      <section className="py-20 bg-white/80 backdrop-blur-sm">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              <span className="text-gradient">지금 인기있는 모임</span>
            </h2>
            <p className="text-lg text-neutral-600">프리미엄 경험을 제공하는 특별한 모임들</p>
          </div>
          
          <div className="relative max-w-4xl mx-auto">
            <div className="overflow-hidden rounded-3xl">
              <div 
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {FEATURED_ROOMS.map((room) => (
                  <div key={room.id} className="w-full flex-shrink-0 px-4">
                    <RoomCard className="relative overflow-hidden">
                      {/* Room Image */}
                      <div className="aspect-video rounded-xl overflow-hidden mb-6">
                        <img 
                          src={room.image} 
                          alt={room.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                        
                        {/* Premium Badge */}
                        {room.isPremium && (
                          <div className="absolute top-4 left-4">
                            <Badge className="bg-gradient-to-r from-amber-400 to-amber-600 text-white">
                              <Sparkles className="w-3 h-3 mr-1" />
                              Premium
                            </Badge>
                          </div>
                        )}
                        
                        {/* Boost Badge */}
                        {room.isBoost && (
                          <div className="absolute top-4 right-4">
                            <Badge className="bg-gradient-to-r from-primary-500 to-emerald-500 text-white">
                              <Zap className="w-3 h-3 mr-1" />
                              부스트
                            </Badge>
                          </div>
                        )}
                      </div>
                      
                      {/* Room Content */}
                      <div className="space-y-4">
                        <div>
                          <h3 className="text-xl font-bold text-neutral-800 mb-2">{room.title}</h3>
                          <p className="text-neutral-600 text-sm leading-relaxed">{room.description}</p>
                        </div>
                        
                        <div className="flex items-center justify-between text-sm text-neutral-500">
                          <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {room.location}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {room.time}
                            </div>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-amber-500">
                              <Star className="w-4 h-4 fill-current" />
                              <span className="font-medium">{room.rating}</span>
                            </div>
                            <span className="text-neutral-400">•</span>
                            <span className="text-sm text-neutral-500">{room.joinCount}회 참여</span>
                          </div>
                          
                          <div className="text-right">
                            <div className="text-lg font-bold text-primary-600">
                              {room.fee.toLocaleString()}원
                            </div>
                            <div className="text-xs text-neutral-500">
                              {room.participants}/{room.maxParticipants}명
                            </div>
                          </div>
                        </div>
                        
                        {/* Tags */}
                        <div className="flex flex-wrap gap-2">
                          {room.tags.map((tag) => (
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
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-6 w-12 h-12 rounded-full glass flex items-center justify-center text-neutral-600 hover:text-primary-600 transition-colors duration-200"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
            
            <button
              onClick={nextSlide}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-6 w-12 h-12 rounded-full glass flex items-center justify-center text-neutral-600 hover:text-primary-600 transition-colors duration-200"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
            
            {/* Slide Indicators */}
            <div className="flex justify-center mt-8 gap-2">
              {FEATURED_ROOMS.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentSlide(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
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
      <section className="py-20 bg-gradient-to-br from-neutral-50 to-primary-50">
        <div className="container mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-neutral-800 mb-4">
              특별한 <span className="text-gradient">밋핀 경험</span>
            </h2>
            <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
              단순한 만남을 넘어서, 프리미엄 소셜 경험을 제공합니다
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {FEATURES.map((feature, index) => (
              <div
                key={feature.title}
                className={`text-center transition-all duration-700 delay-${index * 100} ${
                  isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                }`}
              >
                <div className="glass rounded-2xl p-8 hover:shadow-xl transition-all duration-300 group">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-r ${feature.gradient} flex items-center justify-center mx-auto mb-6 group-hover:scale-110 transition-transform duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                  
                  <h3 className="text-xl font-bold text-neutral-800 mb-4">{feature.title}</h3>
                  <p className="text-neutral-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-20 bg-gradient-to-r from-primary-600 to-boost-600 text-white">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl font-bold mb-4">지금 바로 시작해보세요</h2>
          <p className="text-xl mb-8 opacity-90">새로운 사람들과의 특별한 만남이 기다리고 있어요</p>
          
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
    </div>
  )
}