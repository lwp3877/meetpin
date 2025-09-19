/* 파일경로: src/components/theme-toggle.tsx */
'use client'

import * as React from 'react'
import { Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { isFeatureEnabled } from '@/lib/config/features'

export function ThemeToggle() {
  const { setTheme } = useTheme()

  if (!isFeatureEnabled('ENABLE_DARK_MODE')) {
    return null
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-9 w-9 px-0 hover:bg-gray-100/80 dark:hover:bg-gray-800/80 transition-all duration-200"
        >
          <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">테마 변경</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-[120px]">
        <DropdownMenuItem 
          onClick={() => setTheme('light')}
          className="cursor-pointer"
        >
          <Sun className="mr-2 h-4 w-4" />
          <span>라이트</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('dark')}
          className="cursor-pointer"
        >
          <Moon className="mr-2 h-4 w-4" />
          <span>다크</span>
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme('system')}
          className="cursor-pointer"
        >
          <div className="mr-2 h-4 w-4 rounded-full bg-gradient-to-r from-gray-400 to-gray-600" />
          <span>시스템</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}