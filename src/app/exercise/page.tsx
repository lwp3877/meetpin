/* src/app/exercise/page.tsx - 운동메이트 전용 랜딩 페이지 */
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { brandMessages } from '@/lib/config/brand'
import { MapPin, Users, Star, Clock, Target, Zap, Trophy, Heart } from 'lucide-react'

const EXERCISE_SPOTS = [
  {
    name: '한강공원',
    description: '러닝, 사이클, 요가 등 다양한 아웃도어 운동',
    emoji: '🏃',
    activeRooms: 25,
    popularTime: '06:00-09:00, 19:00-21:00',
  },
  {
    name: '올림픽공원',
    description: '넓은 공간에서 축구, 농구, 프리스비',
    emoji: '⚽',
    activeRooms: 18,
    popularTime: '16:00-20:00',
  },
  {
    name: '피트니스센터',
    description: '헬스, 크로스핏, PT 메이트',
    emoji: '🏋️',
    activeRooms: 32,
    popularTime: '07:00-09:00, 19:00-22:00',
  },
  {
    name: '테니스장',
    description: '테니스, 배드민턴 파트너 매칭',
    emoji: '🎾',
    activeRooms: 14,
    popularTime: '18:00-21:00',
  },
]

const EXERCISE_TYPES = [
  { type: '러닝', emoji: '🏃‍♂️', rooms: 28 },
  { type: '헬스', emoji: '🏋️‍♀️', rooms: 35 },
  { type: '테니스', emoji: '🎾', rooms: 16 },
  { type: '축구', emoji: '⚽', rooms: 12 },
  { type: '요가', emoji: '🧘‍♀️', rooms: 22 },
  { type: '등산', emoji: '🥾', rooms: 18 },
]

const BENEFITS = [
  { icon: '🔥', title: '칼로리 소모 증가', desc: '함께 운동하면 30% 더 오래 운동해요' },
  { icon: '💪', title: '동기부여 UP', desc: '서로 응원하며 목표 달성률이 2배 높아져요' },
  { icon: '👥', title: '새로운 친구', desc: '운동을 통해 건강한 인맥을 만들어보세요' },
  { icon: '📈', title: '실력 향상', desc: '경험 많은 메이트와 함께 빠르게 늘어요' },
]

