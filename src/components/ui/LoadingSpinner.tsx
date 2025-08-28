/* src/components/ui/LoadingSpinner.tsx */
import React from 'react'
import { brandColors } from '@/lib/brand'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  color?: 'primary' | 'white' | 'gray'
  className?: string
  text?: string
}

const sizeClasses = {
  sm: 'w-4 h-4',
  md: 'w-6 h-6', 
  lg: 'w-8 h-8',
  xl: 'w-12 h-12'
}

const colorClasses = {
  primary: `border-primary`,
  white: 'border-white',
  gray: 'border-gray-400'
}

export default function LoadingSpinner({ 
  size = 'md', 
  color = 'primary', 
  className = '',
  text 
}: LoadingSpinnerProps) {
  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div 
        className={`${sizeClasses[size]} ${colorClasses[color]} border-4 border-t-transparent rounded-full animate-spin`}
        role="status" 
        aria-label="Loading"
      />
      {text && (
        <p className="mt-3 text-sm text-gray-600 animate-pulse">{text}</p>
      )}
    </div>
  )
}

// Preset loading components for common use cases
export function PageLoader({ text = "페이지를 불러오는 중..." }: { text?: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-blue-50 flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}

export function CardLoader({ text }: { text?: string }) {
  return (
    <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
      <LoadingSpinner size="md" text={text} />
    </div>
  )
}

export function InlineLoader({ text }: { text?: string }) {
  return (
    <div className="flex items-center justify-center p-4">
      <LoadingSpinner size="sm" />
      {text && <span className="ml-2 text-sm text-gray-600">{text}</span>}
    </div>
  )
}