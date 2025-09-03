/* src/app/contact/page.tsx */
'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Mail, MessageCircle, Phone, MapPin, Clock, Send, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import toast from 'react-hot-toast'

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    category: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const categories = [
    { value: 'general', label: '일반 문의', icon: '💬', color: 'bg-blue-100 text-blue-800' },
    { value: 'bug', label: '버그 신고', icon: '🐛', color: 'bg-red-100 text-red-800' },
    { value: 'feature', label: '기능 제안', icon: '💡', color: 'bg-yellow-100 text-yellow-800' },
    { value: 'account', label: '계정 문제', icon: '👤', color: 'bg-purple-100 text-purple-800' },
    { value: 'safety', label: '신고/안전', icon: '🚨', color: 'bg-red-100 text-red-800' },
    { value: 'business', label: '비즈니스', icon: '🏢', color: 'bg-green-100 text-green-800' }
  ]

  const contactMethods = [
    {
      icon: <Mail className="h-6 w-6" />,
      title: '이메일',
      value: 'support@meetpin.co.kr',
      description: '언제든지 편하게 메일 보내주세요',
      color: 'from-blue-500 to-cyan-500',
      action: 'mailto:support@meetpin.co.kr'
    },
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: '카카오톡',
      value: '@밋핀고객센터',
      description: '빠른 상담을 원하시면',
      color: 'from-yellow-500 to-orange-500',
      action: '#'
    },
    {
      icon: <Phone className="h-6 w-6" />,
      title: '전화',
      value: '02-1234-5678',
      description: '평일 9:00-18:00',
      color: 'from-green-500 to-emerald-500',
      action: 'tel:02-1234-5678'
    }
  ]

  const faqQuick = [
    { question: '회원가입이 안돼요', answer: '이메일 형식과 비밀번호 조건을 확인해주세요' },
    { question: '모임에 참가할 수 없어요', answer: '모임이 마감되었거나 호스트가 승인하지 않았을 수 있어요' },
    { question: '채팅이 안돼요', answer: '인터넷 연결과 앱 권한을 확인해주세요' },
    { question: '위치가 정확하지 않아요', answer: '위치 서비스를 활성화하고 GPS를 켜주세요' }
  ]

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // 유효성 검사
    if (!formData.name || !formData.email || !formData.category || !formData.subject || !formData.message) {
      toast.error('모든 필드를 입력해주세요')
      return
    }

    if (!formData.email.includes('@')) {
      toast.error('올바른 이메일 주소를 입력해주세요')
      return
    }

    if (formData.message.length < 10) {
      toast.error('메시지는 최소 10자 이상 입력해주세요')
      return
    }

    setIsSubmitting(true)

    try {
      // 실제로는 API 호출을 하겠지만, 현재는 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast.success('문의가 성공적으로 접수되었습니다! 빠른 시일 내에 답변드리겠습니다.')
      
      // 폼 초기화
      setFormData({
        name: '',
        email: '',
        category: '',
        subject: '',
        message: ''
      })
    } catch {
      toast.error('문의 접수 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center space-x-2 text-gray-600 hover:text-gray-800 transition-colors">
              <ArrowLeft className="h-5 w-5" />
              <span>홈으로</span>
            </Link>
            <h1 className="text-xl font-bold text-gray-900">문의하기</h1>
            <div className="w-20" />
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12 max-w-6xl">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
            <MessageCircle className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            언제든지 연락주세요
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            궁금한 점이나 문제가 있으시면 언제든지 편하게 문의해주세요. 빠르게 도와드리겠습니다!
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-gray-900 flex items-center">
                  <Send className="h-6 w-6 mr-3 text-emerald-500" />
                  문의 양식
                </CardTitle>
              </CardHeader>
              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name & Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        이름 *
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-all text-gray-800 placeholder:text-gray-400"
                        placeholder="홍길동"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-gray-700 mb-3">
                        이메일 *
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-all text-gray-800 placeholder:text-gray-400"
                        placeholder="your@email.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      문의 유형 *
                    </label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {categories.map((category) => (
                        <button
                          key={category.value}
                          type="button"
                          onClick={() => handleInputChange('category', category.value)}
                          className={`p-4 rounded-xl border-2 transition-all text-left ${
                            formData.category === category.value
                              ? 'border-emerald-500 bg-emerald-50'
                              : 'border-gray-200 hover:border-gray-300 bg-white'
                          }`}
                        >
                          <div className="flex items-center space-x-2">
                            <span className="text-lg">{category.icon}</span>
                            <div>
                              <div className="font-semibold text-sm text-gray-900">
                                {category.label}
                              </div>
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      제목 *
                    </label>
                    <input
                      type="text"
                      value={formData.subject}
                      onChange={(e) => handleInputChange('subject', e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-all text-gray-800 placeholder:text-gray-400"
                      placeholder="문의 제목을 간단히 입력해주세요"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label className="block text-sm font-bold text-gray-700 mb-3">
                      문의 내용 *
                    </label>
                    <textarea
                      value={formData.message}
                      onChange={(e) => handleInputChange('message', e.target.value)}
                      rows={6}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-0 focus:border-emerald-500 transition-all resize-none text-gray-800 placeholder:text-gray-400"
                      placeholder="문제 상황을 자세히 설명해주시면 더 빠르고 정확한 답변을 드릴 수 있습니다..."
                      required
                    />
                    <div className="flex justify-between items-center mt-2">
                      <p className="text-xs text-gray-500">가능한 자세히 설명해주세요</p>
                      <p className="text-xs text-gray-400 font-mono">
                        {formData.message.length}/1000
                      </p>
                    </div>
                  </div>

                  {/* Submit Button */}
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    size="lg"
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center justify-center">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-3"></div>
                        문의 접수 중...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Send className="h-5 w-5 mr-2" />
                        문의 보내기
                      </div>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>
          </div>

          {/* Contact Info & FAQ */}
          <div className="space-y-6">
            {/* Contact Methods */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  다른 연락 방법
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                {contactMethods.map((method, index) => (
                  <div key={index} className="group">
                    <a
                      href={method.action}
                      className={`block p-4 rounded-xl bg-gradient-to-r ${method.color} text-white hover:shadow-lg transition-all transform hover:scale-105`}
                    >
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          {method.icon}
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white">{method.title}</h3>
                          <p className="text-white/90 text-sm font-medium">{method.value}</p>
                          <p className="text-white/75 text-xs">{method.description}</p>
                        </div>
                      </div>
                    </a>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Operating Hours */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-blue-500" />
                  운영 시간
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">평일</span>
                    <Badge className="bg-green-100 text-green-800">09:00 - 18:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">토요일</span>
                    <Badge className="bg-blue-100 text-blue-800">09:00 - 14:00</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-700 font-medium">일요일/공휴일</span>
                    <Badge className="bg-gray-100 text-gray-800">휴무</Badge>
                  </div>
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <p className="text-xs text-blue-800">
                      💡 이메일 문의는 24시간 접수 가능하며, 평일 기준 24시간 이내 답변드립니다.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick FAQ */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900">
                  자주 묻는 질문
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {faqQuick.map((faq, index) => (
                    <div key={index} className="border-b border-gray-200 last:border-0 pb-4 last:pb-0">
                      <h4 className="font-semibold text-gray-900 text-sm mb-2 flex items-center">
                        <AlertCircle className="h-4 w-4 mr-2 text-orange-500" />
                        {faq.question}
                      </h4>
                      <p className="text-gray-600 text-xs pl-6">
                        {faq.answer}
                      </p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Button
                    asChild
                    variant="outline"
                    className="w-full border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                  >
                    <Link href="/help">
                      더 많은 FAQ 보기
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Office Location */}
            <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold text-gray-900 flex items-center">
                  <MapPin className="h-5 w-5 mr-2 text-red-500" />
                  오피스 위치
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-sm">밋핀(MeetPin) 본사</h4>
                    <p className="text-gray-600 text-sm">
                      서울특별시 강남구 테헤란로<br />
                      123길 45, 밋핀빌딩 6층
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>지하철: 강남역 2번 출구 도보 5분</p>
                    <p>주차: 건물 지하 주차장 이용 가능</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="mt-16 text-center">
          <Card className="bg-gradient-to-r from-purple-500 to-pink-500 border-0 shadow-2xl text-white">
            <CardContent className="p-12">
              <CheckCircle className="h-16 w-16 mx-auto mb-6" />
              <h2 className="text-3xl font-bold mb-4">
                빠른 답변 보장
              </h2>
              <p className="text-xl opacity-90 mb-8">
                평균 4시간 이내 답변, 긴급 문의는 1시간 이내 응답드립니다
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  asChild
                  size="lg"
                  className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-3 text-lg font-semibold shadow-lg"
                >
                  <Link href="/help">
                    💡 도움말 보기
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="outline"
                  size="lg"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg font-semibold"
                >
                  <Link href="/about">
                    🏢 회사 소개
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}