/* src/app/about/page.tsx */
'use client'

import Link from 'next/link'
import {
  ArrowLeft,
  MapPin,
  Users,
  MessageCircle,
  Shield,
  Heart,
  Zap,
  Award,
  Target,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function AboutPage() {
  const stats = [
    { value: '1,000+', label: '활성 사용자', icon: '👥' },
    { value: '5,000+', label: '성공한 모임', icon: '🎉' },
    { value: '50+', label: '서울 전 지역', icon: '📍' },
    { value: '4.9', label: '사용자 만족도', icon: '⭐' },
  ]

  const features = [
    {
      icon: <MapPin className="h-6 w-6" />,
      title: '위치 기반 매칭',
      description: '지도에서 가까운 모임을 쉽게 찾고 참여하세요',
      color: 'from-blue-500 to-cyan-500',
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: '다양한 카테고리',
      description: '술, 운동, 취미 등 원하는 모든 종류의 모임',
      color: 'from-purple-500 to-pink-500',
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: '실시간 채팅',
      description: '매칭된 사용자와 1:1 실시간 채팅',
      color: 'from-green-500 to-emerald-500',
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: '안전한 만남',
      description: '신고, 차단 기능으로 안전하게 보호',
      color: 'from-red-500 to-orange-500',
    },
  ]

  const team = [
    {
      name: '김개발',
      role: 'CEO & Founder',
      description: '10년 차 풀스택 개발자, 사회적 연결의 가치를 믿습니다',
      avatar: '👨‍💻',
    },
    {
      name: '이디자인',
      role: 'Head of Design',
      description: 'UX/UI 전문가, 사용자 중심의 디자인을 추구합니다',
      avatar: '🎨',
    },
    {
      name: '박마케팅',
      role: 'Growth Manager',
      description: '커뮤니티 성장과 사용자 만족을 책임집니다',
      avatar: '📈',
    },
  ]

  const timeline = [
    {
      date: '2024년 1월',
      title: '밋핀 프로젝트 시작',
      description: '위치 기반 소셜 만남 플랫폼 개발 시작',
    },
    {
      date: '2024년 3월',
      title: '베타 버전 출시',
      description: '초기 사용자들과 함께 서비스 테스트',
    },
    {
      date: '2024년 6월',
      title: '정식 서비스 런칭',
      description: '실시간 채팅과 위치 기반 매칭 완성',
    },
    {
      date: '2024년 9월',
      title: '1000명 돌파',
      description: '활성 사용자 1000명 돌파, 안정적 서비스 제공',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-white/20 bg-white/90 backdrop-blur-md">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link
              href="/"
              className="flex items-center space-x-2 text-gray-600 transition-colors hover:text-gray-800"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>홈으로</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">밋핀 소개</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <div className="mb-8">
            <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 shadow-2xl">
              <span className="text-4xl">📍</span>
            </div>
            <h1 className="mb-4 text-5xl font-black text-gray-900">
              <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
                밋핀
              </span>
            </h1>
            <p className="mb-6 text-2xl text-gray-600">핀 찍고, 지금 모여요!</p>
            <p className="mx-auto max-w-2xl text-lg leading-relaxed text-gray-500">
              새로운 인연을 위한 위치 기반 만남 서비스입니다. 지도에서 관심있는 모임을 찾고, 가까운
              사람들과 소중한 추억을 만들어보세요.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 px-8 py-3 text-lg font-semibold text-white shadow-lg transition-all hover:from-emerald-600 hover:to-teal-600 hover:shadow-xl"
            >
              <Link href="/auth/signup">🚀 지금 시작하기</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-emerald-500 px-8 py-3 text-lg font-semibold text-emerald-600 transition-all hover:bg-emerald-500 hover:text-white"
            >
              <Link href="/map">👀 모임 둘러보기</Link>
            </Button>
          </div>
        </div>

        {/* Stats Section */}
        <div className="mb-16 grid grid-cols-2 gap-6 md:grid-cols-4">
          {stats.map((stat, index) => (
            <Card
              key={index}
              className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="mb-2 text-3xl">{stat.icon}</div>
                <div className="mb-1 text-3xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">왜 밋핀을 선택해야 할까요?</h2>
            <p className="text-xl text-gray-600">사용자들이 밋핀을 선택하는 이유</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="transform border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl"
              >
                <CardContent className="p-8">
                  <div
                    className={`h-16 w-16 bg-gradient-to-br ${feature.color} mb-6 flex items-center justify-center rounded-2xl text-white shadow-lg`}
                  >
                    {feature.icon}
                  </div>
                  <h3 className="mb-3 text-2xl font-bold text-gray-900">{feature.title}</h3>
                  <p className="leading-relaxed text-gray-600">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Mission Section */}
        <div className="mb-16 rounded-3xl bg-gradient-to-r from-emerald-500 to-teal-500 p-12 text-center text-white">
          <Heart className="mx-auto mb-6 h-16 w-16" />
          <h2 className="mb-6 text-4xl font-bold">우리의 미션</h2>
          <p className="mx-auto max-w-3xl text-xl leading-relaxed">
            &ldquo;혼자 있는 시간이 많은 현대인들에게 새로운 인연과 경험의 기회를 제공하여, 더
            풍요롭고 연결된 삶을 살 수 있도록 돕는 것&rdquo;
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 px-4 py-2 text-base text-white"
            >
              #연결
            </Badge>
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 px-4 py-2 text-base text-white"
            >
              #소통
            </Badge>
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 px-4 py-2 text-base text-white"
            >
              #공유
            </Badge>
            <Badge
              variant="secondary"
              className="border-white/30 bg-white/20 px-4 py-2 text-base text-white"
            >
              #성장
            </Badge>
          </div>
        </div>

        {/* Timeline Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">밋핀의 성장 스토리</h2>
            <p className="text-xl text-gray-600">사용자와 함께 만들어온 여정</p>
          </div>

          <div className="space-y-8">
            {timeline.map((item, index) => (
              <div key={index} className="flex items-start space-x-6">
                <div className="flex-shrink-0">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                </div>
                <div className="flex-1 rounded-2xl bg-white/80 p-6 shadow-lg backdrop-blur-sm">
                  <div className="mb-1 text-sm font-semibold text-emerald-600">{item.date}</div>
                  <h3 className="mb-2 text-xl font-bold text-gray-900">{item.title}</h3>
                  <p className="text-gray-600">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Team Section */}
        <div className="mb-16">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-4xl font-bold text-gray-900">팀을 소개합니다</h2>
            <p className="text-xl text-gray-600">밋핀을 만들어가는 사람들</p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {team.map((member, index) => (
              <Card
                key={index}
                className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
              >
                <CardContent className="p-8">
                  <div className="mb-4 text-6xl">{member.avatar}</div>
                  <h3 className="mb-2 text-2xl font-bold text-gray-900">{member.name}</h3>
                  <Badge className="mb-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white">
                    {member.role}
                  </Badge>
                  <p className="text-sm leading-relaxed text-gray-600">{member.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Values Section */}
        <div className="mb-16 grid gap-8 md:grid-cols-3">
          <Card className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm">
            <CardContent className="p-8">
              <Target className="mx-auto mb-4 h-12 w-12 text-blue-500" />
              <h3 className="mb-3 text-xl font-bold text-gray-900">사용자 중심</h3>
              <p className="text-sm text-gray-600">
                모든 기능과 디자인은 사용자의 편의와 만족을 최우선으로 합니다
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm">
            <CardContent className="p-8">
              <Zap className="mx-auto mb-4 h-12 w-12 text-yellow-500" />
              <h3 className="mb-3 text-xl font-bold text-gray-900">혁신</h3>
              <p className="text-sm text-gray-600">
                새로운 기술과 창의적 아이디어로 더 나은 서비스를 만들어갑니다
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm">
            <CardContent className="p-8">
              <Award className="mx-auto mb-4 h-12 w-12 text-purple-500" />
              <h3 className="mb-3 text-xl font-bold text-gray-900">품질</h3>
              <p className="text-sm text-gray-600">
                안정적이고 신뢰할 수 있는 서비스 품질을 유지합니다
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 p-12 text-center text-white">
          <h2 className="mb-4 text-4xl font-bold">지금 바로 시작해보세요!</h2>
          <p className="mb-8 text-xl opacity-90">
            새로운 인연과 특별한 경험이 여러분을 기다리고 있습니다
          </p>
          <div className="flex flex-col justify-center gap-4 sm:flex-row">
            <Button
              asChild
              size="lg"
              className="bg-white px-8 py-3 text-lg font-semibold text-purple-600 shadow-lg hover:bg-gray-100"
            >
              <Link href="/auth/signup">🎉 회원가입하기</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-purple-600"
            >
              <Link href="/help">❓ 도움말 보기</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
