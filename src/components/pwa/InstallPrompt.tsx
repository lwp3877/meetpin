'use client'

import { useEffect, useState } from 'react'
import X from 'lucide-react/dist/esm/icons/x'
import Download from 'lucide-react/dist/esm/icons/download'
import Smartphone from 'lucide-react/dist/esm/icons/smartphone'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isIOS, setIsIOS] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    // iOS 감지
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent)
    setIsIOS(ios)

    // 이미 설치된 PWA인지 확인
    const standalone = window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as any).standalone === true

    setIsStandalone(standalone)

    // 이미 설치되었거나 프롬프트를 닫은 적이 있으면 표시 안함
    if (standalone || localStorage.getItem('pwa-install-dismissed')) {
      return
    }

    // beforeinstallprompt 이벤트 리스너
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault()
      setDeferredPrompt(e as BeforeInstallPromptEvent)

      // 방문 횟수 체크 (3번 이상 방문 시 표시)
      const visitCount = parseInt(localStorage.getItem('visit-count') || '0')
      if (visitCount >= 3) {
        setShowPrompt(true)
      }
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    // 방문 횟수 증가
    const visitCount = parseInt(localStorage.getItem('visit-count') || '0')
    localStorage.setItem('visit-count', (visitCount + 1).toString())

    // iOS 사용자에게는 3번 방문 후 안내 표시
    if (ios && visitCount >= 3 && !standalone) {
      setShowPrompt(true)
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [])

  const handleInstallClick = async () => {
    if (!deferredPrompt) return

    // 프롬프트 표시
    await deferredPrompt.prompt()

    // 사용자 선택 결과
    const { outcome } = await deferredPrompt.userChoice

    if (outcome === 'accepted') {
      console.log('PWA 설치 완료')
    }

    setDeferredPrompt(null)
    setShowPrompt(false)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem('pwa-install-dismissed', 'true')
  }

  // 이미 설치되었으면 표시 안함
  if (isStandalone || !showPrompt) {
    return null
  }

  // iOS 사용자용 안내
  if (isIOS) {
    return (
      <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5">
        <Card className="border-2 border-emerald-500 bg-white shadow-2xl dark:bg-gray-800">
          <CardContent className="relative p-6">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleDismiss}
              className="absolute top-2 right-2"
              aria-label="닫기"
            >
              <X className="h-4 w-4" />
            </Button>

            <div className="flex items-start gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 text-2xl">
                📍
              </div>
              <div className="flex-1">
                <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                  밋핀을 홈 화면에 추가하세요!
                </h3>
                <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
                  <p className="flex items-center gap-2">
                    <span>1️⃣ Safari 하단의</span>
                    <span className="inline-flex h-5 w-5 items-center justify-center rounded bg-blue-500 text-white">
                      ⬆️
                    </span>
                    <span>공유 버튼 클릭</span>
                  </p>
                  <p>2️⃣ "홈 화면에 추가" 선택</p>
                  <p>3️⃣ "추가" 버튼 클릭</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  // Android/Desktop 사용자용
  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 animate-in slide-in-from-bottom-5 md:left-auto md:right-4 md:w-96">
      <Card className="border-2 border-emerald-500 bg-white shadow-2xl dark:bg-gray-800">
        <CardContent className="relative p-6">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="absolute top-2 right-2"
            aria-label="닫기"
          >
            <X className="h-4 w-4" />
          </Button>

          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-teal-500">
              <Smartphone className="h-6 w-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="mb-2 text-lg font-bold text-gray-900 dark:text-white">
                앱처럼 사용하세요!
              </h3>
              <p className="mb-4 text-sm text-gray-600 dark:text-gray-300">
                밋핀을 홈 화면에 추가하면<br />
                더 빠르고 편리하게 이용할 수 있어요.
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={handleInstallClick}
                  className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 text-white hover:from-emerald-600 hover:to-teal-600"
                >
                  <Download className="mr-2 h-4 w-4" />
                  설치하기
                </Button>
                <Button
                  onClick={handleDismiss}
                  variant="outline"
                  className="border-gray-300"
                >
                  나중에
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
