/* src/app/hobby/page.tsx - 취미모임 전용 랜딩 페이지 */
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
import Palette from 'lucide-react/dist/esm/icons/palette'
import BookOpen from 'lucide-react/dist/esm/icons/book-open'
import Coffee from 'lucide-react/dist/esm/icons/coffee'
import Gamepad2 from 'lucide-react/dist/esm/icons/gamepad-2'

const HOBBY_SPOTS = [
  {
    name: '카페',
    description: '독서, 스터디, 보드게임 모임',
    emoji: '☕',
    activeRooms: 28,
    popularTime: '14:00-18:00, 19:00-22:00',
  },
  {
    name: '공원',
    description: '사진촬영, 그림그리기, 버스킹',
    emoji: '🌳',
    activeRooms: 16,
    popularTime: '10:00-12:00, 15:00-18:00',
  },
  {
    name: '문화센터',
    description: '요리, 수공예, 언어교환 클래스',
    emoji: '🎨',
    activeRooms: 22,
    popularTime: '10:00-12:00, 19:00-21:00',
  },
  {
    name: '전시/공연장',
    description: '전시관람, 공연관람, 문화체험',
    emoji: '🎭',
    activeRooms: 12,
    popularTime: '11:00-17:00',
  },
]

const HOBBY_TYPES = [
  { type: '독서', emoji: '📚', rooms: 24 },
  { type: '사진', emoji: '📸', rooms: 18 },
  { type: '요리', emoji: '👩‍🍳', rooms: 20 },
  { type: '보드게임', emoji: '🎲', rooms: 16 },
  { type: '언어교환', emoji: '🗣️', rooms: 14 },
  { type: '음악', emoji: '🎵', rooms: 12 },
]

const HOBBY_CATEGORIES = [
  {
    category: '창작활동',
    hobbies: ['그림그리기', '사진촬영', '글쓰기', '영상편집', '음악제작'],
    color: 'from-pink-500 to-purple-500',
    icon: '🎨',
  },
  {
    category: '학습모임',
    hobbies: ['독서토론', '언어교환', '스터디', '독서', '강연'],
    color: 'from-blue-500 to-cyan-500',
    icon: '📚',
  },
  {
    category: '문화생활',
    hobbies: ['전시관람', '영화감상', '공연관람', '뮤지컬', '콘서트'],
    color: 'from-emerald-500 to-teal-500',
    icon: '🎭',
  },
  {
    category: '게임/오락',
    hobbies: ['보드게임', '카드게임', '비디오게임', 'VR체험', '방탈출'],
    color: 'from-orange-500 to-red-500',
    icon: '🎮',
  },
]

