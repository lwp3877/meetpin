'use client'

import { useEffect } from 'react'

export default function Page() {
  useEffect(() => {
    const timer = setInterval(() => {
      window.location.reload()
    }, 30_000) // 30초마다 자동 새로고침
    return () => clearInterval(timer)
  }, [])

  return (
    <main>
      <h1>Status OK</h1>
      <p>build: {process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown'}</p>
    </main>
  )
}
