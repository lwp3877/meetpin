/**
 * 봇 스케줄러 초기화 컴포넌트
 * 앱 로드 시 자동으로 봇 스케줄러를 시작
 */

'use client'

import { useEffect } from 'react'
import { BotManager } from '@/lib/bot/bot-scheduler'
import { logger } from '@/lib/observability/logger'

export function BotSchedulerInitializer() {
  useEffect(() => {
    // 클라이언트 사이드에서만 스케줄러 초기화
    if (typeof window !== 'undefined') {
      logger.info('🤖 봇 스케줄러 자동 초기화 시작')
      BotManager.start()
    }
  }, [])

  // 이 컴포넌트는 UI를 렌더링하지 않음
  return null
}

