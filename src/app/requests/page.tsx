/* 파일경로: src/app/requests/page.tsx */
'use client'

import { brandMessages } from '@/lib/brand'
import { useState } from 'react'

export default function RequestsPage() {
  const [activeTab, setActiveTab] = useState<'my' | 'host'>('my')

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            📨 요청함
          </h1>
        </div>
      </header>

      {/* Tabs */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveTab('my')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'my'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              보낸 요청
            </button>
            <button
              onClick={() => setActiveTab('host')}
              className={`py-3 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'host'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-text-muted hover:text-text'
              }`}
            >
              받은 요청
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">
              {activeTab === 'my' ? '📤' : '📥'}
            </span>
          </div>
          <h3 className="text-lg font-medium text-text mb-2">
            {activeTab === 'my' ? '보낸 요청이 없습니다' : '받은 요청이 없습니다'}
          </h3>
          <p className="text-text-muted text-sm">
            {activeTab === 'my'
              ? '관심있는 방에 참가 신청을 보내보세요!'
              : '방을 만들면 다른 사람들의 참가 신청을 받을 수 있습니다.'
            }
          </p>
        </div>

        {/* Placeholder Info */}
        <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm text-blue-800">
            🚧 <strong>개발 중:</strong> 요청 관리 기능과 실시간 업데이트를 구현 중입니다.
          </p>
        </div>
      </div>
    </div>
  )
}