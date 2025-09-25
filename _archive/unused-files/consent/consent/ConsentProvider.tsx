'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { useConsent } from '@/lib/consent'
import type { ConsentPreferences } from '@/lib/consent/types'
import CookieBanner from './CookieBanner'
import CookieSettingsModal from './CookieSettingsModal'

interface ConsentContextType {
  preferences: ConsentPreferences | null
  isLoaded: boolean
  showSettingsModal: () => void
  hideSettingsModal: () => void
}

const ConsentContext = createContext<ConsentContextType | null>(null)

interface ConsentProviderProps {
  children: React.ReactNode
}

export default function ConsentProvider({ children }: ConsentProviderProps) {
  const consent = useConsent()
  const [showModal, setShowModal] = useState(false)

  const showSettingsModal = () => setShowModal(true)
  const hideSettingsModal = () => setShowModal(false)

  const contextValue: ConsentContextType = {
    preferences: consent.preferences,
    isLoaded: consent.isLoaded,
    showSettingsModal,
    hideSettingsModal,
  }

  return (
    <ConsentContext.Provider value={contextValue}>
      {children}

      {/* 쿠키 배너 */}
      <CookieBanner />

      {/* 쿠키 설정 모달 */}
      <CookieSettingsModal open={showModal} onOpenChange={setShowModal} />
    </ConsentContext.Provider>
  )
}

// 컨텍스트 사용을 위한 훅
export function useConsentUI() {
  const context = useContext(ConsentContext)
  if (!context) {
    throw new Error('useConsentUI must be used within a ConsentProvider')
  }
  return context
}
