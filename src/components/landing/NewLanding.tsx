'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import {
  MapPin,
  Users,
  Calendar,
  Coffee,
  Dumbbell,
  Music,
  Heart,
  Shield,
  Star,
  ArrowRight,
  CheckCircle,
  Sparkles,
} from 'lucide-react'

/**
 * 새로운 밋핀 랜딩 페이지
 *
 * 디자인 철학:
 * 1. 사용자가 3초 안에 서비스를 이해할 수 있어야 함
 * 2. 모든 버튼은 명확한 목적과 동작을 가져야 함
 * 3. 자연스러운 시각적 흐름 (위에서 아래로)
 * 4. 진입 장벽 최소화 (회원가입 없이 둘러보기 가능)
 */

const CATEGORIES = [
  { icon: Coffee, label: '술모임', color: 'bg-amber-100 text-amber-700', path: '/drink' },
  { icon: Dumbbell, label: '운동', color: 'bg-blue-100 text-blue-700', path: '/exercise' },
  { icon: Music, label: '취미', color: 'bg-purple-100 text-purple-700', path: '/hobby' },
]

const HOW_IT_WORKS = [
  {
    step: 1,
    title: '지도에서 모임 찾기',
    description: '내 주변 실시간 모임을 지도에서 한눈에 확인',
    icon: MapPin,
  },
  {
    step: 2,
    title: '관심있는 모임 참여 신청',
    description: '마음에 드는 모임을 찾고 간단한 프로필로 참여 요청',
    icon: Users,
  },
  {
    step: 3,
    title: '승인 후 즐거운 만남',
    description: '호스트 승인 후 새로운 사람들과 즐거운 시간',
    icon: Heart,
  },
]

const REAL_EXAMPLES = [
  {
    title: '강남역 퇴근 후 소맥 한잔',
    location: '강남역 2번 출구',
    time: '오늘 저녁 7시',
    participants: '3/6명',
    category: 'drink',
    tags: ['직장인', '20-30대', '가볍게'],
  },
  {
    title: '한강 러닝 크루 모집',
    location: '반포 한강공원',
    time: '내일 아침 7시',
    participants: '8/12명',
    category: 'exercise',
    tags: ['초보환영', '러닝', '건강'],
  },
  {
    title: '홍대 보드게임 카페',
    location: '홍대입구역 근처',
    time: '토요일 오후 3시',
    participants: '4/8명',
    category: 'hobby',
    tags: ['보드게임', '친목', '재미'],
  },
]

const TRUST_BADGES = [
  { icon: Shield, text: '안전한 만남 보장' },
  { icon: Users, text: '3,200+ 활동 회원' },
  { icon: Star, text: '평균 4.8점 만족도' },
]

