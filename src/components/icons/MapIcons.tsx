/* src/components/icons/MapIcons.tsx */
// 🎯 지도 페이지 아이콘 최적화: 필요할 때만 로딩

import dynamic from 'next/dynamic'
import { ComponentType } from 'react'
import { LucideProps } from 'lucide-react'

// 필수 아이콘만 즉시 로딩
export { Search, MapPin } from 'lucide-react'

// 사용자 인터랙션 시에만 필요한 아이콘들을 동적 로딩
export const SlidersHorizontal = dynamic(() => import('lucide-react').then(mod => ({ default: mod.SlidersHorizontal })), {
  ssr: false,
  loading: () => <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Plus = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Plus })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Users = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Users })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Mail = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Mail })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const User = dynamic(() => import('lucide-react').then(mod => ({ default: mod.User })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const TrendingUp = dynamic(() => import('lucide-react').then(mod => ({ default: mod.TrendingUp })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Calendar = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Calendar })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const DollarSign = dynamic(() => import('lucide-react').then(mod => ({ default: mod.DollarSign })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Filter = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Filter })), {
  ssr: false,
  loading: () => <div className="w-3 h-3 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const X = dynamic(() => import('lucide-react').then(mod => ({ default: mod.X })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const Navigation = dynamic(() => import('lucide-react').then(mod => ({ default: mod.Navigation })), {
  ssr: false,
  loading: () => <div className="w-4 h-4 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>

export const LogOut = dynamic(() => import('lucide-react').then(mod => ({ default: mod.LogOut })), {
  ssr: false,
  loading: () => <div className="w-5 h-5 bg-gray-200 rounded animate-pulse" />
}) as ComponentType<LucideProps>