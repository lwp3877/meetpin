/* src/components/ui/SmartRecommendations.tsx - AI 기반 맞춤 추천 시스템 */
'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Sparkles, MapPin, Users, Clock, TrendingUp, Heart } from 'lucide-react'
import { useAuth } from '@/lib/useAuth'
import { getCategoryDisplay } from '@/lib/brand'

interface RecommendedRoom {
  id: string
  title: string
  category: 'drink' | 'exercise' | 'other'
  lat: number
  lng: number
  place_text: string
  start_at: string
  max_people: number
  current_people: number
  fee: number
  distance: number
  matchScore: number
  reasons: string[]
  host: {
    nickname: string
    age_range: string
    avatar_url?: string
  }
}

interface SmartRecommendationsProps {
  userLocation?: { lat: number; lng: number }
  onRoomSelect?: (room: RecommendedRoom) => void
  className?: string
}

export default function SmartRecommendations({
  userLocation,
  onRoomSelect,
  className = ''
}: SmartRecommendationsProps) {
  const { user } = useAuth()
  const [recommendations, setRecommendations] = useState<RecommendedRoom[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCategory, setSelectedCategory] = useState<'all' | 'drink' | 'exercise' | 'other'>('all')

  // 추천 데이터 가져오기
  const fetchRecommendations = useCallback(async () => {
    if (!user) return

    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        category: selectedCategory === 'all' ? '' : selectedCategory,
        ...(userLocation && {
          lat: userLocation.lat.toString(),
          lng: userLocation.lng.toString()
        })
      })

      const response = await fetch(`/api/recommendations?${params}`)
      const result = await response.json()

      if (result.ok) {
        setRecommendations(result.data || [])
      }
    } catch (error) {
      console.error('Failed to fetch recommendations:', error)
    } finally {
      setIsLoading(false)
    }
  }, [user, selectedCategory, userLocation])

  useEffect(() => {
    fetchRecommendations()
  }, [fetchRecommendations])

  // 매치 점수에 따른 색상
  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  // 매치 이유 이모지
  const getReasonEmoji = (reason: string) => {
    if (reason.includes('거리')) return '📍'
    if (reason.includes('관심사')) return '❤️'
    if (reason.includes('시간')) return '⏰'
    if (reason.includes('연령대')) return '👥'
    if (reason.includes('평점')) return '⭐'
    return '✨'
  }

  if (!user) return null

  return (
    <div className={`space-y-4 ${className}`}>
      {/* 헤더 */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600" />
          <h2 className="text-lg font-semibold text-gray-900">맞춤 추천</h2>
        </div>
        <Button
          onClick={fetchRecommendations}
          variant="ghost"
          size="sm"
          disabled={isLoading}
          className="text-sm"
        >
          <TrendingUp className="w-4 h-4 mr-2" />
          {isLoading ? '업데이트 중...' : '새로고침'}
        </Button>
      </div>

      {/* 카테고리 필터 */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {[
          { key: 'all', label: '전체', icon: '🎯' },
          { key: 'drink', label: '술모임', icon: '🍻' },
          { key: 'exercise', label: '운동', icon: '💪' },
          { key: 'other', label: '기타', icon: '✨' }
        ].map((category) => (
          <Button
            key={category.key}
            onClick={() => setSelectedCategory(category.key as any)}
            variant={selectedCategory === category.key ? 'default' : 'outline'}
            size="sm"
            className="whitespace-nowrap"
          >
            <span className="mr-1">{category.icon}</span>
            {category.label}
          </Button>
        ))}
      </div>

      {/* 추천 목록 */}
      <div className="space-y-3">
        {isLoading ? (
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-3/4 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : recommendations.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-2">현재 추천할 모임이 없습니다</p>
              <p className="text-sm text-gray-400">
                프로필을 더 자세히 채우거나 관심사를 추가해보세요
              </p>
              <Button
                onClick={() => window.location.href = '/profile'}
                variant="outline"
                size="sm"
                className="mt-3"
              >
                프로필 완성하기
              </Button>
            </CardContent>
          </Card>
        ) : (
          recommendations.map((room) => {
            const categoryDisplay = getCategoryDisplay(room.category)
            const timeUntilStart = Math.max(0, new Date(room.start_at).getTime() - Date.now())
            const hoursUntilStart = Math.ceil(timeUntilStart / (1000 * 60 * 60))

            return (
              <Card
                key={room.id}
                className="hover:shadow-md transition-all duration-200 cursor-pointer border-l-4"
                style={{ borderLeftColor: categoryDisplay.color }}
                onClick={() => onRoomSelect?.(room)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-lg">{categoryDisplay.emoji}</span>
                        <h3 className="font-semibold text-gray-900 line-clamp-1">
                          {room.title}
                        </h3>
                        <Badge
                          className={`text-xs font-medium ${getMatchScoreColor(room.matchScore)}`}
                        >
                          {room.matchScore}% 매치
                        </Badge>
                      </div>
                      
                      <div className="flex items-center text-sm text-gray-600 mb-2">
                        <MapPin className="w-4 h-4 mr-1" />
                        <span className="truncate">{room.place_text}</span>
                        <span className="mx-2">•</span>
                        <span>{room.distance}km</span>
                      </div>

                      <div className="flex items-center gap-4 text-sm text-gray-600 mb-3">
                        <div className="flex items-center">
                          <Clock className="w-4 h-4 mr-1" />
                          {hoursUntilStart <= 2 ? (
                            <span className="text-red-600 font-medium">곧 시작</span>
                          ) : hoursUntilStart <= 24 ? (
                            <span>{hoursUntilStart}시간 후</span>
                          ) : (
                            <span>{new Date(room.start_at).toLocaleDateString('ko-KR')}</span>
                          )}
                        </div>
                        <div className="flex items-center">
                          <Users className="w-4 h-4 mr-1" />
                          <span>{room.current_people}/{room.max_people}명</span>
                        </div>
                        {room.fee > 0 && (
                          <div className="text-green-600 font-medium">
                            ₩{room.fee.toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center ml-3">
                      {room.host.avatar_url ? (
                        <Image
                          src={room.host.avatar_url}
                          alt={room.host.nickname}
                          width={32}
                          height={32}
                          className="w-8 h-8 rounded-full"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          <span className="text-xs text-gray-600">
                            {room.host.nickname[0]}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* 추천 이유 */}
                  <div className="flex flex-wrap gap-1 mb-2">
                    {room.reasons.slice(0, 3).map((reason, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center text-xs bg-purple-50 text-purple-700 px-2 py-1 rounded-full"
                      >
                        <span className="mr-1">{getReasonEmoji(reason)}</span>
                        {reason}
                      </span>
                    ))}
                  </div>

                  {/* 호스트 정보 */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="text-gray-600">
                      <span className="font-medium">{room.host.nickname}</span>
                      <span className="mx-1">•</span>
                      <span>{room.host.age_range}</span>
                    </div>
                    {room.matchScore >= 85 && (
                      <div className="flex items-center text-pink-600">
                        <Heart className="w-3 h-3 mr-1 fill-current" />
                        <span className="text-xs font-medium">높은 매치!</span>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>

      {/* 더보기 */}
      {recommendations.length > 0 && (
        <div className="text-center pt-2">
          <Button
            onClick={() => window.location.href = `/map?category=${selectedCategory === 'all' ? '' : selectedCategory}`}
            variant="outline"
            size="sm"
          >
            지도에서 더 많은 모임 보기
          </Button>
        </div>
      )}
    </div>
  )
}