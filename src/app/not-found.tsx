/* src/app/not-found.tsx */
'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Home, Search, ArrowLeft, MapPin, HelpCircle } from 'lucide-react'

export default function NotFoundPage() {
  const suggestions = [
    {
      icon: <Home className="h-5 w-5" />,
      title: '홈으로 돌아가기',
      description: '메인 페이지에서 다시 시작해보세요',
      href: '/',
      color: 'from-emerald-500 to-teal-500',
    },
    {
      icon: <MapPin className="h-5 w-5" />,
      title: '지도에서 모임 찾기',
      description: '가까운 모임을 찾아보세요',
      href: '/map',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Search className="h-5 w-5" />,
      title: '새 모임 만들기',
      description: '직접 모임을 주최해보세요',
      href: '/room/new',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <HelpCircle className="h-5 w-5" />,
      title: '도움말 확인',
      description: '자주 묻는 질문을 확인해보세요',
      href: '/help',
      color: 'from-orange-500 to-red-500',
    },
  ]

  const commonPages = [
    { name: '회원가입', href: '/auth/signup' },
    { name: '로그인', href: '/auth/login' },
    { name: '내 프로필', href: '/profile' },
    { name: '문의하기', href: '/contact' },
    { name: '회사 소개', href: '/about' },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
      <div className="container mx-auto max-w-4xl px-4 py-12">
        <div className="mb-12 text-center">
          {/* 404 Animation */}
          <div className="mb-8">
            <div className="inline-block animate-bounce">
              <div className="mb-4 text-9xl font-black text-gray-300">404</div>
            </div>
            <div className="mb-4 text-6xl">🤔</div>
          </div>

          <h1 className="mb-4 text-4xl font-black text-gray-900 md:text-5xl">
            페이지를 찾을 수 없어요
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-xl text-gray-600">
            요청하신 페이지가 존재하지 않거나 이동되었을 수 있어요. 아래의 추천 페이지를
            확인해보세요!
          </p>

          {/* Back Button */}
          <Button
            onClick={() => window.history.back()}
            variant="outline"
            size="lg"
            className="mb-12 border-2 border-emerald-500 px-8 py-3 text-lg font-semibold text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
          >
            <ArrowLeft className="mr-2 h-5 w-5" />
            이전 페이지로
          </Button>
        </div>

        {/* Suggested Actions */}
        <div className="mb-12 grid gap-6 md:grid-cols-2">
          {suggestions.map((suggestion, index) => (
            <Card
              key={index}
              className="transform border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl"
            >
              <CardContent className="p-0">
                <Link href={suggestion.href} className="block p-6">
                  <div
                    className={`h-12 w-12 bg-gradient-to-br ${suggestion.color} mb-4 flex items-center justify-center rounded-xl text-white shadow-lg`}
                  >
                    {suggestion.icon}
                  </div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{suggestion.title}</h3>
                  <p className="text-gray-600">{suggestion.description}</p>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links */}
        <div className="mb-12 text-center">
          <h2 className="mb-6 text-2xl font-bold text-gray-900">자주 찾는 페이지</h2>
          <div className="flex flex-wrap justify-center gap-3">
            {commonPages.map((page, index) => (
              <Link
                key={index}
                href={page.href}
                className="inline-flex items-center rounded-full border border-gray-200 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 backdrop-blur-sm transition-all hover:border-emerald-500 hover:text-emerald-600 hover:shadow-md"
              >
                {page.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Help Section */}
        <div className="text-center">
          <Card className="border-0 bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-2xl">
            <CardContent className="p-12">
              <div className="mb-6 text-5xl">🚀</div>
              <h2 className="mb-4 text-3xl font-bold">여전히 찾는 페이지가 없나요?</h2>
              <p className="mb-8 text-xl opacity-90">
                문제가 계속되면 저희에게 알려주세요. 빠르게 해결해드리겠습니다!
              </p>
              <div className="flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-100"
                >
                  <Link href="/contact">💌 문의하기</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/help">❓ 도움말 보기</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Fun Stats */}
        <div className="mt-12 text-center">
          <div className="mx-auto grid max-w-xl grid-cols-3 gap-6">
            <div className="rounded-2xl bg-white/60 p-4 shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-emerald-600">1,000+</div>
              <div className="text-sm text-gray-600">활성 사용자</div>
            </div>
            <div className="rounded-2xl bg-white/60 p-4 shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-blue-600">5,000+</div>
              <div className="text-sm text-gray-600">성공한 모임</div>
            </div>
            <div className="rounded-2xl bg-white/60 p-4 shadow-lg backdrop-blur-sm">
              <div className="text-2xl font-bold text-purple-600">50+</div>
              <div className="text-sm text-gray-600">서울 전 지역</div>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-500">
            여러분도 밋핀과 함께 새로운 인연을 만들어보세요! 💫
          </p>
        </div>
      </div>
    </div>
  )
}
