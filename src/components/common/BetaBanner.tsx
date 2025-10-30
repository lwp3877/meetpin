/* src/components/common/BetaBanner.tsx */
'use client'

import { useState } from 'react'
import { X } from 'lucide-react'

export function BetaBanner() {
  const [isVisible, setIsVisible] = useState(true)

  if (!isVisible) return null

  return (
    <div className="relative bg-gradient-to-r from-amber-500 to-orange-500 px-4 py-3 text-white shadow-md">
      <div className="container mx-auto flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">⚠️</span>
          <div className="flex-1">
            <p className="text-sm font-semibold sm:text-base">
              현재 비공개 베타 테스트 중입니다
            </p>
            <p className="text-xs opacity-90 sm:text-sm">
              초대받은 사용자만 이용 가능하며, 일부 기능이 제한될 수 있습니다
            </p>
          </div>
        </div>
        <button
          onClick={() => setIsVisible(false)}
          className="flex-shrink-0 rounded-full p-1 transition-colors hover:bg-white/20"
          aria-label="배너 닫기"
        >
          <X className="h-5 w-5" />
        </button>
      </div>
    </div>
  )
}
