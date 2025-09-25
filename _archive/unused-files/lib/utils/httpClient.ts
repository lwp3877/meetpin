/* src/lib/utils/httpClient.ts */

import toast from 'react-hot-toast'

export interface RequestConfig {
  timeout?: number
  retries?: number
  retryDelay?: number
  showErrorToast?: boolean
  showLoadingToast?: boolean
  abortController?: AbortController
}

export interface ApiResponse<T = any> {
  ok: boolean
  data?: T
  code?: string
  message?: string
}

/**
 * 강화된 HTTP 클라이언트
 * 실제 사용자 테스트에서 발생할 수 있는 모든 네트워크 상황을 처리
 */
export class HttpClient {
  private static defaultConfig: RequestConfig = {
    timeout: 15000,
    retries: 3,
    retryDelay: 1000,
    showErrorToast: true,
    showLoadingToast: false,
  }

  /**
   * 재시도 가능한 에러인지 확인
   */
  private static isRetryableError(error: any): boolean {
    // 네트워크 에러
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return true
    }

    // 타임아웃 에러
    if (error.name === 'AbortError') {
      return true
    }

    // 5xx 서버 에러
    if (error.status >= 500) {
      return true
    }

    // 일시적인 네트워크 문제
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      return true
    }

    return false
  }

  /**
   * 사용자 친화적인 에러 메시지 생성
   */
  private static getUserFriendlyErrorMessage(error: any, response?: Response): string {
    // AbortError (타임아웃)
    if (error.name === 'AbortError') {
      return '요청 시간이 초과되었습니다. 인터넷 연결을 확인해주세요'
    }

    // 네트워크 에러
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      return '네트워크 연결을 확인해주세요. Wi-Fi 또는 모바일 데이터를 확인하세요'
    }

    // HTTP 상태 코드별 메시지
    if (response) {
      switch (response.status) {
        case 400:
          return '잘못된 요청입니다'
        case 401:
          return '로그인이 필요합니다'
        case 403:
          return '접근 권한이 없습니다'
        case 404:
          return '요청한 정보를 찾을 수 없습니다'
        case 409:
          return '중복된 요청입니다'
        case 429:
          return '요청이 너무 많습니다. 잠시 후 다시 시도해주세요'
        case 500:
          return '서버에 일시적인 문제가 발생했습니다'
        case 502:
          return '서버 연결에 문제가 있습니다'
        case 503:
          return '서비스가 일시적으로 사용할 수 없습니다'
        case 504:
          return '서버 응답 시간이 초과되었습니다'
        default:
          return '알 수 없는 오류가 발생했습니다'
      }
    }

    return error.message || '요청 처리 중 오류가 발생했습니다'
  }

  /**
   * 지연 시간을 두고 재시도
   */
  private static async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  /**
   * 강화된 fetch 요청
   */
  private static async performRequest<T>(
    url: string,
    options: RequestInit,
    config: RequestConfig
  ): Promise<ApiResponse<T>> {
    const { timeout, retries, retryDelay, showErrorToast, showLoadingToast } = {
      ...this.defaultConfig,
      ...config,
    }

    let lastError: any
    let loadingToastId: string | undefined

    // 로딩 토스트 표시
    if (showLoadingToast) {
      loadingToastId = toast.loading('처리 중...', { duration: timeout })
    }

    for (let attempt = 0; attempt <= retries!; attempt++) {
      try {
        // AbortController 설정
        const controller = config.abortController || new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), timeout)

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        // 로딩 토스트 제거
        if (loadingToastId) {
          toast.dismiss(loadingToastId)
          loadingToastId = undefined
        }

        // HTTP 에러 상태 확인
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          const error = new Error(
            errorData.message || this.getUserFriendlyErrorMessage(null, response)
          )
          ;(error as any).status = response.status
          ;(error as any).code = errorData.code
          throw error
        }

        const result = await response.json()
        return result as ApiResponse<T>
      } catch (error: any) {
        lastError = error

        // 마지막 시도가 아니고 재시도 가능한 에러인 경우
        if (attempt < retries! && this.isRetryableError(error)) {
          await this.delay(retryDelay! * Math.pow(2, attempt)) // 지수 백오프
          continue
        }

        break
      }
    }

    // 로딩 토스트 제거
    if (loadingToastId) {
      toast.dismiss(loadingToastId)
    }

    // 에러 토스트 표시
    if (showErrorToast) {
      const errorMessage = this.getUserFriendlyErrorMessage(lastError)
      toast.error(errorMessage)
    }

    throw lastError
  }

  /**
   * GET 요청
   */
  static async get<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      config
    )
  }

  /**
   * POST 요청
   */
  static async post<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  /**
   * PUT 요청
   */
  static async put<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  /**
   * PATCH 요청
   */
  static async patch<T>(
    url: string,
    data?: any,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      },
      config
    )
  }

  /**
   * DELETE 요청
   */
  static async delete<T>(url: string, config: RequestConfig = {}): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      },
      config
    )
  }

  /**
   * 파일 업로드
   */
  static async upload<T>(
    url: string,
    formData: FormData,
    config: RequestConfig = {}
  ): Promise<ApiResponse<T>> {
    return this.performRequest<T>(
      url,
      {
        method: 'POST',
        body: formData, // FormData는 Content-Type을 자동으로 설정
      },
      config
    )
  }

  /**
   * 배치 요청 (여러 요청을 동시에 실행)
   */
  static async batch<T>(
    requests: Array<() => Promise<ApiResponse<T>>>,
    config: {
      failFast?: boolean // 하나라도 실패하면 전체 실패
      maxConcurrency?: number // 최대 동시 실행 수
    } = {}
  ): Promise<Array<ApiResponse<T> | Error>> {
    const { failFast = false, maxConcurrency = 5 } = config

    if (failFast) {
      return Promise.all(requests.map(req => req()))
    } else {
      // 동시 실행 수 제한
      const results: Array<ApiResponse<T> | Error> = []

      for (let i = 0; i < requests.length; i += maxConcurrency) {
        const batch = requests.slice(i, i + maxConcurrency)
        const batchResults = await Promise.allSettled(batch.map(req => req()))

        results.push(
          ...batchResults.map(result =>
            result.status === 'fulfilled' ? result.value : result.reason
          )
        )
      }

      return results
    }
  }
}

export default HttpClient
