/* __tests__/components/social-login.test.tsx */
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'
import { SocialLogin } from '@/components/social-login'
import toast from 'react-hot-toast'

// Toast 모킹
jest.mock('react-hot-toast')
const mockToast = toast as jest.Mocked<typeof toast>

// 로컬스토리지 모킹
const mockLocalStorage = {
  setItem: jest.fn(),
  getItem: jest.fn(),
  removeItem: jest.fn(),
}
Object.defineProperty(window, 'localStorage', { value: mockLocalStorage })

// 쿠키 설정 모킹
Object.defineProperty(document, 'cookie', {
  writable: true,
  value: '',
})

describe('SocialLogin 컴포넌트', () => {
  let mockOnSuccess: jest.Mock

  beforeEach(() => {
    mockOnSuccess = jest.fn()
    jest.clearAllMocks()
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

    // 성공 완료 대기
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('카카오 로그인 성공!')
    }, { timeout: 2000 })

    // localStorage에 사용자 데이터 저장 확인
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'meetpin_user',
        expect.stringContaining('kakao_')
      )
    })

    // onSuccess 콜백 호출 확인
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('구글 로그인이 성공적으로 동작한다', async () => {
    jest.clearAllMocks() // 각 테스트마다 모킹 초기화
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const googleButton = screen.getByText(/구글로 로그인하기/)
    fireEvent.click(googleButton)

    // 로딩 상태 확인
    expect(screen.getByText(/구글로 로그인 중.../)).toBeInTheDocument()

    // 성공 완료 대기 (시간 늘림)
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('구글 로그인 성공!')
    }, { timeout: 3000 })

    // localStorage에 사용자 데이터 저장 확인
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'meetpin_user',
        expect.stringContaining('google_')
      )
    }, { timeout: 1000 })

    // onSuccess 콜백 호출 확인
    expect(mockOnSuccess).toHaveBeenCalled()
  })

  test('네이버 로그인이 성공적으로 동작한다', async () => {
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const naverButton = screen.getByText(/네이버로 로그인하기/)
    fireEvent.click(naverButton)

    // 로딩 상태 확인
    expect(screen.getByText(/네이버로 로그인 중.../)).toBeInTheDocument()

    // 성공 완료 대기
    await waitFor(() => {
      expect(mockToast.success).toHaveBeenCalledWith('네이버 로그인 성공!')
    }, { timeout: 2000 })

    // localStorage에 사용자 데이터 저장 확인
    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith(
        'meetpin_user',
        expect.stringContaining('naver_')
      )
    })

    // onSuccess 콜백 호출 확인
    expect(mockOnSuccess).toHaveBeenCalled()
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

    await waitFor(() => {
      expect(mockLocalStorage.setItem).toHaveBeenCalled()
    })

    // localStorage에 저장된 데이터 검증
    const setItemCall = mockLocalStorage.setItem.mock.calls.find(call => call[0] === 'meetpin_user')
    expect(setItemCall).toBeDefined()
    
    const userData = JSON.parse(setItemCall![1])
    expect(userData).toMatchObject({
      id: expect.stringMatching(/^kakao_\d+$/),
      email: 'kakao@example.com',
      nickname: '카카오사용자',
      role: 'user',
      age_range: '20-29',
      avatar_url: undefined,
      intro: undefined,
      referral_code: undefined,
      created_at: expect.any(String),
    })
  })

  test('쿠키에 사용자 데이터가 저장된다', async () => {
    // 쿠키 설정 모킹 함수
    const originalCookie = Object.getOwnPropertyDescriptor(Document.prototype, 'cookie')
    let cookieValue = ''
    
    Object.defineProperty(document, 'cookie', {
      get: () => cookieValue,
      set: (value) => { cookieValue = value },
      configurable: true,
    })

    render(<SocialLogin onSuccess={mockOnSuccess} />)
    
    const kakaoButton = screen.getByText(/카카오로 로그인하기/)
    fireEvent.click(kakaoButton)

    await waitFor(() => {
      expect(document.cookie).toContain('meetpin_mock_user=')
    })

    // 원래 쿠키 설정 복원
    if (originalCookie) {
      Object.defineProperty(Document.prototype, 'cookie', originalCookie)
    }
  })
})

// 통합 테스트
describe('SocialLogin 통합 테스트', () => {
  test('전체 소셜 로그인 플로우가 정상 동작한다', async () => {
    const mockOnSuccess = jest.fn()
    render(<SocialLogin onSuccess={mockOnSuccess} />)

    // 1. 카카오 로그인 테스트
    fireEvent.click(screen.getByText(/카카오로 로그인하기/))
    await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('카카오 로그인 성공!'))
    
    // 2. 구글 로그인 테스트 (새 인스턴스)
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    fireEvent.click(screen.getAllByText(/구글로 로그인하기/)[0])
    await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('구글 로그인 성공!'))
    
    // 3. 네이버 로그인 테스트 (새 인스턴스)
    render(<SocialLogin onSuccess={mockOnSuccess} />)
    fireEvent.click(screen.getAllByText(/네이버로 로그인하기/)[0])
    await waitFor(() => expect(mockToast.success).toHaveBeenCalledWith('네이버 로그인 성공!'))

    // 모든 콜백이 호출되었는지 확인
    expect(mockOnSuccess).toHaveBeenCalledTimes(3)
  })
})