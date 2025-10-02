/* src/app/drink/page.tsx - 술친구 전용 랜딩 페이지 */
'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { brandMessages } from '@/lib/config/brand'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import Users from 'lucide-react/dist/esm/icons/users'
import Star from 'lucide-react/dist/esm/icons/star'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Wine from 'lucide-react/dist/esm/icons/wine'
import PartyPopper from 'lucide-react/dist/esm/icons/party-popper'

const DRINK_SPOTS = [
  {
    name: '강남역',
    description: '트렌디한 루프탑 바와 고급 와인바',
    emoji: '🥂',
    activeRooms: 12,
    popularTime: '19:00-23:00',
  },
  {
    name: '홍대',
    description: '젊은 에너지 가득한 펍과 호프',
    emoji: '🍺',
    activeRooms: 18,
    popularTime: '20:00-02:00',
  },
  {
    name: '이태원',
    description: '이국적인 분위기의 칵테일 바',
    emoji: '🍸',
    activeRooms: 8,
    popularTime: '18:00-01:00',
  },
  {
    name: '신촌',
    description: '부담없는 대학가 술집',
    emoji: '🍻',
    activeRooms: 15,
    popularTime: '19:00-24:00',
  },
]

const DRINK_TYPES = [
  { type: '맥주', emoji: '🍺', rooms: 24 },
  { type: '소주', emoji: '🍶', rooms: 18 },
  { type: '와인', emoji: '🍷', rooms: 12 },
  { type: '칵테일', emoji: '🍸', rooms: 16 },
  { type: '막걸리', emoji: '🍶', rooms: 6 },
  { type: '위스키', emoji: '🥃', rooms: 8 },
]

export default function DrinkLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-yellow-50 to-red-50">
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
            <div className="mb-6 text-6xl">🍻</div>
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              혼자 마시기 <span className="text-orange-600">아쉬운 날</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600">
              근처에서 함께 술 마실 친구를 찾아보세요!
              <br />
              실시간 술모임에 참여하고 새로운 인연을 만나보세요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="px-8 text-lg"
                onClick={() => router.push('/map?category=drink')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                근처 술모임 찾기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-lg"
                onClick={() => router.push('/room/new?category=drink')}
              >
                <Users className="mr-2 h-5 w-5" />
                술모임 만들기
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-orange-600">2,847+</div>
                <div className="text-gray-600">활성 술모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">156+</div>
                <div className="text-gray-600">오늘의 새 모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">4.8★</div>
                <div className="text-gray-600">평균 만족도</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-orange-600">89%</div>
                <div className="text-gray-600">재참여율</div>
              </div>
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              인기 술모임 지역 🗺️
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {DRINK_SPOTS.map((spot, index) => (
                <Card
                  key={spot.name}
                  className={`transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'animate-in slide-in-from-bottom-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?location=${spot.name}&category=drink`)}
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

        {/* Drink Types */}
        <section className="bg-gradient-to-r from-orange-100 to-yellow-100 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">취향별 술모임 🍷</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {DRINK_TYPES.map((drink, index) => (
                <Card
                  key={drink.type}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-in slide-in-from-left-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?drink=${drink.type}&category=drink`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 text-3xl">{drink.emoji}</div>
                    <div className="font-semibold text-gray-900">{drink.type}</div>
                    <div className="text-sm text-gray-600">{drink.rooms}개 모임</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              밋핀 술모임의 특별함 ✨
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <MapPin className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">실시간 위치 기반</h3>
                <p className="text-gray-600">
                  내 주변 500m 이내 실시간 술모임을 지도에서 한눈에 확인하고 바로 참여하세요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Users className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">안전한 만남</h3>
                <p className="text-gray-600">
                  본인인증을 거친 사용자들과만 만나고, 1:1 채팅으로 사전에 대화해보세요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-orange-100">
                  <Star className="h-8 w-8 text-orange-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">평점 시스템</h3>
                <p className="text-gray-600">
                  모임 후 상호 평점을 남기고 좋은 사람들과 다시 만날 수 있어요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Testimonials */}
        <section className="bg-gradient-to-r from-yellow-50 to-orange-50 px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              술친구들의 생생한 후기 💬
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                      <span className="text-xl">🙋‍♀️</span>
                    </div>
                    <div>
                      <div className="font-semibold">민지님 (27세)</div>
                      <div className="text-sm text-gray-600">강남에서 와인모임 참여</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "혼자 와인 마시기 아쉬웠는데, 근처에서 취향 비슷한 사람들을 만날 수 있어서 너무
                    좋아요! 이제 주말마다 새로운 와인바 탐방하고 있어요 ✨"
                  </p>
                  <div className="mt-3 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-200">
                      <span className="text-xl">🙋‍♂️</span>
                    </div>
                    <div>
                      <div className="font-semibold">준호님 (32세)</div>
                      <div className="text-sm text-gray-600">홍대에서 맥주모임 호스팅</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "직장 동료들이랑만 마시다가 밋핀으로 새로운 사람들 만나니까 정말 재밌어요! 이제
                    정기 술모임까지 생겼답니다 🍺"
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
        <section className="bg-gradient-to-r from-orange-600 to-red-600 px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">지금 시작해보세요! 🎉</h2>
            <p className="mb-8 text-xl opacity-90">
              신규 가입 시 프리미엄 부스트 3일 무료!
              <br />내 술모임이 상단에 노출되어 더 많은 사람들과 만날 수 있어요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 text-lg"
                onClick={() => router.push('/auth/signup')}
              >
                <PartyPopper className="mr-2 h-5 w-5" />
                무료 회원가입하고 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent px-8 text-lg text-white hover:bg-white hover:text-orange-600"
                onClick={() => router.push('/map?category=drink')}
              >
                <Wine className="mr-2 h-5 w-5" />
                바로 술모임 찾아보기
              </Button>
            </div>
            <div className="mt-8 text-sm opacity-80">
              * 가입비 무료 · 술모임 참여 무료 · 부담없이 시작하세요
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
