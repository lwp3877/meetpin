/* src/components/ui/NotificationSettings.tsx */
'use client'

import { useState, useEffect } from 'react'
import Bell from 'lucide-react/dist/esm/icons/bell'
import BellOff from 'lucide-react/dist/esm/icons/bell-off'
import MessageCircle from 'lucide-react/dist/esm/icons/message-circle'
import Users from 'lucide-react/dist/esm/icons/users'
import Clock from 'lucide-react/dist/esm/icons/clock'
import Info from 'lucide-react/dist/esm/icons/info'
import Volume2 from 'lucide-react/dist/esm/icons/volume-2'
import VolumeX from 'lucide-react/dist/esm/icons/volume-x'
import Vibrate from 'lucide-react/dist/esm/icons/vibrate'
import Settings from 'lucide-react/dist/esm/icons/settings'
import X from 'lucide-react/dist/esm/icons/x'
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  NotificationSettings as NS,
  MeetPinNotifications,
  initializeNotifications,
} from '@/lib/services/notifications'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

interface NotificationSettingsProps {
  className?: string
}

export function NotificationSettings({ className = '' }: NotificationSettingsProps) {
  const [permission, setPermission] = useState<'default' | 'granted' | 'denied'>('default')
  const [settings, setSettings] = useState({
    enabled: true,
    messages: true,
    requests: true,
    meetings: true,
    system: true,
    sound: true,
    vibration: true,
  })
  const [loading, setLoading] = useState(false)
  const [supported, setSupported] = useState(false)

  useEffect(() => {
    // 브라우저 지원 확인
    setSupported(isNotificationSupported())

    if (isNotificationSupported()) {
      setPermission(getNotificationPermission())
    }

    // 저장된 설정 로드
    const savedSettings = NS.getSettings()
    if (savedSettings) {
      setSettings(savedSettings)
    }
  }, [])

  const handlePermissionRequest = async () => {
    if (!supported) {
      toast.error('이 브라우저는 알림을 지원하지 않습니다')
      return
    }

    setLoading(true)
    try {
      const newPermission = await requestNotificationPermission()
      setPermission(newPermission)

      if (newPermission === 'granted') {
        toast.success('알림 권한이 허용되었습니다!')

        // 초기화 및 테스트 알림
        const initialized = await initializeNotifications()
        if (initialized) {
          // 권한 허용 시 환영 알림 표시
          setTimeout(() => {
            MeetPinNotifications.systemNotification(
              '알림이 활성화되었습니다!',
              '이제 중요한 소식을 놓치지 마세요 🎉',
              'info'
            )
          }, 1000)
        }
      } else {
        toast.error('알림 권한이 거부되었습니다')
      }
    } catch (error) {
      logger.error('Permission request failed:', { error: error instanceof Error ? error.message : String(error) })
      toast.error('알림 권한 요청에 실패했습니다')
    } finally {
      setLoading(false)
    }
  }

  const handleSettingChange = (key: string, value: boolean) => {
    const newSettings = { ...settings, [key]: value }
    setSettings(newSettings)
    NS.updateSettings(newSettings)

    // 설정 변경 피드백
    if (value && permission === 'granted') {
      const messages = {
        messages: '메시지 알림이 활성화되었습니다',
        requests: '요청 알림이 활성화되었습니다',
        meetings: '모임 알림이 활성화되었습니다',
        system: '시스템 알림이 활성화되었습니다',
        sound: '알림 소리가 활성화되었습니다',
        vibration: '진동 알림이 활성화되었습니다',
      }

      toast.success(messages[key as keyof typeof messages] || '설정이 저장되었습니다')
    }
  }

  const handleTestNotification = () => {
    if (permission !== 'granted') {
      toast.error('알림 권한을 먼저 허용해주세요')
      return
    }

    MeetPinNotifications.systemNotification(
      '테스트 알림',
      '알림이 정상적으로 작동합니다! ✨',
      'info'
    )
  }

  if (!supported) {
    return (
      <div className={`rounded-xl border border-gray-200 bg-gray-100 p-6 ${className}`}>
        <div className="flex items-center space-x-3 text-gray-600">
          <BellOff className="h-6 w-6" />
          <div>
            <h3 className="font-semibold">알림 지원 안됨</h3>
            <p className="text-sm">이 브라우저는 푸시 알림을 지원하지 않습니다</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* 알림 권한 상태 */}
      <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div
              className={`rounded-full p-2 ${
                permission === 'granted'
                  ? 'bg-green-100 text-green-600'
                  : permission === 'denied'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-gray-100 text-gray-600'
              }`}
            >
              {permission === 'granted' ? (
                <Bell className="h-6 w-6" />
              ) : (
                <BellOff className="h-6 w-6" />
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">푸시 알림</h2>
              <p className="text-sm text-gray-600">
                {permission === 'granted'
                  ? '알림이 허용됨'
                  : permission === 'denied'
                    ? '알림이 차단됨'
                    : '알림 권한 필요'}
              </p>
            </div>
          </div>

          <div className="flex space-x-2">
            {permission === 'granted' && (
              <button
                onClick={handleTestNotification}
                className="rounded-lg bg-blue-100 px-4 py-2 text-sm text-blue-700 transition-colors hover:bg-blue-200"
              >
                테스트
              </button>
            )}

            {permission !== 'granted' && (
              <button
                onClick={handlePermissionRequest}
                disabled={loading || permission === 'denied'}
                className="flex items-center space-x-2 rounded-lg bg-gradient-to-r from-emerald-500 to-emerald-600 px-6 py-2 font-medium text-white transition-all hover:from-emerald-600 hover:to-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? (
                  <>
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                    <span>요청 중...</span>
                  </>
                ) : (
                  <>
                    <Bell className="h-4 w-4" />
                    <span>알림 허용</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>

        {permission === 'denied' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start space-x-2">
              <X className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
              <div className="text-sm text-red-800">
                <p className="mb-1 font-medium">알림이 차단되었습니다</p>
                <p>브라우저 설정에서 알림을 허용해주세요:</p>
                <ol className="mt-2 list-inside list-decimal space-y-1">
                  <li>브라우저 주소창 왼쪽의 자물쇠 아이콘 클릭</li>
                  <li>알림 설정을 &apos;허용&apos;으로 변경</li>
                  <li>페이지 새로고침</li>
                </ol>
              </div>
            </div>
          </div>
        )}

        {permission === 'default' && (
          <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
            <div className="flex items-start space-x-2">
              <Info className="mt-0.5 h-5 w-5 flex-shrink-0 text-blue-500" />
              <div className="text-sm text-blue-800">
                <p className="mb-1 font-medium">알림을 받으려면 권한이 필요합니다</p>
                <p>새로운 메시지, 요청, 모임 시작 알림 등을 받을 수 있습니다.</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 알림 세부 설정 */}
      {permission === 'granted' && (
        <div className="rounded-xl border border-gray-100 bg-white p-6 shadow-lg">
          <div className="mb-6 flex items-center space-x-2">
            <Settings className="h-5 w-5 text-gray-600" />
            <h3 className="text-lg font-semibold text-gray-900">알림 설정</h3>
          </div>

          <div className="space-y-4">
            {/* 전체 알림 토글 */}
            <div className="flex items-center justify-between rounded-lg bg-gray-50 p-3">
              <div className="flex items-center space-x-3">
                <Bell className="h-5 w-5 text-gray-600" />
                <div>
                  <p className="font-medium text-gray-900">모든 알림</p>
                  <p className="text-sm text-gray-600">전체 알림 활성화/비활성화</p>
                </div>
              </div>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  onChange={e => handleSettingChange('enabled', e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-emerald-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
              </label>
            </div>

            {/* 개별 알림 설정 */}
            {settings.enabled && (
              <>
                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <MessageCircle className="h-5 w-5 text-blue-600" />
                    <div>
                      <p className="font-medium text-gray-900">새 메시지</p>
                      <p className="text-sm text-gray-600">호스트 메시지 및 채팅 알림</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.messages}
                      onChange={e => handleSettingChange('messages', e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-purple-600" />
                    <div>
                      <p className="font-medium text-gray-900">참가 요청</p>
                      <p className="text-sm text-gray-600">새로운 참가 요청 및 승인 알림</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.requests}
                      onChange={e => handleSettingChange('requests', e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-purple-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Clock className="h-5 w-5 text-orange-600" />
                    <div>
                      <p className="font-medium text-gray-900">모임 시작</p>
                      <p className="text-sm text-gray-600">모임 시작 10분 전 리마인더</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.meetings}
                      onChange={e => handleSettingChange('meetings', e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-orange-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                  <div className="flex items-center space-x-3">
                    <Info className="h-5 w-5 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">시스템 알림</p>
                      <p className="text-sm text-gray-600">업데이트 및 시스템 공지사항</p>
                    </div>
                  </div>
                  <label className="relative inline-flex cursor-pointer items-center">
                    <input
                      type="checkbox"
                      checked={settings.system}
                      onChange={e => handleSettingChange('system', e.target.checked)}
                      className="peer sr-only"
                    />
                    <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-gray-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                  </label>
                </div>

                <div className="mt-6 border-t pt-4">
                  <h4 className="mb-3 font-medium text-gray-900">알림 효과</h4>

                  <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      {settings.sound ? (
                        <Volume2 className="h-5 w-5 text-green-600" />
                      ) : (
                        <VolumeX className="h-5 w-5 text-gray-400" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900">알림 소리</p>
                        <p className="text-sm text-gray-600">알림 수신 시 소리 재생</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.sound}
                        onChange={e => handleSettingChange('sound', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-green-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>

                  <div className="flex items-center justify-between rounded-lg p-3 transition-colors hover:bg-gray-50">
                    <div className="flex items-center space-x-3">
                      <Vibrate className="h-5 w-5 text-blue-600" />
                      <div>
                        <p className="font-medium text-gray-900">진동</p>
                        <p className="text-sm text-gray-600">모바일에서 진동 효과</p>
                      </div>
                    </div>
                    <label className="relative inline-flex cursor-pointer items-center">
                      <input
                        type="checkbox"
                        checked={settings.vibration}
                        onChange={e => handleSettingChange('vibration', e.target.checked)}
                        className="peer sr-only"
                      />
                      <div className="peer h-6 w-11 rounded-full bg-gray-200 peer-checked:bg-blue-500 peer-focus:outline-none after:absolute after:top-[2px] after:left-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:after:translate-x-full peer-checked:after:border-white"></div>
                    </label>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
