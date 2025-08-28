/* src/components/ui/Toast.tsx */
import React from 'react'
import toast, { Toaster, ToastBar } from 'react-hot-toast'
import { brandColors } from '@/lib/brand'

// Enhanced toast functions with better styling
export const Toast = {
  success: (message: string, options?: any) => {
    return toast.success(message, {
      duration: 4000,
      style: {
        background: brandColors.primary,
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: brandColors.primary,
      },
      ...options,
    })
  },

  error: (message: string, options?: any) => {
    return toast.error(message, {
      duration: 5000,
      style: {
        background: '#EF4444',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    })
  },

  info: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      icon: '💡',
      style: {
        background: '#3B82F6',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
      },
      ...options,
    })
  },

  warning: (message: string, options?: any) => {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        background: '#F59E0B',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.15)',
      },
      ...options,
    })
  },

  loading: (message: string, options?: any) => {
    return toast.loading(message, {
      style: {
        background: '#374151',
        color: '#fff',
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
        boxShadow: '0 10px 25px rgba(55, 65, 81, 0.15)',
      },
      ...options,
    })
  },

  promise: <T,>(
    promise: Promise<T>,
    msgs: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: any) => string)
    },
    options?: any
  ) => {
    return toast.promise(promise, msgs, {
      style: {
        fontSize: '14px',
        fontWeight: '500',
        borderRadius: '12px',
        padding: '12px 16px',
        maxWidth: '400px',
      },
      success: {
        style: {
          background: brandColors.primary,
          color: '#fff',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: brandColors.primary,
        },
      },
      error: {
        style: {
          background: '#EF4444',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
        },
        iconTheme: {
          primary: '#fff',
          secondary: '#EF4444',
        },
      },
      loading: {
        style: {
          background: '#374151',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(55, 65, 81, 0.15)',
        },
      },
      ...options,
    })
  },

  custom: (message: React.ReactNode, options?: any) => {
    if (!message) return ''
    return toast.custom(message as any, {
      duration: 4000,
      ...options,
    })
  },

  dismiss: (toastId?: string) => {
    return toast.dismiss(toastId)
  },

  remove: (toastId?: string) => {
    return toast.remove(toastId)
  },
}

// Custom Toaster component with enhanced styling
export function CustomToaster() {
  return (
    <Toaster
      position="top-center"
      reverseOrder={false}
      gutter={8}
      containerClassName=""
      containerStyle={{}}
      toastOptions={{
        // Default options for all toasts
        className: '',
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
          fontSize: '14px',
          fontWeight: '500',
          borderRadius: '12px',
          padding: '12px 16px',
          maxWidth: '400px',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
        // Default options for specific types
        success: {
          duration: 4000,
          style: {
            background: brandColors.primary,
            color: '#fff',
            boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: brandColors.primary,
          },
        },
        error: {
          duration: 5000,
          style: {
            background: '#EF4444',
            color: '#fff',
            boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
          },
          iconTheme: {
            primary: '#fff',
            secondary: '#EF4444',
          },
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div className="flex items-center">
              {icon && <div className="mr-3">{icon}</div>}
              <div className="flex-1">{message}</div>
              {t.type !== 'loading' && (
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="ml-3 text-white/70 hover:text-white transition-colors p-1 rounded-full hover:bg-white/10"
                  aria-label="닫기"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}

// Preset notification components for common scenarios
export const NotificationPresets = {
  // User actions
  profileUpdated: () => Toast.success('프로필이 성공적으로 업데이트되었습니다! 🎉'),
  loginSuccess: (nickname?: string) => Toast.success(`안녕하세요, ${nickname || '사용자'}님! 🙋‍♂️`),
  logoutSuccess: () => Toast.success('안전하게 로그아웃되었습니다 👋'),
  
  // Room actions
  roomCreated: () => Toast.success('새로운 모임이 생성되었습니다! 🎉'),
  roomUpdated: () => Toast.success('모임 정보가 수정되었습니다 ✏️'),
  roomDeleted: () => Toast.success('모임이 삭제되었습니다'),
  roomCancelled: () => Toast.warning('모임이 취소되었습니다'),
  
  // Request actions
  requestSent: () => Toast.success('참가 신청이 전송되었습니다! 🚀'),
  requestApproved: (roomTitle: string) => Toast.success(`"${roomTitle}" 모임 참가가 승인되었습니다! 🎉`),
  requestRejected: (roomTitle: string) => Toast.warning(`"${roomTitle}" 모임 참가가 거절되었습니다`),
  requestCancelled: () => Toast.info('참가 신청이 취소되었습니다'),
  
  // Chat actions
  newMessage: (senderName: string) => Toast.info(`${senderName}님이 메시지를 보냈습니다 💬`),
  
  // Error messages
  networkError: () => Toast.error('네트워크 연결을 확인해주세요 📶'),
  unauthorizedError: () => Toast.error('로그인이 필요합니다 🔐'),
  serverError: () => Toast.error('서버 오류가 발생했습니다. 잠시 후 다시 시도해주세요'),
  validationError: (message: string) => Toast.error(message),
  
  // Loading states
  savingData: () => Toast.loading('저장하는 중...'),
  loadingData: () => Toast.loading('불러오는 중...'),
  processingRequest: () => Toast.loading('처리하는 중...'),
}

export default Toast