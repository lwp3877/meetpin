/* src/lib/mockData.ts */
// 개발용 Mock 데이터 - Supabase 설정 전까지 임시 사용
// 주의: 이 파일은 개발 모드에서만 사용되며, 프로덕션 빌드에서는 사용되지 않습니다.
// useAuth.tsx에서 isDevelopmentMode 조건으로 사용됩니다.

export const mockUser = {
  id: 'mock-user-123',
  email: 'admin@meetpin.com',
  nickname: '관리자',
  role: 'admin',
  age_range: '30s_early',
  created_at: new Date().toISOString(),
}

export const mockUsers = [
  {
    uid: 'user-1',
    nickname: '김철수',
    age_range: '20s_late',
    role: 'user',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    uid: 'user-2', 
    nickname: '이영희',
    age_range: '30s_early',
    role: 'user',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    uid: 'user-3',
    nickname: '박민수',
    age_range: '20s_early', 
    role: 'admin',
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    uid: 'user-4',
    nickname: '최지은',
    age_range: '30s_late',
    role: 'user',
    created_at: '2024-02-10T16:45:00Z',
  },
  {
    uid: 'user-5',
    nickname: '정수현',
    age_range: '40s',
    role: 'user',
    created_at: '2024-02-15T11:20:00Z',
  },
]

export const mockRooms = [
  {
    id: 'room-1',
    title: '강남에서 맥주 한 잔 🍺',
    category: 'drink' as const,
    lat: 37.5665,
    lng: 126.978,
    place_text: '강남역 근처 호프집',
    start_at: '2024-03-01T19:00:00Z',
    max_people: 4,
    fee: 15000,
    boost_until: null,
    profiles: {
      nickname: '김철수',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: 'room-2', 
    title: '홍대 클럽 파티 💃',
    category: 'other' as const,
    lat: 37.5563,
    lng: 126.9251,
    place_text: '홍대입구역 클럽거리',
    start_at: '2024-03-02T21:00:00Z',
    max_people: 8,
    fee: 25000,
    boost_until: '2024-03-01T12:00:00Z',
    profiles: {
      nickname: '이영희',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: 'room-3',
    title: '한강 러닝 🏃‍♀️',
    category: 'exercise' as const,
    lat: 37.5326,
    lng: 126.9906,
    place_text: '반포한강공원',
    start_at: '2024-03-03T07:00:00Z', 
    max_people: 6,
    fee: 0,
    boost_until: null,
    profiles: {
      nickname: '박민수',
      avatar_url: null,
      age_range: '20s_early',
    }
  },
]

export const mockReports = [
  {
    id: 'report-1',
    reason: '부적절한 언어 사용',
    status: 'pending',
    created_at: '2024-02-28T15:30:00Z',
    reporter_profile: { nickname: '김철수' },
    target_profile: { nickname: '문제사용자' },
    rooms: { title: '강남 모임' },
  },
  {
    id: 'report-2',
    reason: '약속 시간 미준수',
    status: 'reviewed', 
    created_at: '2024-02-27T10:15:00Z',
    reporter_profile: { nickname: '이영희' },
    target_profile: { nickname: '지각대장' },
    rooms: { title: '홍대 파티' },
  },
  {
    id: 'report-3',
    reason: '사기 의심',
    status: 'resolved',
    created_at: '2024-02-26T14:45:00Z', 
    reporter_profile: { nickname: '박민수' },
    target_profile: { nickname: '사기꾼' },
    rooms: null,
  },
]

export const mockStats = {
  totalUsers: 1247,
  totalRooms: 342,
  totalMatches: 156,
  totalReports: 23,
  pendingReports: 5,
  activeRooms: 89,
}

// Mock 인증 함수
export const mockLogin = async (email: string, password: string) => {
  // 개발용 간단 인증
  if (email === 'admin@meetpin.com' && password === '123456') {
    return { success: true, user: mockUser }
  }
  if (email === 'test@test.com' && password === '123456') {
    return { success: true, user: { ...mockUser, role: 'user', nickname: '테스트유저' } }
  }
  throw new Error('이메일 또는 비밀번호가 올바르지 않습니다')
}

// Mock 회원가입 함수
export const mockSignUp = async (email: string, password: string, nickname: string, ageRange: string) => {
  // 개발용 간단 검증
  if (!email || !password || !nickname || !ageRange) {
    throw new Error('모든 필드를 입력해주세요')
  }
  if (password.length < 6) {
    throw new Error('비밀번호는 6자 이상이어야 합니다')
  }
  
  return { 
    success: true, 
    message: '회원가입이 완료되었습니다. 로그인해주세요.',
    user: {
      id: `mock-${Date.now()}`,
      email,
      nickname,
      age_range: ageRange,
      role: 'user',
    }
  }
}

export const isDevelopmentMode = process.env.NODE_ENV === 'development'