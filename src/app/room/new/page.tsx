/* 파일경로: src/app/room/new/page.tsx */
'use client'

import { brandMessages } from '@/lib/brand'
import { useState } from 'react'

export default function NewRoomPage() {
  const [formData, setFormData] = useState({
    title: '',
    category: 'drink' as const,
    max_participants: 4,
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Room creation form data:', formData)
    alert('방 생성 기능은 준비 중입니다. 곧 API 연동을 완료할 예정입니다.')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            🏠 새 방 만들기
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="container mx-auto px-4 py-8 max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-text mb-2">
              방 제목
            </label>
            <input
              id="title"
              type="text"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary focus:border-transparent"
              placeholder="예: 홍대에서 맥주 한 잔 🍻"
              required
            />
          </div>

          <div>
            <label htmlFor="category" className="block text-sm font-medium text-text mb-2">
              카테고리
            </label>
            <select
              id="category"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as any }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            >
              <option value="drink">🍻 술</option>
              <option value="exercise">💪 운동</option>
              <option value="other">✨ 기타</option>
            </select>
          </div>

          <div>
            <label htmlFor="max_participants" className="block text-sm font-medium text-text mb-2">
              최대 참여자 수
            </label>
            <input
              id="max_participants"
              type="number"
              min="2"
              max="10"
              value={formData.max_participants}
              onChange={(e) => setFormData(prev => ({ ...prev, max_participants: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-primary-deep text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            방 만들기
          </button>
        </form>

        {/* Placeholder Info */}
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800">
            🚧 <strong>개발 중:</strong> RoomForm 컴포넌트와 API 연동을 곧 완료할 예정입니다.
          </p>
        </div>
      </div>
    </div>
  )
}