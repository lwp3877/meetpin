/* 파일경로: src/app/profile/page.tsx */
'use client'

import { brandMessages } from '@/lib/brand'
import { useState } from 'react'

export default function ProfilePage() {
  const [formData, setFormData] = useState({
    nickname: '',
    age_range: '20s_early' as const,
    interests: [] as string[],
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Profile form data:', formData)
    alert('프로필 설정 기능은 준비 중입니다. Supabase 연동을 완료하면 사용할 수 있습니다.')
  }

  const ageRanges = [
    { value: '20s_early', label: '20대 초반' },
    { value: '20s_late', label: '20대 후반' },
    { value: '30s_early', label: '30대 초반' },
    { value: '30s_late', label: '30대 후반' },
    { value: '40s', label: '40대' },
    { value: '50s+', label: '50대 이상' },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            👤 프로필 설정
          </h1>
        </div>
      </header>

      {/* Onboarding Form */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-primary/10 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-3xl">👋</span>
          </div>
          <h2 className="text-xl font-bold text-text mb-2">
            환영합니다!
          </h2>
          <p className="text-text-muted text-sm">
            프로필을 완성하여 더 좋은 만남을 경험해보세요.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="nickname" className="block text-sm font-medium text-text mb-2">
              닉네임
            </label>
            <input
              id="nickname"
              type="text"
              value={formData.nickname}
              onChange={(e) => setFormData(prev => ({ ...prev, nickname: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="예: 홍길동"
              required
            />
          </div>

          <div>
            <label htmlFor="age_range" className="block text-sm font-medium text-text mb-2">
              연령대
            </label>
            <select
              id="age_range"
              value={formData.age_range}
              onChange={(e) => setFormData(prev => ({ ...prev, age_range: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              {ageRanges.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-text mb-2">
              관심분야 (선택사항)
            </label>
            <div className="space-y-2">
              {['술/음료', '운동/피트니스', '음식/맛집', '문화/예술', '여행', '게임', '독서', '영화'].map((interest) => (
                <label key={interest} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={formData.interests.includes(interest)}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setFormData(prev => ({ ...prev, interests: [...prev.interests, interest] }))
                      } else {
                        setFormData(prev => ({ ...prev, interests: prev.interests.filter(i => i !== interest) }))
                      }
                    }}
                    className="mr-2 h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                  />
                  <span className="text-sm text-text">{interest}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-deep text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            프로필 저장
          </button>
        </form>

        {/* Placeholder Info */}
        <div className="mt-8 p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            🚧 <strong>개발 중:</strong> 프로필 온보딩 폼과 Supabase 인증 연동을 완료하고 있습니다.
          </p>
        </div>
      </div>
    </div>
  )
}