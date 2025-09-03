/* src/app/settings/notifications/page.tsx */
'use client'

import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/useAuth'
import { NotificationSettings } from '@/components/ui/NotificationSettings'
import { ArrowLeft, Bell } from 'lucide-react'
import { useEffect } from 'react'

export default function NotificationSettingsPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  // 인증되지 않은 사용자 리다이렉트
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">설정을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (!user) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-500/10 via-blue-500/5 to-purple-500/10">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-white/20 sticky top-0 z-50">
        <div className="px-4 py-4 flex items-center justify-between">
          <button 
            onClick={() => router.back()}
            className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-gray-700" />
          </button>
          <div className="flex items-center space-x-2">
            <Bell className="w-6 h-6 text-gray-700" />
            <h1 className="text-xl font-bold text-gray-900">알림 설정</h1>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>
      </header>

      <div className="px-4 py-8 max-w-2xl mx-auto">
        {/* 페이지 소개 */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Bell className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">알림 설정</h2>
          <p className="text-gray-600">
            중요한 메시지와 모임 소식을 놓치지 마세요.<br/>
            원하는 알림만 선택해서 받아보실 수 있습니다.
          </p>
        </div>

        {/* 알림 설정 컴포넌트 */}
        <NotificationSettings />

        {/* 추가 정보 */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
          <h3 className="font-semibold text-blue-900 mb-3 flex items-center">
            <Bell className="w-5 h-5 mr-2" />
            알림 작동 방식
          </h3>
          <ul className="text-sm text-blue-800 space-y-2">
            <li>• <strong>브라우저 알림:</strong> 밋핀 탭이 활성화되지 않았을 때 알림이 표시됩니다</li>
            <li>• <strong>토스트 알림:</strong> 밋핀 사용 중에도 화면 상단에 간단한 알림이 나타납니다</li>
            <li>• <strong>실시간 업데이트:</strong> 새로운 메시지나 요청이 즉시 반영됩니다</li>
            <li>• <strong>방해 금지:</strong> 브라우저의 방해 금지 모드를 설정하면 알림이 제한됩니다</li>
          </ul>
        </div>

        {/* 문제 해결 */}
        <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-6">
          <h3 className="font-semibold text-amber-900 mb-3">알림이 작동하지 않나요?</h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p><strong>다음 사항을 확인해보세요:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>브라우저에서 알림 권한이 허용되어 있는지 확인</li>
              <li>운영체제의 알림 설정이 활성화되어 있는지 확인</li>
              <li>방해 금지 모드나 포커스 모드가 꺼져 있는지 확인</li>
              <li>브라우저가 최신 버전인지 확인</li>
            </ul>
            <p className="mt-3">
              <strong>여전히 문제가 있다면:</strong> 페이지를 새로고침하거나 브라우저를 재시작해보세요.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}