export default function HobbyLandingPage() {
  const [isVisible, setIsVisible] = useState(false)
  // const [selectedCategory, setSelectedCategory] = useState(0)
  const router = useRouter()

  useEffect(() => {
    setIsVisible(true)
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
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
            <div className="mb-6 text-6xl">✨</div>
            <h1 className="mb-6 text-5xl font-bold text-gray-900">
              혼자 취미생활하기 <span className="text-purple-600">심심한 날</span>
            </h1>
            <p className="mb-8 text-xl leading-relaxed text-gray-600">
              근처에서 같은 취미를 가진 사람들과 만나보세요!
              <br />
              독서, 사진, 요리부터 보드게임까지 다양한 취미활동을 함께 즐겨요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                className="bg-purple-600 px-8 text-lg hover:bg-purple-700"
                onClick={() => router.push('/map?category=hobby')}
              >
                <MapPin className="mr-2 h-5 w-5" />
                근처 취미모임 찾기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="px-8 text-lg"
                onClick={() => router.push('/room/new?category=hobby')}
              >
                <Users className="mr-2 h-5 w-5" />
                취미모임 만들기
              </Button>
            </div>
          </div>
        </section>

        {/* Stats Section */}
        <section className="bg-white/50 py-16">
          <div className="mx-auto max-w-6xl px-4">
            <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
              <div>
                <div className="text-3xl font-bold text-purple-600">2,156+</div>
                <div className="text-gray-600">활성 취미모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">127+</div>
                <div className="text-gray-600">오늘의 새 모임</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">4.8★</div>
                <div className="text-gray-600">평균 만족도</div>
              </div>
              <div>
                <div className="text-3xl font-bold text-purple-600">85%</div>
                <div className="text-gray-600">장기 참여율</div>
              </div>
            </div>
          </div>
        </section>

        {/* Hobby Categories */}
        <section className="px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              다양한 취미 카테고리 🎨
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {HOBBY_CATEGORIES.map((category, index) => (
                <Card
                  key={category.category}
                  className={`transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'animate-in slide-in-from-bottom-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() =>
                    router.push(`/map?category=hobby&subcategory=${category.category}`)
                  }
                >
                  <CardContent className="p-6">
                    <div
                      className={`h-32 w-full bg-gradient-to-r ${category.color} mb-4 flex items-center justify-center rounded-lg text-4xl text-white`}
                    >
                      {category.icon}
                    </div>
                    <h3 className="mb-3 text-center text-xl font-bold text-gray-900">
                      {category.category}
                    </h3>
                    <div className="space-y-1">
                      {category.hobbies.slice(0, 3).map(hobby => (
                        <Badge key={hobby} variant="secondary" className="mr-1 mb-1 text-xs">
                          {hobby}
                        </Badge>
                      ))}
                      {category.hobbies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{category.hobbies.length - 3}개 더
                        </Badge>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Popular Areas */}
        <section className="bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              인기 취미모임 장소 🗺️
            </h2>
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
              {HOBBY_SPOTS.map((spot, index) => (
                <Card
                  key={spot.name}
                  className={`transform cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${isVisible ? 'animate-in slide-in-from-left-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?location=${spot.name}&category=hobby`)}
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

        {/* Popular Hobbies */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">인기 취미활동 🌟</h2>
            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
              {HOBBY_TYPES.map((hobby, index) => (
                <Card
                  key={hobby.type}
                  className={`cursor-pointer transition-all duration-300 hover:shadow-md ${isVisible ? 'animate-in slide-in-from-right-4' : ''}`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                  onClick={() => router.push(`/map?hobby=${hobby.type}&category=hobby`)}
                >
                  <CardContent className="p-4 text-center">
                    <div className="mb-2 text-3xl">{hobby.emoji}</div>
                    <div className="font-semibold text-gray-900">{hobby.type}</div>
                    <div className="text-sm text-gray-600">{hobby.rooms}개 모임</div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="bg-gradient-to-r from-pink-50 to-purple-50 px-4 py-16">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              함께 하는 취미활동의 즐거움 💝
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Palette className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">새로운 영감</h3>
                <p className="text-gray-600">
                  다양한 사람들과의 만남을 통해 내 취미에 새로운 아이디어와 영감을 얻어보세요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">소중한 인맥</h3>
                <p className="text-gray-600">
                  같은 취미를 가진 사람들과 깊이 있는 대화를 나누고 평생 친구를 만들어보세요.
                </p>
              </div>
              <div className="text-center">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-purple-100">
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
                <h3 className="mb-3 text-xl font-bold">실력 향상</h3>
                <p className="text-gray-600">
                  경험이 많은 분들과 함께하며 내 취미 실력을 한 단계 업그레이드해보세요.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Success Stories */}
        <section className="bg-white px-4 py-16">
          <div className="mx-auto max-w-4xl">
            <h2 className="mb-12 text-center text-3xl font-bold text-gray-900">
              취미친구들의 생생한 후기 💬
            </h2>
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              <Card className="bg-gradient-to-br from-purple-50 to-pink-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-purple-200">
                      <span className="text-xl">📚</span>
                    </div>
                    <div>
                      <div className="font-semibold">지은님 (26세)</div>
                      <div className="text-sm text-gray-600">독서모임 정기멤버</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "혼자 책만 읽다가 밋핀 독서모임에 참여하게 되었는데, 같은 책을 읽고 토론하니까
                    이해도 더 깊어지고 새로운 시각도 얻을 수 있어서 너무 좋아요! 📚"
                  </p>
                  <div className="mt-3 flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-current" />
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-gradient-to-br from-pink-50 to-orange-50">
                <CardContent className="p-6">
                  <div className="mb-4 flex items-center">
                    <div className="mr-3 flex h-12 w-12 items-center justify-center rounded-full bg-pink-200">
                      <span className="text-xl">📸</span>
                    </div>
                    <div>
                      <div className="font-semibold">현수님 (31세)</div>
                      <div className="text-sm text-gray-600">사진동호회 활동</div>
                    </div>
                  </div>
                  <p className="text-gray-700 italic">
                    "사진 취미로 시작했는데 밋핀에서 만난 선배님들께 많이 배웠어요! 이제 사진전
                    준비하고 있고, 정말 소중한 사람들을 만났습니다 ✨"
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
        <section className="bg-gradient-to-r from-purple-600 to-pink-600 px-4 py-20 text-white">
          <div className="mx-auto max-w-4xl text-center">
            <h2 className="mb-6 text-4xl font-bold">내 취미를 더 특별하게! 🌈</h2>
            <p className="mb-8 text-xl opacity-90">
              신규 가입 시 프리미엄 부스트 3일 무료!
              <br />내 취미모임이 상단에 노출되어 더 많은 취미친구들과 만날 수 있어요
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                size="lg"
                variant="secondary"
                className="px-8 text-lg"
                onClick={() => router.push('/auth/signup')}
              >
                <Coffee className="mr-2 h-5 w-5" />
                무료 회원가입하고 시작하기
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white bg-transparent px-8 text-lg text-white hover:bg-white hover:text-purple-600"
                onClick={() => router.push('/map?category=hobby')}
              >
                <Gamepad2 className="mr-2 h-5 w-5" />
                바로 취미모임 찾아보기
              </Button>
            </div>
            <div className="mt-8 text-sm opacity-80">
              * 가입비 무료 · 취미모임 참여 무료 · 새로운 취미 친구들을 만나보세요
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
