/* __tests__/components/social-login.test.tsx */
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialLogin } from '@/components/auth/social-login'
import toast from 'react-hot-toast'

// Toast 모킹
jest.mock('react-hot-toast')
const mockToast = toast as jest.Mocked<typeof toast>

// setTimeout 모킹으로 즉시 실행
jest.useFakeTimers()

// 로컬스토리지 모킹
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

describe('SocialLogin 컴포넌트', () => {
  let mockOnSuccess: jest.Mock

  beforeEach(() => {
    mockOnSuccess = jest.fn()
    jest.clearAllMocks()
    mockLocalStorage.setItem.mockClear()
    mockToast.success.mockClear()
    mockToast.error.mockClear()
    // 타이머 리셋
    jest.clearAllTimers()
  })

  afterEach(() => {
    cleanup()
    jest.runOnlyPendingTimers()
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  test('모든 소셜 로그인 버튼이 렌더링된다', () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    expect(screen.getByText(/카카오로 로그인하기/)).toBeInTheDocument()
    expect(screen.getByText(/구글로 로그인하기/)).toBeInTheDocument()
    expect(screen.getByText(/네이버로 로그인하기/)).toBeInTheDocument()
  })

  test('회원가입 타입으로 렌더링 시 텍스트가 변경된다', () => {
    render(<SocialLogin type="signup" onSuccess={mockOnSuccess} />)
    
    expect(screen.getByText(/카카오로 가입하기/)).toBeInTheDocument()
    expect(screen.getByText(/구글로 가입하기/)).toBeInTheDocument()
    expect(screen.getByText(/네이버로 가입하기/)).toBeInTheDocument()
  })

  test('카카오 로그인이 성공적으로 동작한다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const kakaoButton = screen.getByText(/카카오로 로그인하기/)
    fireEvent.click(kakaoButton)

    // 로딩 상태 확인
    expect(screen.getByText(/카카오로 로그인 중.../)).toBeInTheDocument()

    // 타이머 실행으로 setTimeout 완료
    jest.advanceTimersByTime(1000)

    // 성공 완료 대기
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('카카오 로그인 성공!')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    expect(mockOnSuccess).toHaveBeenCalled()

    // localStorage 저장 내용 확인
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'meetpin_user',
      expect.stringContaining('kakao_')
    )
  })

  test('구글 로그인이 성공적으로 동작한다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const googleButton = screen.getByText(/구글로 로그인하기/)
    fireEvent.click(googleButton)

    // 로딩 상태 확인
    expect(screen.getByText(/구글로 로그인 중.../)).toBeInTheDocument()

    // 타이머 실행으로 setTimeout 완료
    jest.advanceTimersByTime(1000)

    // 성공 완료 대기
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('구글 로그인 성공!')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    expect(mockOnSuccess).toHaveBeenCalled()

    // localStorage 저장 내용 확인
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'meetpin_user',
      expect.stringContaining('google_')
    )
  })

  test('네이버 로그인이 성공적으로 동작한다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const naverButton = screen.getByText(/네이버로 로그인하기/)
    fireEvent.click(naverButton)

    // 로딩 상태 확인
    expect(screen.getByText(/네이버로 로그인 중.../)).toBeInTheDocument()

    // 타이머 실행으로 setTimeout 완료
    jest.advanceTimersByTime(1000)

    // 성공 완료 대기
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('네이버 로그인 성공!')
    })

    expect(mockLocalStorage.setItem).toHaveBeenCalled()
    expect(mockOnSuccess).toHaveBeenCalled()

    // localStorage 저장 내용 확인
    expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
      'meetpin_user',
      expect.stringContaining('naver_')
    )
  })

  test('disabled 상태에서는 버튼이 비활성화된다', () => {
    render(<SocialLogin disabled={true} onSuccess={mockOnSuccess} />)
    
    const kakaoButton = screen.getByText(/카카오로 로그인하기/).closest('button')
    const googleButton = screen.getByText(/구글로 로그인하기/).closest('button')
    const naverButton = screen.getByText(/네이버로 로그인하기/).closest('button')

    expect(kakaoButton).toBeDisabled()
    expect(googleButton).toBeDisabled()
    expect(naverButton).toBeDisabled()
  })

  test('로딩 중에는 다른 버튼들이 비활성화된다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const kakaoButton = screen.getByText(/카카오로 로그인하기/).closest('button')
    const googleButton = screen.getByText(/구글로 로그인하기/).closest('button')
    const naverButton = screen.getByText(/네이버로 로그인하기/).closest('button')

    // 카카오 버튼 클릭
    fireEvent.click(kakaoButton!)

    // 모든 버튼이 비활성화되는지 확인
    expect(kakaoButton).toBeDisabled()
    expect(googleButton).toBeDisabled()
    expect(naverButton).toBeDisabled()
  })

  test('소셜 로그인 혜택 정보가 표시된다', () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    expect(screen.getByText('소셜 로그인 혜택')).toBeInTheDocument()
    expect(screen.getByText(/간편한 원클릭 로그인/)).toBeInTheDocument()
    expect(screen.getByText(/별도 비밀번호 관리 불필요/)).toBeInTheDocument()
    expect(screen.getByText(/안전한 계정 연동/)).toBeInTheDocument()
  })

  test('임시 알림 메시지가 표시된다', () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    expect(screen.getByText(/소셜 로그인이 임시로 작동합니다/)).toBeInTheDocument()
    expect(screen.getByText(/Supabase OAuth 설정 완료 후 실제 인증으로 전환됩니다/)).toBeInTheDocument()
  })

  test('생성된 사용자 데이터 구조가 올바르다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const kakaoButton = screen.getByText(/카카오로 로그인하기/)
    fireEvent.click(kakaoButton)

    // 타이머 실행으로 setTimeout 완료
    jest.advanceTimersByTime(1000)

    // 전체 로그인 프로세스 완료 대기
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
      expect(mockOnSuccess).toHaveBeenCalled()
    })

    // localStorage에 저장된 데이터 검증
    const setItemCalls = mockLocalStorage.setItem.mock.calls
    const userDataCall = setItemCalls.find(call => call[0] === 'meetpin_user')
    expect(userDataCall).toBeDefined()
    
    const userData = JSON.parse(userDataCall![1])
    expect(userData).toMatchObject({
      id: expect.stringMatching(/^kakao_\d+$/),
      email: 'kakao@example.com',
      nickname: '카카오사용자',
      role: 'user',
      age_range: '20-29',
      created_at: expect.any(String),
    })
    
    // undefined 값들은 JSON.stringify에서 제외되므로 별도 확인
    expect(userData.avatar_url).toBeUndefined()
    expect(userData.intro).toBeUndefined()
    expect(userData.referral_code).toBeUndefined()
  })

  test('각 소셜 로그인이 개별적으로 작동한다', async () => {
    // 카카오 테스트
    const { unmount: unmountKakao } = render(<SocialLogin onSuccess={mockOnSuccess} />)
    fireEvent.click(screen.getByText(/카카오로 로그인하기/))
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
    
    unmountKakao()
    jest.clearAllMocks()
    
    // 구글 테스트
    const { unmount: unmountGoogle } = render(<SocialLogin onSuccess={mockOnSuccess} />)
    fireEvent.click(screen.getByText(/구글로 로그인하기/))
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
    
    unmountGoogle()
    jest.clearAllMocks()
    
    // 네이버 테스트
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    fireEvent.click(screen.getByText(/네이버로 로그인하기/))
    jest.advanceTimersByTime(1000)
    
    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalledTimes(1)
    })
  })
})