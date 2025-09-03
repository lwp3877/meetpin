/* src/components/ui/EnhancedProfile.tsx */
'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useAuth } from '@/lib/useAuth'
import { 
  User, 
  Users, 
  MessageSquare, 
  Trophy, 
  Activity,
  MapPin,
  Clock,
  TrendingUp,
  Award,
  Star
} from 'lucide-react'
import { getCategoryDisplay } from '@/lib/brand'

interface ProfileStats {
  hostedRooms: number
  joinedRooms: number
  completedMatches: number
  totalMessages: number
  memberSince: string
  achievements: Achievement[]
  recentActivity: ActivityItem[]
  favoriteCategories: CategoryStat[]
}

interface Achievement {
  id: string
  name: string
  description: string
  earned: boolean
  earnedAt?: string
}

interface ActivityItem {
  type: 'hosted' | 'joined' | 'message'
  title: string
  date: string
  participants?: number
  host?: string
}

interface CategoryStat {
  category: string
  count: number
  percentage: number
}

interface EnhancedProfileProps {
  showHeader?: boolean
  className?: string
}

export function EnhancedProfile({ showHeader = false, className = '' }: EnhancedProfileProps) {
  const { user } = useAuth()
  const [activeTab, setActiveTab] = useState<'overview' | 'activity' | 'achievements'>('overview')
  const [stats, setStats] = useState<ProfileStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        setLoading(true)
        const response = await fetch('/api/profile/stats')
        const data = await response.json()

        if (data.ok) {
          setStats(data.data)
        }
      } catch (error) {
        console.error('Failed to fetch profile stats:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  const formatMemberSince = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    return `${year}년 ${month}월 가입`
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) return '오늘'
    if (diffDays === 1) return '어제'
    if (diffDays < 7) return `${diffDays}일 전`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)}주 전`
    return `${Math.floor(diffDays / 30)}개월 전`
  }

  if (!user) return null

  const tabs = [
    { id: 'overview' as const, label: '개요', icon: User },
    { id: 'activity' as const, label: '활동', icon: Activity },
    { id: 'achievements' as const, label: '성취', icon: Trophy },
  ]

  return (
    <div className={`bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden ${className}`}>
      {showHeader && (
        <div className="bg-gradient-to-r from-emerald-500 to-blue-500 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
              {user.avatar_url ? (
                <Image
                  src={user.avatar_url}
                  alt={user.nickname || '프로필'}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <User className="w-8 h-8" />
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{user.nickname}</h2>
              <p className="opacity-90">
                {stats && formatMemberSince(stats.memberSince)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab Navigation */}
      <div className="flex border-b border-gray-100">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 py-4 px-6 flex items-center justify-center space-x-2 font-medium transition-colors ${
                activeTab === tab.id
                  ? 'text-emerald-600 border-b-2 border-emerald-600 bg-emerald-50/30'
                  : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <div className="p-6">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
            <span className="ml-3 text-gray-600">통계를 불러오는 중...</span>
          </div>
        ) : (
          <>
            {activeTab === 'overview' && stats && (
              <div className="space-y-6">
                {/* Stats Grid */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <Users className="w-5 h-5 text-emerald-600" />
                      <span className="text-2xl font-bold text-emerald-700">{stats.hostedRooms}</span>
                    </div>
                    <p className="text-sm font-medium text-emerald-600">주최한 모임</p>
                  </div>
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <MapPin className="w-5 h-5 text-blue-600" />
                      <span className="text-2xl font-bold text-blue-700">{stats.joinedRooms}</span>
                    </div>
                    <p className="text-sm font-medium text-blue-600">참여한 모임</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <MessageSquare className="w-5 h-5 text-purple-600" />
                      <span className="text-2xl font-bold text-purple-700">{stats.totalMessages}</span>
                    </div>
                    <p className="text-sm font-medium text-purple-600">보낸 메시지</p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-xl">
                    <div className="flex items-center justify-between mb-2">
                      <Star className="w-5 h-5 text-orange-600" />
                      <span className="text-2xl font-bold text-orange-700">{stats.completedMatches}</span>
                    </div>
                    <p className="text-sm font-medium text-orange-600">성공적 매칭</p>
                  </div>
                </div>

                {/* Favorite Categories */}
                {stats.favoriteCategories.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="font-semibold text-gray-900 flex items-center">
                      <TrendingUp className="w-4 h-4 mr-2 text-emerald-600" />
                      관심 카테고리
                    </h3>
                    <div className="space-y-2">
                      {stats.favoriteCategories.map((cat) => {
                        const categoryDisplay = getCategoryDisplay(cat.category as any)
                        return (
                          <div key={cat.category} className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                              <span>{categoryDisplay.emoji}</span>
                              <span className="text-sm font-medium">{categoryDisplay.label}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600"
                                  style={{ 
                                    width: `${cat.percentage}%`,
                                    backgroundColor: categoryDisplay.color
                                  }}
                                />
                              </div>
                              <span className="text-xs text-gray-500 w-8">{cat.count}회</span>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'activity' && stats && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Clock className="w-4 h-4 mr-2 text-emerald-600" />
                  최근 활동
                </h3>
                {stats.recentActivity.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>아직 활동 내역이 없습니다</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {stats.recentActivity.map((activity, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm ${
                          activity.type === 'hosted' ? 'bg-emerald-500' :
                          activity.type === 'joined' ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          {activity.type === 'hosted' ? '🏠' :
                           activity.type === 'joined' ? '🙋‍♂️' : '💬'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900">{activity.title}</p>
                          <p className="text-xs text-gray-500">
                            {activity.type === 'hosted' && `${activity.participants}명 참여 가능`}
                            {activity.type === 'joined' && `호스트: ${activity.host}`}
                            {activity.type === 'message' && '새로운 대화'}
                          </p>
                          <p className="text-xs text-gray-400">{formatDate(activity.date)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'achievements' && stats && (
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center">
                  <Award className="w-4 h-4 mr-2 text-emerald-600" />
                  성취 배지
                </h3>
                {stats.achievements.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <Trophy className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p>아직 획득한 배지가 없습니다</p>
                    <p className="text-sm mt-1">더 많은 활동으로 배지를 획득해보세요!</p>
                  </div>
                ) : (
                  <div className="grid gap-3">
                    {stats.achievements.map((achievement) => (
                      <div 
                        key={achievement.id}
                        className={`p-4 rounded-lg border-2 ${
                          achievement.earned 
                            ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-300' 
                            : 'bg-gray-50 border-gray-200 opacity-60'
                        }`}
                      >
                        <div className="flex items-start space-x-3">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            achievement.earned ? 'bg-yellow-400 text-yellow-900' : 'bg-gray-300 text-gray-600'
                          }`}>
                            <Trophy className="w-6 h-6" />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${achievement.earned ? 'text-gray-900' : 'text-gray-500'}`}>
                              {achievement.name}
                            </h4>
                            <p className={`text-sm ${achievement.earned ? 'text-gray-700' : 'text-gray-400'}`}>
                              {achievement.description}
                            </p>
                            {achievement.earned && achievement.earnedAt && (
                              <p className="text-xs text-orange-600 mt-1">
                                {formatDate(achievement.earnedAt)} 획득
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}