export default function ExerciseLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-green-50 to-emerald-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-sm">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📍</span>
            <span className="text-xl font-bold text-gray-900">{brandMessages.appName}</span>
          </Link>
          <div className="flex items-center space-x-4">
            <Link href="/auth/login" className="text-gray-600 hover:text-gray-900">
              로그인
            </Link>
            <Button asChild>
              <Link href="/auth/signup">시작하기</Link>
            </Button>
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section
          className={`px-4 py-20 transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}
        >
          <div className="mx-auto max-w-4xl text-center">
            <div className="mb-6 text-6xl">💪</div>
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              혼자 운동하기 <span className="text-emerald-600">지루한 날</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600">
              근처에서 함께 운동할 메이트를 찾아보세요!
              <br />
              러닝, 헬스, 테니스부터 요가까지 다양한 운동 친구들과 만나요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-emerald-600 px-8 text-lg hover:bg-emerald-700"
                onClick={() => router.push('/map?category=exercise')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                근처 운동모임 찾기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-lg"
                onClick={() => router.push('/room/new?category=exercise')}
              >
                <Users className="mr-2 h-5 w-5" />
                운동모임 만들기
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-emerald-600">3,245+</div>
                <div className="text-gray-600">활성 운동모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">189+</div>
                <div className="text-gray-600">오늘의 새 모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">4.9★</div>
                <div className="text-gray-600">평균 만족도</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-emerald-600">92%</div>
                <div className="text-gray-600">재참여율</div>
              </div>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              함께 운동하면 좋은 점 ✨
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {BENEFITS.map((benefit, index) => (
                <Card
                  key={benefit.title}
                  className={`transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'animate-in slide-in-from-bottom-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <CardContent className="p-6 text-center">
                    <div className="mb-4 text-4xl">{benefit.icon}</div>
                    <h3 className="mb-2 text-lg font-bold text-gray-900">{benefit.title}</h3>
                    <p className="text-sm text-gray-600">{benefit.desc}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="bg-gradient-to-r from-emerald-100 to-blue-100 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              인기 운동 장소 🗺️
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {EXERCISE_SPOTS.map((spot, index) => (
                <Card
                  key={spot.name}
                  className={`transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'animate-in slide-in-from-left-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?location=${spot.name}&category=exercise`)}
                >
                  <CardContent className="p-6">
                    <div className="text-center">
                      <div className="mb-3 text-4xl">{spot.emoji}</div>
                      <h3 className="mb-2 text-xl font-bold text-gray-900">{spot.name}</h3>
                      <p className="mb-4 text-sm text-gray-600">{spot.description}</p>
                      <div className="space-y-2">
                        <Badge variant="secondary" className="w-full justify-center">
                          <Users className="mr-1 h-3 w-3" />
                          {spot.activeRooms}개 모임 진행중
                        </Badge>
                        <Badge variant="outline" className="w-full justify-center text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          인기시간: {spot.popularTime}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Exercise Types */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              운동 종목별 모임 🏃‍♀️
            </h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {EXERCISE_TYPES.map((exercise, index) => (
                <Card
                  key={exercise.type}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-in slide-in-from-right-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?exercise=${exercise.type}&category=exercise`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 text-3xl">{exercise.emoji}</div>
                    <div className="font-semibold text-gray-900">{exercise.type}</div>
                    <div className="text-sm text-gray-600">{exercise.rooms}개 모임</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gradient-to-r from-blue-50 to-emerald-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              밋핀 운동모임의 특별함 💚
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Target className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">실력별 매칭</h3>
                <p className="text-gray-600">
                  초보자부터 고수까지, 내 실력에 맞는 운동메이트를 만날 수 있어요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Zap className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">즉석 모임</h3>
                <p className="text-gray-600">
                  지금 당장 운동하고 싶을 때, 실시간으로 모임을 만들고 참여하세요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <Trophy className="h-8 w-8 text-emerald-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">목표 달성</h3>
                <p className="text-gray-600">
                  함께 목표를 세우고 응원하며 성취감을 두 배로 느껴보세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              운동메이트들의 생생한 후기 💬
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="bg-gradient-to-br from-emerald-50 to-blue-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                      <span className="text-xl">🏃‍♀️</span>
                    </div>
                    <div>
                      <div className="font-semibold">수현님 (29세)</div>
                      <div className="text-sm text-gray-600">한강 러닝크루 참여</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "혼자 러닝하다가 포기하는 일이 많았는데, 밋핀으로 만난 러닝메이트들과 함께하니까
                    정말 꾸준히 할 수 있게 되었어요! 이제 10km도 뛸 수 있답니다 🏃‍♀️"
                  </p>
                  <div className="mt-3 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-blue-50 to-emerald-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-200">
                      <span className="text-xl">🏋️‍♂️</span>
                    </div>
                    <div>
                      <div className="font-semibold">진우님 (25세)</div>
                      <div className="text-sm text-gray-600">헬스장 PT 메이트</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "PT비가 부담스러웠는데 밋핀에서 경험 많은 분과 함께 운동하면서 올바른 자세를
                    배울 수 있었어요. 이제 스쿼트 100개도 문제없어요! 💪"
                  </p>
                  <div className="mt-3 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-emerald-600 to-blue-600 px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">건강한 변화를 시작해보세요! 🎯</h2>
            <p className="mb-8 text-xl opacity-90">
              신규 가입 시 프리미엄 부스트 3일 무료!
              <br />내 운동모임이 상단에 노출되어 더 많은 메이트들과 만날 수 있어요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 text-lg"
                onClick={() => router.push('/auth/signup')}
              >
                <Heart className="mr-2 h-5 w-5" />
                무료 회원가입하고 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent px-8 text-lg text-white hover:bg-white hover:text-emerald-600"
                onClick={() => router.push('/map?category=exercise')}
              >
                <Target className="mr-2 h-5 w-5" />
                바로 운동모임 찾아보기
              </Button>
            </div>
            <div className="mt-8 text-sm opacity-80">
              * 가입비 무료 · 운동모임 참여 무료 · 건강한 만남을 시작하세요
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 px-4 py-8 text-white">
        <div className="mx-auto max-w-6xl text-center">
          <div className="mb-4 flex items-center justify-center space-x-2">
            <span className="text-2xl">📍</span>
            <span className="text-xl font-bold">{brandMessages.appName}</span>
          </div>
          <p className="mb-4 text-gray-400">핀 찍고, 지금 모여요</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/legal/terms" className="text-gray-400 hover:text-white">
              이용약관
            </Link>
            <Link href="/legal/privacy" className="text-gray-400 hover:text-white">
              개인정보처리방침
            </Link>
            <Link href="/contact" className="text-gray-400 hover:text-white">
              고객센터
            </Link>
          </div>
        </div>
      </footer>
    </div>
  )
}
