/**
 * 봇 스케줄러 관리 및 모니터링 컴포넌트
 * 관리자 패널에서 봇 방 자동 생성 스케줄러를 제어하고 상태를 확인
 */

'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Square, 
  Clock, 
  BarChart3, 
  Settings, 
  RefreshCw,
  CheckCircle,
  AlertCircle,
  Bot,
  Calendar
} from 'lucide-react'
import { getBotScheduler } from '@/lib/bot-scheduler'

interface SchedulerStatus {
  isRunning: boolean
  activeTimers: number
  nextSchedule?: Date
}

interface BotSchedulerControlProps {}

export function BotSchedulerControl(_props: BotSchedulerControlProps = {}) {
  const [status, setStatus] = useState<SchedulerStatus>({
    isRunning: false,
    activeTimers: 0
  })
  const [isLoading, setIsLoading] = useState(false)

  // 스케줄러 상태 업데이트
  const updateStatus = () => {
    const scheduler = getBotScheduler()
    const currentStatus = scheduler.getStatus()
    setStatus(currentStatus)
  }

  useEffect(() => {
    updateStatus()
    
    // 10초마다 상태 업데이트
    const interval = setInterval(updateStatus, 10000)
    return () => clearInterval(interval)
  }, [])

  // 스케줄러 시작
  const handleStart = async () => {
    setIsLoading(true)
    try {
      const scheduler = getBotScheduler()
      scheduler.start()
      setTimeout(updateStatus, 1000) // 1초 후 상태 업데이트
    } catch (error) {
      console.error('스케줄러 시작 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 스케줄러 중지
  const handleStop = async () => {
    setIsLoading(true)
    try {
      const scheduler = getBotScheduler()
      scheduler.stop()
      setTimeout(updateStatus, 1000) // 1초 후 상태 업데이트
    } catch (error) {
      console.error('스케줄러 중지 오류:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // 테스트 방 생성
  const handleTestGeneration = async () => {
    setIsLoading(true)
    try {
      const scheduler = getBotScheduler()
      await scheduler.generateTestRooms(3)
      alert('테스트 봇 방 3개가 생성됩니다. (1.5초 간격)')
    } catch (error) {
      console.error('테스트 방 생성 오류:', error)
      alert('테스트 방 생성 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  const formatNextSchedule = (date?: Date): string => {
    if (!date) return '예정된 스케줄 없음'
    
    const now = new Date()
    const diff = date.getTime() - now.getTime()
    
    if (diff < 0) return '스케줄 지남'
    
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(minutes / 60)
    const days = Math.floor(hours / 24)
    
    if (days > 0) return `${days}일 후`
    if (hours > 0) return `${hours}시간 ${minutes % 60}분 후`
    return `${minutes}분 후`
  }

  return (
    <div className="space-y-6">
      {/* 스케줄러 상태 카드 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Bot className="h-5 w-5 text-blue-500" />
            <span>봇 방 자동 생성 스케줄러</span>
            <Badge 
              variant={status.isRunning ? "default" : "secondary"}
              className={status.isRunning ? "bg-green-500" : "bg-gray-500"}
            >
              {status.isRunning ? "실행 중" : "중지됨"}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 현재 상태 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className={`w-3 h-3 rounded-full ${status.isRunning ? 'bg-green-500 animate-pulse' : 'bg-gray-400'}`}></div>
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">상태</div>
                <div className="font-semibold">
                  {status.isRunning ? '실행 중' : '중지됨'}
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Clock className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">활성 타이머</div>
                <div className="font-semibold">{status.activeTimers}개</div>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <div className="text-sm text-gray-600 dark:text-gray-400">다음 실행</div>
                <div className="font-semibold text-sm">
                  {formatNextSchedule(status.nextSchedule)}
                </div>
              </div>
            </div>
          </div>

          {/* 제어 버튼 */}
          <div className="flex flex-wrap gap-3">
            <Button
              onClick={handleStart}
              disabled={status.isRunning || isLoading}
              className="flex items-center space-x-2"
            >
              <Play className="h-4 w-4" />
              <span>스케줄러 시작</span>
            </Button>
            
            <Button
              onClick={handleStop}
              disabled={!status.isRunning || isLoading}
              variant="destructive"
              className="flex items-center space-x-2"
            >
              <Square className="h-4 w-4" />
              <span>스케줄러 중지</span>
            </Button>
            
            <Button
              onClick={handleTestGeneration}
              disabled={isLoading}
              variant="outline"
              className="flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>테스트 생성 (3개)</span>
            </Button>
            
            <Button
              onClick={updateStatus}
              disabled={isLoading}
              variant="ghost"
              className="flex items-center space-x-2"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              <span>상태 새로고침</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 스케줄 정보 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5 text-green-500" />
            <span>일일 생성 스케줄</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* 시간대별 요약 */}
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                  <div className="font-semibold text-yellow-700 dark:text-yellow-300">오전 (06-12시)</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  평균 3-5개 방/시간<br />
                  주로 운동, 카페 모임
                </div>
              </div>
              
              <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                  <div className="font-semibold text-red-700 dark:text-red-300">저녁 (17-21시)</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  평균 6-9개 방/시간<br />
                  주로 술모임, 식사 모임
                </div>
              </div>
              
              <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <div className="font-semibold text-blue-700 dark:text-blue-300">밤 (21-24시)</div>
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">
                  평균 2-5개 방/시간<br />
                  주로 야간 술모임
                </div>
              </div>
            </div>

            {/* 요일별 가중치 */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3">요일별 생성량 조정</h4>
              <div className="grid grid-cols-7 gap-2 text-center">
                {['월', '화', '수', '목', '금', '토', '일'].map((day, index) => {
                  const multipliers = [0.8, 0.9, 1.0, 1.1, 1.3, 1.4, 1.2]
                  const multiplier = multipliers[index]
                  return (
                    <div key={day} className="p-2">
                      <div className="text-sm font-medium">{day}</div>
                      <div className={`text-xs px-2 py-1 rounded mt-1 ${
                        multiplier >= 1.3 ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                        multiplier >= 1.1 ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300' :
                        'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300'
                      }`}>
                        ×{multiplier}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* 주요 지역 분포 */}
            <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <h4 className="font-semibold mb-3">주요 생성 지역</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { area: '홍대', percentage: 35, color: 'bg-purple-500' },
                  { area: '강남', percentage: 30, color: 'bg-blue-500' },
                  { area: '이태원', percentage: 20, color: 'bg-green-500' },
                  { area: '기타', percentage: 15, color: 'bg-gray-500' }
                ].map(({ area, percentage, color }) => (
                  <div key={area} className="text-center">
                    <div className="flex items-center justify-center space-x-2 mb-1">
                      <div className={`w-3 h-3 ${color} rounded-full`}></div>
                      <span className="text-sm font-medium">{area}</span>
                    </div>
                    <div className="text-lg font-bold">{percentage}%</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 스케줄러 설명 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span>스케줄러 작동 방식</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3 text-sm text-gray-600 dark:text-gray-400">
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>자동 시간 관리:</strong> 하루 24시간 동안 미리 정의된 시간표에 따라 자동으로 봇 방을 생성합니다.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>요일별 조정:</strong> 주말과 평일에 따라 생성량을 자동 조정하여 현실적인 활동 패턴을 시뮬레이션합니다.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>지역별 분산:</strong> 각 시간대마다 적절한 지역에 가중치를 두어 방을 생성하여 자연스러운 분포를 만듭니다.
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
              <div>
                <strong>카테고리 최적화:</strong> 시간대에 맞는 적절한 모임 카테고리를 선택하여 현실감을 높입니다.
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default BotSchedulerControl