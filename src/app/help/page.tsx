/* src/app/help/page.tsx */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import ArrowLeft from 'lucide-react/dist/esm/icons/arrow-left'
import ChevronDown from 'lucide-react/dist/esm/icons/chevron-down'
import ChevronUp from 'lucide-react/dist/esm/icons/chevron-up'
import Search from 'lucide-react/dist/esm/icons/search'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import Mail from 'lucide-react/dist/esm/icons/mail'
import Phone from 'lucide-react/dist/esm/icons/phone'
import HelpCircle from 'lucide-react/dist/esm/icons/help-circle'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null)

  const faqCategories = [
    {
      category: '🚀 시작하기',
      color: 'from-blue-500 to-cyan-500',
      questions: [
        {
          question: '밋핀이 뭔가요?',
          answer:
            '밋핀은 위치 기반 소셜 만남 플랫폼입니다. 지도에서 관심있는 모임을 찾고, 가까운 사람들과 다양한 활동을 함께 할 수 있어요. 술, 운동, 취미 등 원하는 모든 종류의 모임에 참여할 수 있습니다.',
        },
        {
          question: '어떻게 시작하나요?',
          answer:
            '1) 회원가입 후 프로필을 설정하세요. 2) 지도에서 관심있는 모임을 찾거나 직접 모임을 만드세요. 3) 참가 신청을 보내거나 받아보세요. 4) 수락되면 1:1 채팅으로 세부사항을 논의해요.',
        },
        {
          question: '무료로 사용할 수 있나요?',
          answer:
            '네! 밋핀의 모든 기능은 무료입니다. 모임 만들기, 참가 신청, 채팅 등 모든 기능을 무료로 이용하실 수 있어요.',
        },
        {
          question: '안전한가요?',
          answer:
            '사용자 안전을 최우선으로 합니다. 신고 기능, 차단 기능, 사용자 검증 시스템을 통해 안전한 만남 환경을 제공하고 있어요. 의심스러운 활동은 즉시 신고해주세요.',
        },
      ],
    },
    {
      category: '🗺️ 모임 찾기',
      color: 'from-green-500 to-emerald-500',
      questions: [
        {
          question: '어떤 종류의 모임이 있나요?',
          answer:
            '🍻 술 모임: 맥주, 와인, 칵테일 등 다양한 음주 모임\n💪 운동 모임: 헬스, 러닝, 클라이밍, 요가 등\n✨ 기타: 영화, 카페, 독서, 게임, 쇼핑 등 모든 취미 활동',
        },
        {
          question: '지도에서 모임을 어떻게 찾나요?',
          answer:
            '지도 페이지에서 관심있는 지역을 탐색하세요. 핀을 클릭하면 모임 정보를 확인할 수 있어요. 카테고리 필터를 사용해 원하는 종류의 모임만 볼 수도 있습니다.',
        },
        {
          question: '참가 신청은 어떻게 하나요?',
          answer:
            '관심있는 모임을 찾았다면 "참가 신청" 버튼을 클릭하세요. 간단한 메시지와 함께 신청을 보낼 수 있어요. 호스트가 수락하면 1:1 채팅이 시작됩니다.',
        },
        {
          question: '내 위치 정보는 안전한가요?',
          answer:
            '위치 정보는 모임 찾기에만 사용되며, 정확한 위치는 공개되지 않습니다. 대략적인 지역 정보만 다른 사용자에게 보여지므로 안전해요.',
        },
      ],
    },
    {
      category: '🏠 모임 만들기',
      color: 'from-purple-500 to-pink-500',
      questions: [
        {
          question: '모임을 어떻게 만드나요?',
          answer:
            '"새 모임 만들기"를 클릭하고 필요한 정보를 입력하세요. 제목, 카테고리, 위치, 시간, 참가 인원, 참가비 등을 설정할 수 있어요.',
        },
        {
          question: '참가비를 받을 수 있나요?',
          answer:
            '네! 모임 생성 시 참가비를 설정할 수 있어요. 0원(무료)부터 100,000원까지 설정 가능합니다. 참가비는 현장에서 직접 정산하시면 됩니다.',
        },
        {
          question: '모임을 취소하려면 어떻게 하나요?',
          answer:
            '내가 만든 모임은 모임 상세페이지에서 취소할 수 있어요. 참가자들에게 자동으로 취소 알림이 발송됩니다.',
        },
      ],
    },
    {
      category: '💬 채팅 & 매칭',
      color: 'from-orange-500 to-red-500',
      questions: [
        {
          question: '채팅은 언제 시작되나요?',
          answer:
            '참가 신청이 수락되면 자동으로 1:1 채팅방이 생성됩니다. 실시간으로 메시지를 주고받을 수 있어요.',
        },
        {
          question: '채팅에서 무엇을 이야기해야 하나요?',
          answer:
            '만날 구체적인 장소, 시간, 복장, 연락처 등을 논의하세요. 서로에 대해 간단히 소개하고 모임에 대한 기대사항을 공유하는 것도 좋아요.',
        },
        {
          question: '불쾌한 메시지를 받으면 어떻게 하나요?',
          answer:
            '채팅방에서 신고 버튼을 누르거나 사용자를 차단할 수 있어요. 스팸, 욕설, 부적절한 내용은 즉시 신고해주세요.',
        },
        {
          question: '채팅 기록이 저장되나요?',
          answer:
            '채팅 기록은 일정 기간 저장되지만, 언제든지 채팅방을 나가거나 삭제할 수 있어요. 개인정보는 안전하게 보호됩니다.',
        },
      ],
    },
  ]

  const quickHelp = [
    {
      icon: '🎯',
      title: '모임 참가 팁',
      description: '성공적인 모임 참가를 위한 노하우',
      link: '#tips',
    },
    {
      icon: '🔒',
      title: '안전 가이드',
      description: '안전한 만남을 위한 주의사항',
      link: '#safety',
    },
    {
      icon: '📞',
      title: '문의하기',
      description: '직접 문의가 필요하다면',
      link: '#contact',
    },
    {
      icon: '🐛',
      title: '오류 신고',
      description: '버그나 문제점 신고하기',
      link: '#report',
    },
  ]

  const filteredFaqCategories = faqCategories
    .map(category => ({
      ...category,
      questions: category.questions.filter(
        faq =>
          faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
      ),
    }))
    .filter(category => category.questions.length > 0)

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index)
  }

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
            <h1 className="text-xl font-bold text-gray-900">도움말 & FAQ</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto max-w-4xl px-4 py-12">
        {/* Hero Section */}
        <div className="mb-12 text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg">
            <HelpCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="mb-4 text-4xl font-bold text-gray-900">도움이 필요하신가요?</h1>
          <p className="mb-8 text-xl text-gray-600">
            자주 묻는 질문과 답변을 확인하시거나, 직접 문의해주세요
          </p>

          {/* Search */}
          <div className="relative mx-auto mb-8 max-w-xl">
            <Search className="absolute top-1/2 left-4 h-5 w-5 -translate-y-1/2 transform text-gray-400" />
            <input
              type="text"
              placeholder="궁금한 내용을 검색해보세요..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full rounded-2xl border border-gray-200 bg-white/80 py-4 pr-4 pl-12 text-gray-800 shadow-lg backdrop-blur-sm transition-all focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Quick Help Cards */}
        <div className="mb-12 grid grid-cols-2 gap-4 md:grid-cols-4">
          {quickHelp.map((item, index) => (
            <Card
              key={index}
              className="transform cursor-pointer border-0 bg-white/80 text-center shadow-lg backdrop-blur-sm transition-all hover:scale-105 hover:shadow-xl"
            >
              <CardContent className="p-6">
                <div className="mb-3 text-3xl">{item.icon}</div>
                <h3 className="mb-2 text-sm font-bold text-gray-900">{item.title}</h3>
                <p className="text-xs text-gray-600">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* FAQ Sections */}
        <div className="space-y-8">
          {filteredFaqCategories.length === 0 && searchQuery && (
            <div className="py-12 text-center">
              <div className="mb-4 text-6xl">🤔</div>
              <h3 className="mb-2 text-xl font-bold text-gray-900">검색 결과가 없습니다</h3>
              <p className="mb-4 text-gray-600">
                다른 검색어로 시도해보시거나, 아래 연락처로 직접 문의해주세요.
              </p>
              <Button
                onClick={() => setSearchQuery('')}
                className="bg-blue-500 text-white hover:bg-blue-600"
              >
                전체 FAQ 보기
              </Button>
            </div>
          )}

          {(searchQuery ? filteredFaqCategories : faqCategories).map((category, categoryIndex) => (
            <div key={categoryIndex} className="mb-12">
              <div className="mb-6 flex items-center">
                <div
                  className={`h-12 w-12 bg-gradient-to-br ${category.color} mr-4 flex items-center justify-center rounded-xl text-lg font-bold text-white shadow-lg`}
                >
                  {category.category.split(' ')[0]}
                </div>
                <h2 className="text-2xl font-bold text-gray-900">{category.category}</h2>
              </div>

              <div className="space-y-4">
                {category.questions.map((faq, questionIndex) => {
                  const globalIndex = categoryIndex * 100 + questionIndex
                  const isExpanded = expandedFaq === globalIndex

                  return (
                    <Card
                      key={questionIndex}
                      className="border-0 bg-white/80 shadow-lg backdrop-blur-sm transition-all hover:shadow-xl"
                    >
                      <CardContent className="p-0">
                        <button
                          onClick={() => toggleFaq(globalIndex)}
                          className="flex w-full items-center justify-between p-6 text-left transition-colors hover:bg-gray-50/50"
                        >
                          <h3 className="pr-4 text-lg font-semibold text-gray-900">
                            {faq.question}
                          </h3>
                          {isExpanded ? (
                            <ChevronUp className="h-5 w-5 flex-shrink-0 text-gray-500" />
                          ) : (
                            <ChevronDown className="h-5 w-5 flex-shrink-0 text-gray-500" />
                          )}
                        </button>

                        {isExpanded && (
                          <div className="px-6 pb-6">
                            <div className="border-t border-gray-200 pt-4">
                              <p className="leading-relaxed whitespace-pre-line text-gray-700">
                                {faq.answer}
                              </p>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Contact Section */}
        <div id="contact" className="mt-16">
          <Card className="border-0 bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow-2xl">
            <CardContent className="p-12 text-center">
              <MessageCircle className="mx-auto mb-6 h-16 w-16" />
              <h2 className="mb-4 text-3xl font-bold">더 궁금한게 있으신가요?</h2>
              <p className="mb-8 text-xl opacity-90">
                언제든지 편하게 연락주세요. 빠르게 도와드리겠습니다!
              </p>

              <div className="mx-auto grid max-w-2xl gap-6 md:grid-cols-3">
                <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                  <Mail className="mx-auto mb-3 h-8 w-8" />
                  <h3 className="mb-2 font-semibold">이메일</h3>
                  <p className="text-sm opacity-90">support@meetpin.co.kr</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                  <MessageCircle className="mx-auto mb-3 h-8 w-8" />
                  <h3 className="mb-2 font-semibold">카카오톡</h3>
                  <p className="text-sm opacity-90">@밋핀고객센터</p>
                </div>

                <div className="rounded-2xl bg-white/10 p-6 backdrop-blur-sm">
                  <Phone className="mx-auto mb-3 h-8 w-8" />
                  <h3 className="mb-2 font-semibold">전화</h3>
                  <p className="text-sm opacity-90">02-1234-5678</p>
                </div>
              </div>

              <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
                <Button
                  asChild
                  size="lg"
                  className="bg-white px-8 py-3 text-lg font-semibold text-blue-600 shadow-lg hover:bg-gray-100"
                >
                  <Link href="/contact">📧 문의하기</Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white px-8 py-3 text-lg font-semibold text-white hover:bg-white hover:text-blue-600"
                >
                  <Link href="/about">🏢 회사 소개</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Resources */}
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <Link href="/legal/success-tips" className="block transition-transform hover:scale-105">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-4xl">🎯</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">모임 참가 성공 팁</h3>
                <p className="mb-4 text-sm text-gray-600">
                  첫 만남을 성공적으로 만들기 위한 실용적인 조언들을 확인해보세요.
                </p>
                <Badge className="border-blue-200 bg-blue-100 text-blue-800">바로가기 →</Badge>
              </CardContent>
            </Card>
          </Link>

          <Link href="/legal/safety" className="block transition-transform hover:scale-105">
            <Card className="border-0 bg-white/80 shadow-lg backdrop-blur-sm">
              <CardContent className="p-8 text-center">
                <div className="mb-4 text-4xl">🔒</div>
                <h3 className="mb-3 text-xl font-bold text-gray-900">안전 가이드라인</h3>
                <p className="mb-4 text-sm text-gray-600">
                  안전하고 즐거운 모임을 위한 필수 안전 수칙을 알아보세요.
                </p>
                <Badge className="border-green-200 bg-green-100 text-green-800">바로가기 →</Badge>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  )
}
