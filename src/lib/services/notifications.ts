/* src/lib/notifications.ts */
'use client'

export type NotificationPermission = 'default' | 'granted' | 'denied'

export interface PushNotificationOptions {
  title: string
  body?: string
  icon?: string
  badge?: string
  image?: string
  tag?: string
  data?: any
  requireInteraction?: boolean
  silent?: boolean
  actions?: NotificationAction[]
  timestamp?: number
  renotify?: boolean
  vibrate?: number[]
}

export interface NotificationAction {
  action: string
  title: string
  icon?: string
}

// 브라우저 알림 지원 확인
export function isNotificationSupported(): boolean {
  return 'Notification' in window
}

// 서비스 워커 지원 확인
export function isServiceWorkerSupported(): boolean {
  return 'serviceWorker' in navigator
}

// Push API 지원 확인
export function isPushSupported(): boolean {
  return 'PushManager' in window && 'serviceWorker' in navigator
}

// 현재 알림 권한 상태 확인
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied'
  }
  return Notification.permission
}

// 알림 권한 요청
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser')
    return 'denied'
  }

  try {
    const permission = await Notification.requestPermission()
    console.log('Notification permission:', permission)
    return permission
  } catch (error) {
    console.error('Error requesting notification permission:', error)
    return 'denied'
  }
}

// 간단한 브라우저 알림 표시
export function showNotification(options: PushNotificationOptions): Notification | null {
  if (!isNotificationSupported() || getNotificationPermission() !== 'granted') {
    console.warn('Notifications not allowed')
    return null
  }

  try {
    const notification = new Notification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      tag: options.tag,
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      // renotify는 브라우저 호환성 문제로 제거
      // vibrate는 브라우저 호환성 문제로 제거
    })

    // 알림 클릭 이벤트 처리
    notification.onclick = (event) => {
      event.preventDefault()
      
      // 브라우저 창 포커스
      if (window.parent) {
        window.parent.focus()
      } else {
        window.focus()
      }
      
      // 알림 닫기
      notification.close()
      
      // 커스텀 데이터 처리
      if (options.data?.url) {
        window.open(options.data.url, '_blank')
      } else if (options.data?.action) {
        // 커스텀 액션 처리
        console.log('Notification action:', options.data.action)
      }
    }

    // 알림 에러 처리
    notification.onerror = (error) => {
      console.error('Notification error:', error)
    }

    // 자동 닫기 (30초 후)
    setTimeout(() => {
      notification.close()
    }, 30000)

    return notification
  } catch (error) {
    console.error('Error showing notification:', error)
    return null
  }
}

// 서비스 워커를 통한 백그라운드 알림
export async function showServiceWorkerNotification(
  options: PushNotificationOptions
): Promise<void> {
  if (!isServiceWorkerSupported()) {
    console.warn('Service Worker not supported')
    return showNotification(options) ? undefined : undefined
  }

  try {
    const registration = await navigator.serviceWorker.ready
    
    await registration.showNotification(options.title, {
      body: options.body,
      icon: options.icon || '/icons/icon-192x192.png',
      badge: options.badge || '/icons/icon-72x72.png',
      tag: options.tag || 'meetpin-notification',
      data: options.data,
      requireInteraction: options.requireInteraction || false,
      silent: options.silent || false,
      // renotify는 브라우저 호환성 문제로 제거
      // vibrate는 브라우저 호환성 문제로 제거
    })
  } catch (error) {
    console.error('Error showing service worker notification:', error)
    // 폴백으로 일반 알림 사용
    showNotification(options)
  }
}

