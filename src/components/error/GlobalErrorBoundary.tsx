/* src/components/error/GlobalErrorBoundary.tsx */
'use client'

import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import AlertTriangle from 'lucide-react/dist/esm/icons/alert-triangle'
import RefreshCw from 'lucide-react/dist/esm/icons/refresh-cw'
import Home from 'lucide-react/dist/esm/icons/home'
import Bug from 'lucide-react/dist/esm/icons/bug'
import toast from 'react-hot-toast'
import { logger } from '@/lib/observability/logger'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  errorId: string
}

/**
 * 전역 에러 바운더리 - 모든 React 에러를 포착하고 사용자 친화적인 UI 제공
 */
export class GlobalErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    }
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error,
      errorId: GlobalErrorBoundary.prototype.generateErrorId(),
    }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    logger.error('Error Boundary caught an error', {
      error: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack
    })

    this.setState({
      error,
      errorInfo,
    })

    // 개발 모드에서는 상세한 에러 정보를 콘솔에 출력
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Details')
      logger.error('Error', { error: error instanceof Error ? error.message : String(error) })
      logger.error('Component Stack', { componentStack: errorInfo.componentStack })
      logger.error('Error Stack', { stack: error.stack })
      console.groupEnd()
    }

    // 에러 보고 (실제 운영에서는 외부 서비스로 전송)
    this.reportError(error, errorInfo)

    // 사용자에게 알림
    toast.error('앱에서 예기치 못한 오류가 발생했습니다', {
      duration: 5000,
      icon: '⚠️',
    })
  }

  private generateErrorId(): string {
    return `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private reportError(error: Error, errorInfo: ErrorInfo) {
    const errorReport = {
      id: this.state.errorId,
      message: error.message,
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      userId: this.getCurrentUserId(),
    }

    // 실제 운영에서는 에러 추적 서비스로 전송
    if (process.env.NODE_ENV === 'production') {
      // 예: Sentry, LogRocket, Bugsnag 등으로 전송
      logger.error('Error Report:', { error: errorReport instanceof Error ? errorReport.message : String(errorReport) })
    }
  }

  private getCurrentUserId(): string | null {
    try {
      // localStorage에서 사용자 정보 가져오기 (실제 구현에 맞게 수정)
      const authData = localStorage.getItem('meetpin_auth')
      if (authData) {
        const parsed = JSON.parse(authData)
        return parsed.user?.id || null
      }
    } catch {
      // 무시
    }
    return null
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: this.generateErrorId(),
    })

    toast.success('페이지를 다시 로드합니다', { icon: '🔄' })
  }

  private handleReload = () => {
    window.location.reload()
  }

  private handleGoHome = () => {
    window.location.href = '/'
  }

  private getErrorCategory(error: Error): string {
    const message = error.message.toLowerCase()
    const stack = error.stack?.toLowerCase() || ''

    if (message.includes('chunk') || message.includes('loading') || stack.includes('chunk')) {
      return 'LOADING_ERROR'
    }

    if (message.includes('network') || message.includes('fetch')) {
      return 'NETWORK_ERROR'
    }

    if (message.includes('permission') || message.includes('auth')) {
      return 'AUTH_ERROR'
    }

    if (stack.includes('react') || stack.includes('hook')) {
      return 'REACT_ERROR'
    }

    return 'UNKNOWN_ERROR'
  }

  private getErrorSolution(category: string): string {
    switch (category) {
      case 'LOADING_ERROR':
        return '페이지 새로고침으로 해결될 수 있습니다'
      case 'NETWORK_ERROR':
        return '인터넷 연결을 확인해주세요'
      case 'AUTH_ERROR':
        return '다시 로그인해주세요'
      case 'REACT_ERROR':
        return '페이지를 새로고침하거나 처음부터 다시 시도해주세요'
      default:
        return '문제가 지속되면 고객센터에 문의해주세요'
    }
  }

  render() {
    if (this.state.hasError) {
      // 커스텀 fallback이 제공된 경우
      if (this.props.fallback) {
        return this.props.fallback
      }

      const error = this.state.error!
      const errorCategory = this.getErrorCategory(error)
      const solution = this.getErrorSolution(errorCategory)

      return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-red-50 via-orange-50 to-yellow-50 p-4 dark:from-red-950 dark:via-orange-950 dark:to-yellow-950">
          <Card className="mx-auto max-w-2xl border-red-200/50 bg-white/95 shadow-2xl backdrop-blur-lg dark:border-red-800/50 dark:bg-slate-900/95">
            <CardContent className="pt-12 pb-12">
              <div className="space-y-6 text-center">
                {/* 에러 아이콘 */}
                <div className="relative">
                  <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-red-500 to-orange-500 shadow-2xl">
                    <AlertTriangle className="h-12 w-12 text-white" />
                  </div>
                  <div className="absolute -top-2 -right-2 flex h-8 w-8 animate-pulse items-center justify-center rounded-full bg-yellow-400">
                    <Bug className="h-4 w-4 text-yellow-900" />
                  </div>
                </div>

                {/* 에러 메시지 */}
                <div className="space-y-4">
                  <h1 className="text-3xl font-black text-gray-900 dark:text-white">
                    앗! 예기치 못한 문제가 발생했어요
                  </h1>
                  <p className="mx-auto max-w-md text-lg leading-relaxed text-gray-600 dark:text-gray-300">
                    {solution}
                  </p>
                </div>

                {/* 에러 상세 정보 (개발 모드에서만) */}
                {process.env.NODE_ENV === 'development' && (
                  <details className="mx-auto mt-6 max-w-lg rounded-xl bg-gray-100 p-4 text-left dark:bg-gray-800">
                    <summary className="mb-2 cursor-pointer font-medium text-gray-700 dark:text-gray-300">
                      개발자 정보 (클릭하여 펼치기)
                    </summary>
                    <div className="space-y-2 font-mono text-sm">
                      <div>
                        <strong>에러 ID:</strong> {this.state.errorId}
                      </div>
                      <div>
                        <strong>카테고리:</strong> {errorCategory}
                      </div>
                      <div>
                        <strong>메시지:</strong> {error.message}
                      </div>
                      {error.stack && (
                        <div>
                          <strong>스택:</strong>
                          <pre className="mt-1 max-h-32 overflow-auto rounded bg-gray-200 p-2 text-xs dark:bg-gray-700">
                            {error.stack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}

                {/* 액션 버튼들 */}
                <div className="flex flex-col justify-center gap-4 pt-6 sm:flex-row">
                  <Button
                    onClick={this.handleRetry}
                    className="from-primary hover:from-primary/90 bg-gradient-to-r to-emerald-600 text-white shadow-xl transition-all duration-200 hover:scale-105 hover:to-emerald-600/90 hover:shadow-2xl"
                    size="lg"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    다시 시도
                  </Button>

                  <Button
                    onClick={this.handleReload}
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <RefreshCw className="mr-2 h-5 w-5" />
                    페이지 새로고침
                  </Button>

                  <Button
                    onClick={this.handleGoHome}
                    variant="outline"
                    size="lg"
                    className="border-2 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <Home className="mr-2 h-5 w-5" />
                    홈으로 가기
                  </Button>
                </div>

                {/* 추가 도움말 */}
                <div className="border-t border-gray-200 pt-6 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    문제가 계속 발생하면{' '}
                    <button
                      onClick={() => toast('곧 고객센터 기능이 추가됩니다', { icon: '📞' })}
                      className="text-primary font-medium hover:underline"
                    >
                      고객센터
                    </button>
                    로 문의해주세요
                  </p>
                  <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                    에러 ID: {this.state.errorId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )
    }

    return this.props.children
  }
}

export default GlobalErrorBoundary
