/**
 * 실시간 활동 통계를 보여주는 컴포넌트
 * 플랫폼이 활발하게 사용되고 있다는 인상을 주어 신뢰도 증진
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, MessageCircle, Heart, TrendingUp, Activity } from 'lucide-react'

interface ActivityStat {
  id: string
  icon: React.ReactNode
  label: string
  value: number
  trend: 'up' | 'down' | 'stable'
  color: string
  bgColor: string
}

interface LiveActivityStatsProps {
  className?: string
}

export function LiveActivityStats(_props: LiveActivityStatsProps = {}) {
  const [stats, setStats] = useState<ActivityStat[]>([
    {
      id: 'online',
      icon: <Activity className="h-5 w-5" />,
      label: '현재 접속자',
      value: 1247,
      trend: 'up',
      color: 'text-emerald-600 dark:text-emerald-400',
      bgColor: 'bg-emerald-50 dark:bg-emerald-900/20',
    },
    {
      id: 'active-rooms',
      icon: <MapPin className="h-5 w-5" />,
      label: '활성 방',
      value: 156,
      trend: 'up',
      color: 'text-blue-600 dark:text-blue-400',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
    },
    {
      id: 'new-matches',
      icon: <Heart className="h-5 w-5" />,
      label: '오늘 새 매칭',
      value: 89,
      trend: 'up',
      color: 'text-purple-600 dark:text-purple-400',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
    },
    {
      id: 'messages',
      icon: <MessageCircle className="h-5 w-5" />,
      label: '주고받은 메시지',
      value: 2341,
      trend: 'up',
      color: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
    },
  ])

  const [recentActivities, setRecentActivities] = useState([
    { id: 1, text: '민주님이 강남에서 방을 만들었어요', time: '방금 전', type: 'room' },
    { id: 2, text: '준호님과 소영님이 매칭되었어요', time: '1분 전', type: 'match' },
    { id: 3, text: '현재 홍대에서 3개 방이 활성화됨', time: '2분 전', type: 'activity' },
    { id: 4, text: '지훈님이 운동 모임을 시작했어요', time: '3분 전', type: 'room' },
    { id: 5, text: '이태원 지역 접속자 급증 중', time: '4분 전', type: 'trend' },
  ])

  useEffect(() => {
    // 실시간 통계 업데이트 시뮬레이션
    const statsInterval = setInterval(() => {
      setStats(prevStats =>
        prevStats.map(stat => ({
          ...stat,
          value: stat.value + Math.floor(Math.random() * 3) - 1, // -1, 0, 1, 2 증감
        }))
      )
    }, 3000)

    // 실시간 활동 피드 업데이트
    const activitiesInterval = setInterval(() => {
      const names = ['민주', '준호', '소영', '지훈', '채영', '도현', '유진', '태민']
      const locations = ['강남', '홍대', '이태원', '성수', '건대', '신촌', '압구정', '잠실']
      const activities = [
        `${names[Math.floor(Math.random() * names.length)]}님이 ${locations[Math.floor(Math.random() * locations.length)]}에서 방을 만들었어요`,
        `${names[Math.floor(Math.random() * names.length)]}님과 ${names[Math.floor(Math.random() * names.length)]}님이 매칭되었어요`,
        `현재 ${locations[Math.floor(Math.random() * locations.length)]}에서 ${Math.floor(Math.random() * 5) + 2}개 방이 활성화됨`,
        `${names[Math.floor(Math.random() * names.length)]}님이 새로운 모임을 시작했어요`,
        `${locations[Math.floor(Math.random() * locations.length)]} 지역 접속자 증가 중`,
      ]

      setRecentActivities(prev => [
        {
          id: Date.now(),
          text: activities[Math.floor(Math.random() * activities.length)],
          time: '방금 전',
          type: ['room', 'match', 'activity', 'trend'][Math.floor(Math.random() * 4)],
        },
        ...prev.slice(0, 4).map(activity => ({
          ...activity,
          time:
            activity.time === '방금 전'
              ? '1분 전'
              : activity.time === '1분 전'
                ? '2분 전'
                : activity.time === '2분 전'
                  ? '3분 전'
                  : activity.time === '3분 전'
                    ? '4분 전'
                    : '5분 전',
        })),
      ])
    }, 6000)

    return () => {
      clearInterval(statsInterval)
      clearInterval(activitiesInterval)
    }
  }, [])

  return (
    <div className="space-y-6">
      {/* Real-time Stats */}
      <Card className="border-0 bg-white/95 shadow-xl backdrop-blur-sm dark:bg-gray-900/95">
        <CardContent className="p-6">
          <div className="mb-6 text-center">
            <h3 className="mb-2 flex items-center justify-center space-x-2 text-xl font-bold text-gray-800 dark:text-gray-200">
              <TrendingUp className="h-5 w-5 text-emerald-500" />
              <span>🔥 실시간 현황</span>
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              지금 이 순간 밋핀에서 일어나고 있는 일들
            </p>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {stats.map(stat => (
              <div
                key={stat.id}
                className={`${stat.bgColor} rounded-xl p-4 text-center transition-all duration-300 hover:scale-105`}
              >
                <div className={`${stat.color} mb-2 flex justify-center`}>{stat.icon}</div>
                <div className={`text-2xl font-bold ${stat.color} mb-1`}>
                  {stat.value.toLocaleString()}
                </div>
                <div className="mb-2 text-xs text-gray-600 dark:text-gray-400">{stat.label}</div>
                <Badge
                  variant="secondary"
                  className={`text-xs ${
                    stat.trend === 'up'
                      ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                      : stat.trend === 'down'
                        ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300'
                        : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
                  }`}
                >
                  {stat.trend === 'up' ? '↗' : stat.trend === 'down' ? '↘' : '→'}
                  {stat.trend === 'up' ? '증가' : stat.trend === 'down' ? '감소' : '안정'}
                </Badge>
              </div>
            ))}
          </div>

          {/* Live Activity Feed */}
          <div className="rounded-xl bg-gradient-to-r from-gray-50 to-gray-100 p-4 dark:from-gray-800 dark:to-gray-700">
            <div className="mb-3 flex items-center space-x-2">
              <div className="h-3 w-3 animate-pulse rounded-full bg-emerald-500"></div>
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                실시간 활동
              </span>
            </div>
            <div className="max-h-32 space-y-2 overflow-hidden">
              {recentActivities.map(activity => (
                <div
                  key={activity.id}
                  className="animate-fade-in flex items-center justify-between text-sm"
                >
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2 w-2 rounded-full ${
                        activity.type === 'room'
                          ? 'bg-blue-500'
                          : activity.type === 'match'
                            ? 'bg-purple-500'
                            : activity.type === 'activity'
                              ? 'bg-emerald-500'
                              : 'bg-orange-500'
                      }`}
                    ></div>
                    <span className="text-gray-700 dark:text-gray-300">{activity.text}</span>
                  </div>
                  <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">
                    {activity.time}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Popular Time Slots */}
      <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-pink-50 shadow-lg dark:border-purple-800 dark:from-purple-900/20 dark:to-pink-900/20">
        <CardContent className="p-6">
          <h4 className="mb-4 text-center font-bold text-purple-700 dark:text-purple-300">
            ⏰ 지금이 만남의 골든타임!
          </h4>
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-800">
              <div className="text-lg font-bold text-purple-600 dark:text-purple-400">
                저녁 7-9시
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">가장 활발한 시간</div>
              <Badge className="mt-1 bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300">
                🔥 HOT
              </Badge>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-800">
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">주말 오후</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">여유로운 만남</div>
              <Badge className="mt-1 bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300">
                ☀️ 인기
              </Badge>
            </div>
            <div className="rounded-lg bg-white p-3 text-center shadow-sm dark:bg-gray-800">
              <div className="text-lg font-bold text-emerald-600 dark:text-emerald-400">
                점심시간
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">직장인 모임</div>
              <Badge className="mt-1 bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300">
                💼 급증
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default LiveActivityStats
