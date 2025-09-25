/* src/components/LazyRealtimeComponents.tsx */
'use client'

import dynamic from 'next/dynamic'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

// 실시간 채팅 모달을 동적 로드
const RealtimeChatModal = dynamic(
  () =>
    import('@/components/ui/RealtimeChatModal').then(mod => ({ default: mod.RealtimeChatModal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <LoadingSpinner />
          <p className="mt-2 text-center">채팅을 준비하는 중...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
)

// 호스트 메시지 알림을 동적 로드
const HostMessageNotifications = dynamic(
  () =>
    import('@/components/ui/HostMessageNotifications').then(mod => ({
      default: mod.HostMessageNotifications,
    })),
  {
    loading: () => null, // 알림은 보이지 않게 로딩
    ssr: false,
  }
)

// 호스트 메시지 모달을 동적 로드
const HostMessageModal = dynamic(
  () => import('@/components/ui/HostMessageModal').then(mod => ({ default: mod.HostMessageModal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <LoadingSpinner />
          <p className="mt-2 text-center">메시지 기능을 준비하는 중...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
)

// 부스트 모달을 동적 로드
const BoostModal = dynamic(
  () => import('@/components/ui/BoostModal').then(mod => ({ default: mod.BoostModal })),
  {
    loading: () => (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-lg bg-white p-6 dark:bg-gray-800">
          <LoadingSpinner />
          <p className="mt-2 text-center">결제 시스템을 준비하는 중...</p>
        </div>
      </div>
    ),
    ssr: false,
  }
)

export {
  RealtimeChatModal as LazyRealtimeChatModal,
  HostMessageNotifications as LazyHostMessageNotifications,
  HostMessageModal as LazyHostMessageModal,
  BoostModal as LazyBoostModal,
}
