/* src/components/Navigation.tsx */
'use client'

import { useRouter, usePathname } from 'next/navigation'
import { brandColors } from '@/lib/config/brand'

interface NavigationProps {
  className?: string
}

export default function Navigation({ className = '' }: NavigationProps) {
  const router = useRouter()
  const pathname = usePathname()

  const navItems = [
    {
      key: 'map',
      label: '지도',
      emoji: '🗺️',
      path: '/map',
      description: '주변 모임 찾기',
    },
    {
      key: 'requests', 
      label: '요청함',
      emoji: '📮',
      path: '/requests',
      description: '참가 요청 관리',
    },
    {
      key: 'profile',
      label: '프로필',
      emoji: '👤',
      path: '/profile',
      description: '내 정보 설정',
    },
  ]

  const isActive = (path: string) => {
    if (path === '/map') {
      return pathname === '/' || pathname === '/map' || pathname.startsWith('/map')
    }
    return pathname === path || pathname.startsWith(path)
  }

  const handleNavigate = (path: string) => {
    router.push(path)
  }

  return (
    <nav className={`bg-white border-t border-gray-200 ${className}`}>
      <div className="max-w-md mx-auto px-4">
        <div className="flex">
          {navItems.map((item) => {
            const active = isActive(item.path)
            
            return (
              <button
                key={item.key}
                onClick={() => handleNavigate(item.path)}
                className={`
                  flex-1 flex flex-col items-center py-2 px-1 transition-colors
                  ${active 
                    ? 'text-primary' 
                    : 'text-gray-500 hover:text-gray-700'
                  }
                `}
              >
                <span className={`text-xl mb-1 transition-transform ${active ? 'scale-110' : ''}`}>
                  {item.emoji}
                </span>
                <span className={`text-xs font-medium ${active ? 'font-bold' : ''}`}>
                  {item.label}
                </span>
                <span className="text-xs text-gray-400 hidden">
                  {item.description}
                </span>
                
                {/* 활성 상태 인디케이터 */}
                {active && (
                  <div 
                    className="w-1 h-1 rounded-full mt-1 transition-all"
                    style={{ backgroundColor: brandColors.primary }}
                  />
                )}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}