export default function NewLanding() {
  const router = useRouter()
  const { user } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const handleGetStarted = () => {
    // 로그인 되어 있으면 지도로, 아니면 회원가입으로
    if (user) {
      router.push('/map')
    } else {
      router.push('/auth/signup')
    }
  }

  const handleExploreMap = () => {
    // 로그인 없이도 지도 둘러보기 가능
    router.push('/map')
  }

  const handleLogin = () => {
    router.push('/auth/login')
  }

  if (!mounted) {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      {/* 헤더 */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-2">
              <MapPin className="w-8 h-8 text-green-600" />
              <span className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                밋핀
              </span>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <button
                  onClick={() => router.push('/map')}
                  className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                >
                  지도 보기
                </button>
              ) : (
                <>
                  <button
                    onClick={handleLogin}
                    className="px-4 py-2 text-gray-700 hover:text-green-600 transition-colors font-medium"
                  >
                    로그인
                  </button>
                  <button
                    onClick={handleGetStarted}
                    className="px-6 py-2 bg-green-600 text-white rounded-full font-medium hover:bg-green-700 transition-all transform hover:scale-105"
                  >
                    시작하기
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* 히어로 섹션 */}
      <section className="pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center space-x-2 bg-green-100 text-green-700 px-4 py-2 rounded-full mb-8">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">지금 서울에서 127개 모임이 진행중</span>
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 leading-tight">
            핀 찍고,
            <br />
            <span className="bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
              지금 모여요
            </span>
          </h1>

          <p className="text-xl sm:text-2xl text-gray-600 mb-12 max-w-3xl mx-auto leading-relaxed">
            내 주변에서 바로 만날 수 있는 사람들을 찾아보세요.
            <br />
            술 한잔, 운동, 취미 활동까지 다양한 모임이 기다립니다.
          </p>

          {/* CTA 버튼 */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-8 py-4 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2"
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleExploreMap}
              className="w-full sm:w-auto px-8 py-4 bg-white text-gray-700 rounded-full font-semibold text-lg hover:bg-gray-50 transition-all border-2 border-gray-200 flex items-center justify-center space-x-2"
            >
              <MapPin className="w-5 h-5" />
              <span>지도 둘러보기</span>
            </button>
          </div>

          {/* 신뢰 배지 */}
          <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
            {TRUST_BADGES.map((badge, index) => (
              <div key={index} className="flex items-center space-x-2">
                <badge.icon className="w-4 h-4 text-green-600" />
                <span>{badge.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 카테고리 섹션 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            어떤 모임을 찾으시나요?
          </h2>
          <p className="text-center text-gray-600 mb-12">
            관심사별로 모임을 찾아보세요
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
            {CATEGORIES.map((category, index) => {
              const Icon = category.icon
              return (
                <button
                  key={index}
                  onClick={() => router.push(category.path)}
                  className="p-8 bg-gradient-to-br from-white to-gray-50 rounded-2xl border-2 border-gray-200 hover:border-green-500 transition-all transform hover:scale-105 hover:shadow-xl"
                >
                  <div className={`w-16 h-16 ${category.color} rounded-2xl flex items-center justify-center mb-4 mx-auto`}>
                    <Icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {category.label}
                  </h3>
                  <p className="text-gray-600">
                    지금 진행중인 모임 확인하기
                  </p>
                </button>
              )
            })}
          </div>
        </div>
      </section>

      {/* 실제 사용 예시 */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-green-50 to-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            이런 모임이 열리고 있어요
          </h2>
          <p className="text-center text-gray-600 mb-12">
            실제 진행중인 모임을 확인해보세요
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {REAL_EXAMPLES.map((example, index) => (
              <div
                key={index}
                className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all transform hover:-translate-y-1 border border-gray-100"
              >
                <div className="flex items-start justify-between mb-4">
                  <h3 className="text-lg font-bold text-gray-900 flex-1">
                    {example.title}
                  </h3>
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium">
                    {example.participants}
                  </span>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600 text-sm">
                    <MapPin className="w-4 h-4 mr-2 text-green-600" />
                    {example.location}
                  </div>
                  <div className="flex items-center text-gray-600 text-sm">
                    <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                    {example.time}
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {example.tags.map((tag, tagIndex) => (
                    <span
                      key={tagIndex}
                      className="px-2 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <button
              onClick={handleExploreMap}
              className="px-8 py-4 bg-green-600 text-white rounded-full font-semibold text-lg hover:bg-green-700 transition-all transform hover:scale-105 shadow-lg inline-flex items-center space-x-2"
            >
              <span>더 많은 모임 보기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl sm:text-4xl font-bold text-center text-gray-900 mb-4">
            이렇게 간단해요
          </h2>
          <p className="text-center text-gray-600 mb-16">
            3단계로 시작하는 새로운 만남
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {HOW_IT_WORKS.map((step, index) => {
              const Icon = step.icon
              return (
                <div key={index} className="text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-blue-500 rounded-full flex items-center justify-center shadow-lg">
                      <Icon className="w-10 h-10 text-white" />
                    </div>
                    <div className="absolute -top-2 -right-2 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center font-bold text-sm">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {step.title}
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    {step.description}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-green-600 to-blue-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl sm:text-5xl font-bold text-white mb-6">
            오늘 바로 시작해보세요
          </h2>
          <p className="text-xl text-green-100 mb-8">
            회원가입은 무료예요. 지금 바로 내 주변 모임을 찾아보세요.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleGetStarted}
              className="w-full sm:w-auto px-10 py-5 bg-white text-green-600 rounded-full font-bold text-lg hover:bg-gray-100 transition-all transform hover:scale-105 shadow-xl flex items-center justify-center space-x-2"
            >
              <span>무료로 시작하기</span>
              <ArrowRight className="w-5 h-5" />
            </button>
            <button
              onClick={handleExploreMap}
              className="w-full sm:w-auto px-10 py-5 bg-transparent text-white border-2 border-white rounded-full font-bold text-lg hover:bg-white/10 transition-all flex items-center justify-center space-x-2"
            >
              <MapPin className="w-5 h-5" />
              <span>먼저 둘러보기</span>
            </button>
          </div>

          <div className="mt-8 flex items-center justify-center space-x-2 text-green-100">
            <CheckCircle className="w-5 h-5" />
            <span>신용카드 필요 없음 • 언제든 취소 가능</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="text-white font-semibold mb-4">서비스</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => router.push('/drink')} className="hover:text-green-400 transition-colors">
                    술모임
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/exercise')} className="hover:text-green-400 transition-colors">
                    운동
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/hobby')} className="hover:text-green-400 transition-colors">
                    취미
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">회사</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => router.push('/help')} className="hover:text-green-400 transition-colors">
                    도움말
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/contact')} className="hover:text-green-400 transition-colors">
                    문의하기
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">법적고지</h4>
              <ul className="space-y-2">
                <li>
                  <button onClick={() => router.push('/legal/terms')} className="hover:text-green-400 transition-colors">
                    이용약관
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/legal/privacy')} className="hover:text-green-400 transition-colors">
                    개인정보처리방침
                  </button>
                </li>
                <li>
                  <button onClick={() => router.push('/legal/location-terms')} className="hover:text-green-400 transition-colors">
                    위치정보 이용약관
                  </button>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="text-white font-semibold mb-4">밋핀</h4>
              <div className="flex items-center space-x-2 mb-4">
                <MapPin className="w-6 h-6 text-green-500" />
                <span className="text-white font-bold">밋핀</span>
              </div>
              <p className="text-sm">
                핀 찍고, 지금 모여요
              </p>
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