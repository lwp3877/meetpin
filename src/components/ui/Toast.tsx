/* src/components/ui/Toast.tsx */
'use client'

import React from 'react'
import toast, { Toaster, ToastBar, type ToastOptions } from 'react-hot-toast'
import { brandColors } from '@/lib/config/brand'

type ToastMessageOptions = ToastOptions | undefined

const baseStyle = {
  fontSize: '14px',
  fontWeight: 500,
  borderRadius: '12px',
  padding: '12px 16px',
  maxWidth: '400px',
} as const

export const Toast = {
  success(message: string, options?: ToastOptions) {
    return toast.success(message, {
      duration: 4000,
      style: {
        ...baseStyle,
        background: brandColors.primary,
        color: '#fff',
        boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: brandColors.primary,
      },
      ...options,
    })
  },

  error(message: string, options?: ToastOptions) {
    return toast.error(message, {
      duration: 5000,
      style: {
        ...baseStyle,
        background: '#EF4444',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
      },
      iconTheme: {
        primary: '#fff',
        secondary: '#EF4444',
      },
      ...options,
    })
  },

  info(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: 4000,
      icon: 'ℹ️',
      style: {
        ...baseStyle,
        background: '#3B82F6',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(59, 130, 246, 0.15)',
      },
      ...options,
    })
  },

  warning(message: string, options?: ToastOptions) {
    return toast(message, {
      duration: 4000,
      icon: '⚠️',
      style: {
        ...baseStyle,
        background: '#F59E0B',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(245, 158, 11, 0.15)',
      },
      ...options,
    })
  },

  loading(message: string, options?: ToastOptions) {
    return toast.loading(message, {
      style: {
        ...baseStyle,
        background: '#374151',
        color: '#fff',
        boxShadow: '0 10px 25px rgba(55, 65, 81, 0.15)',
      },
      ...options,
    })
  },

  promise<T>(
    promise: Promise<T>,
    messages: {
      loading: string
      success: string | ((data: T) => string)
      error: string | ((error: unknown) => string)
    },
    options?: ToastMessageOptions
  ) {
    return toast.promise(promise, messages, {
      style: baseStyle,
      success: {
        style: {
          ...baseStyle,
          background: brandColors.primary,
          color: '#fff',
          boxShadow: '0 10px 25px rgba(16, 185, 129, 0.15)',
        },
      },
      error: {
        style: {
          ...baseStyle,
          background: '#EF4444',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(239, 68, 68, 0.15)',
        },
      },
      ...options,
    })
  },

  dismiss(toastId?: string) {
    toast.dismiss(toastId)
  },

  remove(toastId?: string) {
    toast.remove(toastId)
  },
}

export function CustomToaster() {
  return (
    <Toaster
      position="top-center"
      gutter={8}
      toastOptions={{
        duration: 4000,
        style: {
          ...baseStyle,
          background: '#363636',
          color: '#fff',
          boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
        },
      }}
    >
      {toastInstance => (
        <ToastBar toast={toastInstance}>
          {({ icon, message }) => (
            <div className="flex items-center">
              {icon && <div className="mr-3">{icon}</div>}
              <div className="flex-1">{message}</div>
              {toastInstance.type !== 'loading' && (
                <button
                  type="button"
                  onClick={() => toast.dismiss(toastInstance.id)}
                  className="ml-3 rounded-full p-1 text-white/70 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="닫기"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
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
