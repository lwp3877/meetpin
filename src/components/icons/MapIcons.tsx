/* src/components/icons/MapIcons.tsx */
// 🎯 지도 페이지 아이콘 최적화: 개별 임포트로 번들 최소화

import { ComponentType } from 'react'
import type { LucideProps } from 'lucide-react'

// 필수 아이콘만 즉시 로딩 - 개별 임포트로 번들 최소화
import Search from 'lucide-react/dist/esm/icons/search'
import MapPin from 'lucide-react/dist/esm/icons/map-pin'
import SlidersHorizontal from 'lucide-react/dist/esm/icons/sliders-horizontal'
import Plus from 'lucide-react/dist/esm/icons/plus'
import Users from 'lucide-react/dist/esm/icons/users'
import Mail from 'lucide-react/dist/esm/icons/mail'
import User from 'lucide-react/dist/esm/icons/user'
import TrendingUp from 'lucide-react/dist/esm/icons/trending-up'
import Calendar from 'lucide-react/dist/esm/icons/calendar'
import DollarSign from 'lucide-react/dist/esm/icons/dollar-sign'
import Filter from 'lucide-react/dist/esm/icons/filter'
import X from 'lucide-react/dist/esm/icons/x'
import Navigation from 'lucide-react/dist/esm/icons/navigation'
import LogOut from 'lucide-react/dist/esm/icons/log-out'

export {
  Search,
  MapPin,
  SlidersHorizontal,
  Plus,
  Users,
  Mail,
  User,
  TrendingUp,
  Calendar,
  DollarSign,
  Filter,
  X,
  Navigation,
  LogOut,
}
