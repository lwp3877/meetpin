'use client'

import { useEffect, useState } from 'react'
import { logger } from '@/lib/observability/logger'

export default function DebugLandingPage() {
  const [logs, setLogs] = useState<string[]>([])

  const log = (message: string) => {
    logger.info(message)
    setLogs(prev => [...prev, `${new Date().toISOString()}: ${message}`])
  }

  useEffect(() => {
    log('🚨 DEBUG 모드 활성화 - 모든 네비게이션 차단')

    if (typeof window === 'undefined') return

    // 모든 네비게이션을 완전히 차단
    const originalPushState = window.history.pushState
    const originalReplaceState = window.history.replaceState

    window.history.pushState = function(...args) {
      log(`🚨 history.pushState 차단됨: ${JSON.stringify(args)}`)
      return undefined
    }

    window.history.replaceState = function(...args) {
      log(`🚨 history.replaceState 차단됨: ${JSON.stringify(args)}`)
      return undefined
    }

    // window.location 변경 감지
    let currentHref = window.location.href
    const checkLocation = () => {
      if (window.location.href !== currentHref) {
        log(`🚨 location 변경 감지됨: ${currentHref} -> ${window.location.href}`)
        // 강제로 원래 위치로 복원
        window.history.replaceState(null, '', '/debug-landing')
        currentHref = window.location.href
      }
    }

    const interval = setInterval(checkLocation, 50)

    // 모든 클릭 차단
    document.addEventListener('click', (e) => {
      log(`🚨 클릭 차단됨: ${(e.target as any)?.tagName}`)
      e.preventDefault()
      e.stopPropagation()
    }, true)

    return () => {
      clearInterval(interval)
      window.history.pushState = originalPushState
      window.history.replaceState = originalReplaceState
    }
  }, [])

  return (
    <div className="min-h-screen bg-red-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-red-800 mb-6">
          🚨 DEBUG 모드 - 메인 페이지 리다이렉트 문제 진단
        </h1>

        <div className="bg-white p-6 rounded-lg shadow-lg mb-6">
          <h2 className="text-xl font-semibold mb-4">현재 상태</h2>
          <p><strong>URL:</strong> {typeof window !== 'undefined' ? window.location.href : 'SSR'}</p>
          <p><strong>Pathname:</strong> {typeof window !== 'undefined' ? window.location.pathname : 'SSR'}</p>
          <p><strong>Timestamp:</strong> {new Date().toISOString()}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-lg">
          <h2 className="text-xl font-semibold mb-4">실시간 로그</h2>
          <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
            {logs.map((log, i) => (
              <div key={i} className="font-mono text-sm mb-1">{log}</div>
            ))}
            {logs.length === 0 && (
              <div className="text-gray-500">로그가 없습니다. 모든 네비게이션이 차단되고 있습니다.</div>
            )}
          </div>
        </div>

        <div className="mt-6 bg-yellow-50 p-4 rounded-lg">
          <h3 className="text-lg font-semibold text-yellow-800 mb-2">테스트 지침</h3>
          <p className="text-yellow-700">
            이 페이지는 모든 네비게이션을 차단합니다.
            만약 이 페이지가 자동으로 다른 곳으로 리다이렉트된다면,
            React/Next.js 외부에서 리다이렉트가 발생하고 있는 것입니다.
          </p>
        </div>
      </div>
    </div>
  )
}