// 밋핀 전용 알림 헬퍼 함수들
export const MeetPinNotifications = {
  // 새 메시지 알림
  newMessage: (senderName: string, message: string, roomTitle?: string) => {
    showServiceWorkerNotification({
      title: `💬 ${senderName}님의 새 메시지`,
      body: message,
      icon: '/icons/icon-192x192.png',
      tag: 'new-message',
      data: {
        type: 'message',
        senderName,
        message,
        roomTitle,
        url: '/profile'
      },
      requireInteraction: true,
      actions: [
        {
          action: 'reply',
          title: '답장하기'
        },
        {
          action: 'view',
          title: '확인하기'
        }
      ]
    })
  },

  // 새 요청 알림
  newRequest: (requesterName: string, roomTitle: string) => {
    showServiceWorkerNotification({
      title: `🙋‍♂️ 새로운 참가 요청`,
      body: `${requesterName}님이 "${roomTitle}" 모임에 참가를 요청했습니다`,
      icon: '/icons/icon-192x192.png',
      tag: 'new-request',
      data: {
        type: 'request',
        requesterName,
        roomTitle,
        url: '/requests'
      },
      requireInteraction: true,
      actions: [
        {
          action: 'accept',
          title: '수락'
        },
        {
          action: 'view',
          title: '확인'
        }
      ]
    })
  },

  // 요청 수락 알림
  requestAccepted: (roomTitle: string, hostName: string) => {
    showServiceWorkerNotification({
      title: `✅ 참가 승인됨`,
      body: `"${roomTitle}" 모임에 참가가 승인되었습니다!`,
      icon: '/icons/icon-192x192.png',
      tag: 'request-accepted',
      data: {
        type: 'accepted',
        roomTitle,
        hostName,
        url: '/map'
      },
      requireInteraction: true,
      actions: [
        {
          action: 'view-room',
          title: '모임 보기'
        }
      ]
    })
  },

  // 모임 시작 알림
  meetingStartingSoon: (roomTitle: string, minutesLeft: number) => {
    showServiceWorkerNotification({
      title: `⏰ 모임이 곧 시작됩니다`,
      body: `"${roomTitle}" 모임이 ${minutesLeft}분 후 시작됩니다`,
      icon: '/icons/icon-192x192.png',
      tag: 'meeting-starting',
      data: {
        type: 'meeting-start',
        roomTitle,
        minutesLeft,
        url: '/map'
      },
      requireInteraction: true,
      vibrate: [300, 100, 300, 100, 300],
      actions: [
        {
          action: 'view-room',
          title: '모임 확인'
        }
      ]
    })
  },

  // 시스템 알림
  systemNotification: (title: string, body: string, type: 'info' | 'warning' | 'error' = 'info') => {
    const icons = {
      info: '💡',
      warning: '⚠️',
      error: '❌'
    }

    showServiceWorkerNotification({
      title: `${icons[type]} ${title}`,
      body,
      icon: '/icons/icon-192x192.png',
      tag: `system-${type}`,
      data: {
        type: 'system',
        level: type
      },
      requireInteraction: type === 'error'
    })
  }
}

// 알림 설정 관리
export class NotificationSettings {
  private static SETTINGS_KEY = 'meetpin-notification-settings'

  static getSettings() {
    if (typeof window === 'undefined') return null
    
    const settings = localStorage.getItem(this.SETTINGS_KEY)
    return settings ? JSON.parse(settings) : {
      enabled: true,
      messages: true,
      requests: true,
      meetings: true,
      system: true,
      sound: true,
      vibration: true
    }
  }

  static updateSettings(settings: any) {
    if (typeof window === 'undefined') return
    
    localStorage.setItem(this.SETTINGS_KEY, JSON.stringify(settings))
  }

  static isTypeEnabled(type: string): boolean {
    const settings = this.getSettings()
    return settings?.enabled && settings?.[type]
  }
}

// 알림 초기화 함수
export async function initializeNotifications(): Promise<boolean> {
  try {
    // 기본 지원 확인
    if (!isNotificationSupported()) {
      console.warn('Notifications not supported')
      return false
    }

    // 권한 확인
    const permission = getNotificationPermission()
    if (permission === 'denied') {
      console.warn('Notifications denied by user')
      return false
    }

    // 권한이 없으면 요청하지 않음 (사용자가 직접 허용해야 함)
    if (permission === 'default') {
      console.info('Notification permission not granted yet')
      return false
    }

    console.log('Notifications initialized successfully')
    return true
  } catch (error) {
    console.error('Error initializing notifications:', error)
    return false
  }
}