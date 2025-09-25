'use client'

import React, { useState, useEffect } from 'react'
import { useConsent } from '@/lib/consent'
import { CONSENT_CATEGORIES, DEFAULT_CONSENT_CONFIG } from '@/lib/consent/config'
import type { ConsentPreferences } from '@/lib/consent/types'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Shield,
  BarChart3,
  Target,
  Cookie,
  Eye,
  Download,
  Trash2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'

interface CookieSettingsModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export default function CookieSettingsModal({ open, onOpenChange }: CookieSettingsModalProps) {
  const {
    preferences: currentPreferences,
    updateConsent,
    resetPreferences,
    getEventHistory,
  } = useConsent()

  const [analyticsEnabled, setAnalyticsEnabled] = useState(false)
  const [marketingEnabled, setMarketingEnabled] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)

  // 현재 설정으로 상태 초기화
  useEffect(() => {
    if (currentPreferences) {
      const newAnalytics = currentPreferences.analytics === 'granted'
      const newMarketing = currentPreferences.marketing === 'granted'

      setAnalyticsEnabled(newAnalytics)
      setMarketingEnabled(newMarketing)
      setHasChanges(false)
    }
  }, [currentPreferences])

  // 변경사항 감지
  useEffect(() => {
    if (currentPreferences) {
      const originalAnalytics = currentPreferences.analytics === 'granted'
      const originalMarketing = currentPreferences.marketing === 'granted'

      setHasChanges(
        analyticsEnabled !== originalAnalytics || marketingEnabled !== originalMarketing
      )
    }
  }, [analyticsEnabled, marketingEnabled, currentPreferences])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      await updateConsent({
        analytics: analyticsEnabled ? 'granted' : 'denied',
        marketing: marketingEnabled ? 'granted' : 'denied',
      })
      onOpenChange(false)
    } catch (error) {
      console.error('Failed to save consent preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = async () => {
    setIsLoading(true)
    try {
      await resetPreferences()
      setAnalyticsEnabled(false)
      setMarketingEnabled(false)
      setHasChanges(false)
    } catch (error) {
      console.error('Failed to reset consent preferences:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const exportData = () => {
    if (!currentPreferences) return

    const data = {
      preferences: currentPreferences,
      history: getEventHistory(),
      exportDate: new Date().toISOString(),
      version: DEFAULT_CONSENT_CONFIG.version,
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], {
      type: 'application/json',
    })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `meetpin-consent-data-${new Date().toISOString().split('T')[0]}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const categoryIcons = {
    necessary: Shield,
    analytics: BarChart3,
    marketing: Target,
  }

  const categoryColors = {
    necessary: 'text-green-500',
    analytics: 'text-blue-500',
    marketing: 'text-purple-500',
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <Cookie className="mr-2 h-5 w-5 text-amber-500" />
            쿠키 및 개인정보 설정
          </DialogTitle>
          <DialogDescription>
            개인정보보호를 위한 상세 쿠키 설정을 관리하고 데이터 권리를 행사하세요.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="settings" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="settings">설정</TabsTrigger>
            <TabsTrigger value="details">상세정보</TabsTrigger>
            <TabsTrigger value="history">이력</TabsTrigger>
            <TabsTrigger value="rights">권리행사</TabsTrigger>
          </TabsList>

          {/* 설정 탭 */}
          <TabsContent value="settings" className="space-y-4">
            {Object.entries(CONSENT_CATEGORIES).map(([key, category]) => {
              const Icon = categoryIcons[key as keyof typeof categoryIcons]
              const isRequired = category.required
              const isAnalytics = key === 'analytics'
              const isMarketing = key === 'marketing'

              let isEnabled = true
              let onToggle = undefined

              if (isAnalytics) {
                isEnabled = analyticsEnabled
                onToggle = setAnalyticsEnabled
              } else if (isMarketing) {
                isEnabled = marketingEnabled
                onToggle = setMarketingEnabled
              }

              return (
                <Card key={key} className="border">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <Icon
                          className={`mr-3 h-5 w-5 ${categoryColors[key as keyof typeof categoryColors]}`}
                        />
                        <div>
                          <CardTitle className="text-base">{category.title}</CardTitle>
                          <p className="mt-1 text-sm text-gray-600">{category.description}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {isRequired ? (
                          <Badge
                            variant="secondary"
                            className="border-green-200 bg-green-50 text-green-700"
                          >
                            필수
                          </Badge>
                        ) : (
                          <>
                            <Badge variant="outline">선택</Badge>
                            <Switch
                              checked={isEnabled}
                              onCheckedChange={onToggle}
                              disabled={isLoading}
                            />
                          </>
                        )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="text-sm text-gray-500">
                      <strong>포함 기능:</strong>
                      <ul className="mt-1 list-inside list-disc space-y-1">
                        {category.examples.map((example, index) => (
                          <li key={index}>{example}</li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </TabsContent>

          {/* 상세정보 탭 */}
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4">
              {/* 분석 서비스 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <BarChart3 className="mr-2 h-5 w-5 text-blue-500" />
                    분석 서비스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DEFAULT_CONSENT_CONFIG.metadata.analytics_services.map((service, index) => (
                      <div key={index} className="rounded border border-gray-200 p-3">
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          <a
                            href={service.privacy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            정책 보기
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">{service.purpose}</p>
                        <div className="text-xs text-gray-500">
                          <strong>제공업체:</strong> {service.provider}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>쿠키:</strong> {service.cookies.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* 마케팅 서비스 */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center text-base">
                    <Target className="mr-2 h-5 w-5 text-purple-500" />
                    마케팅 서비스
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {DEFAULT_CONSENT_CONFIG.metadata.marketing_services.map((service, index) => (
                      <div key={index} className="rounded border border-gray-200 p-3">
                        <div className="mb-2 flex items-start justify-between">
                          <h4 className="font-medium">{service.name}</h4>
                          <a
                            href={service.privacy_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center text-sm text-blue-600 hover:text-blue-800"
                          >
                            정책 보기
                            <ExternalLink className="ml-1 h-3 w-3" />
                          </a>
                        </div>
                        <p className="mb-2 text-sm text-gray-600">{service.purpose}</p>
                        <div className="text-xs text-gray-500">
                          <strong>제공업체:</strong> {service.provider}
                        </div>
                        <div className="text-xs text-gray-500">
                          <strong>쿠키:</strong> {service.cookies.join(', ')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* 이력 탭 */}
          <TabsContent value="history" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Eye className="mr-2 h-5 w-5" />
                  동의 이력
                </CardTitle>
              </CardHeader>
              <CardContent>
                {currentPreferences ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <strong>동의 버전:</strong> {currentPreferences.version}
                      </div>
                      <div>
                        <strong>마지막 업데이트:</strong>{' '}
                        {new Date(currentPreferences.timestamp).toLocaleString('ko-KR')}
                      </div>
                    </div>

                    <div className="border-t pt-3">
                      <h4 className="mb-2 font-medium">현재 설정</h4>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span>필수 쿠키:</span>
                          <Badge variant="secondary" className="bg-green-50 text-green-700">
                            허용됨
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>분석 쿠키:</span>
                          <Badge
                            variant={
                              currentPreferences.analytics === 'granted' ? 'default' : 'outline'
                            }
                            className={
                              currentPreferences.analytics === 'granted'
                                ? 'bg-blue-50 text-blue-700'
                                : ''
                            }
                          >
                            {currentPreferences.analytics === 'granted' ? '허용됨' : '거부됨'}
                          </Badge>
                        </div>
                        <div className="flex justify-between">
                          <span>마케팅 쿠키:</span>
                          <Badge
                            variant={
                              currentPreferences.marketing === 'granted' ? 'default' : 'outline'
                            }
                            className={
                              currentPreferences.marketing === 'granted'
                                ? 'bg-purple-50 text-purple-700'
                                : ''
                            }
                          >
                            {currentPreferences.marketing === 'granted' ? '허용됨' : '거부됨'}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <p className="text-gray-500">동의 정보가 없습니다.</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* 권리행사 탭 */}
          <TabsContent value="rights" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center text-base">
                  <Shield className="mr-2 h-5 w-5" />
                  개인정보보호 권리
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600">
                  개인정보보호법에 따라 다음 권리를 행사할 수 있습니다.
                </p>

                <div className="grid gap-3">
                  <Button
                    variant="outline"
                    className="h-auto justify-start p-4"
                    onClick={exportData}
                  >
                    <Download className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">데이터 내보내기</div>
                      <div className="text-sm text-gray-500">
                        내 동의 설정과 이력을 JSON 파일로 다운로드
                      </div>
                    </div>
                  </Button>

                  <Button
                    variant="outline"
                    className="h-auto justify-start border-red-200 p-4 text-red-600 hover:bg-red-50"
                    onClick={handleReset}
                    disabled={isLoading}
                  >
                    <Trash2 className="mr-3 h-4 w-4" />
                    <div className="text-left">
                      <div className="font-medium">설정 초기화</div>
                      <div className="text-sm text-gray-500">
                        모든 동의 설정을 기본값으로 되돌리기
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-3">
                  <div className="flex items-start">
                    <AlertTriangle className="mt-0.5 mr-2 h-4 w-4 text-yellow-600" />
                    <div className="text-sm">
                      <strong className="text-yellow-800">참고:</strong>
                      <p className="mt-1 text-yellow-700">
                        계정 삭제나 추가적인 데이터 권리 행사는{' '}
                        <a href="mailto:privacy@meetpin.com" className="underline">
                          privacy@meetpin.com
                        </a>
                        으로 문의해 주세요.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <div className="flex w-full justify-between">
            <div className="flex space-x-2">
              {hasChanges && (
                <p className="flex items-center text-sm text-amber-600">
                  <AlertTriangle className="mr-1 h-4 w-4" />
                  저장되지 않은 변경사항이 있습니다
                </p>
              )}
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isLoading}>
                취소
              </Button>
              <Button onClick={handleSave} disabled={isLoading || !hasChanges}>
                {isLoading ? '저장 중...' : '설정 저장'}
              </Button>
            </div>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
