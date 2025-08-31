/* src/lib/mockData.ts */
// 개발용 Mock 데이터 - Supabase 설정 전까지 임시 사용
// 주의: 이 파일은 개발 모드에서만 사용되며, 프로덕션 빌드에서는 사용되지 않습니다.
// useAuth.tsx에서 isDevelopmentMode 조건으로 사용됩니다.

export const mockUser = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@meetpin.com',
  nickname: '관리자',
  role: 'admin',
  age_range: '30s_early',
  created_at: new Date().toISOString(),
}

export const mockUsers = [
  {
    uid: '550e8400-e29b-41d4-a716-446655440001',
    nickname: '김철수',
    age_range: '20s_late',
    role: 'user',
    created_at: '2024-01-15T10:00:00Z',
  },
  {
    uid: '550e8400-e29b-41d4-a716-446655440002', 
    nickname: '이영희',
    age_range: '30s_early',
    role: 'user',
    created_at: '2024-01-20T14:30:00Z',
  },
  {
    uid: '550e8400-e29b-41d4-a716-446655440003',
    nickname: '박민수',
    age_range: '20s_early', 
    role: 'admin',
    created_at: '2024-02-01T09:15:00Z',
  },
  {
    uid: '550e8400-e29b-41d4-a716-446655440004',
    nickname: '최지은',
    age_range: '30s_late',
    role: 'user',
    created_at: '2024-02-10T16:45:00Z',
  },
  {
    uid: '550e8400-e29b-41d4-a716-446655440005',
    nickname: '정수현',
    age_range: '40s',
    role: 'user',
    created_at: '2024-02-15T11:20:00Z',
  },
]

export const mockRooms = [
  // 강남 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440010',
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
    id: '550e8400-e29b-41d4-a716-446655440011', 
    title: '강남 와인바 투어 🍷',
    category: 'drink' as const,
    lat: 37.5632,
    lng: 126.9796,
    place_text: '신논현역 와인바',
    start_at: '2024-03-01T20:00:00Z',
    max_people: 6,
    fee: 35000,
    boost_until: '2024-03-01T12:00:00Z',
    profiles: {
      nickname: '최소영',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  
  // 홍대 지역  
  {
    id: '550e8400-e29b-41d4-a716-446655440012',
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
    id: '550e8400-e29b-41d4-a716-446655440013',
    title: '홍대 포차 투어 🍻',
    category: 'drink' as const,
    lat: 37.5580,
    lng: 126.9256,
    place_text: '홍대 연남동 포차거리',
    start_at: '2024-03-02T18:30:00Z',
    max_people: 5,
    fee: 20000,
    boost_until: null,
    profiles: {
      nickname: '박대호',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  
  // 한강 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440014',
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
  {
    id: '550e8400-e29b-41d4-a716-446655440015',
    title: '한강 피크닉 🧺',
    category: 'other' as const,
    lat: 37.5311,
    lng: 126.9889,
    place_text: '반포한강공원 잔디밭',
    start_at: '2024-03-03T14:00:00Z',
    max_people: 8,
    fee: 10000,
    boost_until: null,
    profiles: {
      nickname: '김지은',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440016',
    title: '뚝섬 자전거 라이딩 🚴‍♂️',
    category: 'exercise' as const,
    lat: 37.5312,
    lng: 127.0549,
    place_text: '뚝섬한강공원',
    start_at: '2024-03-03T16:00:00Z',
    max_people: 4,
    fee: 5000,
    boost_until: null,
    profiles: {
      nickname: '이준호',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  
  // 이태원/용산 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440017',
    title: '이태원 맛집 투어 🍽️',
    category: 'other' as const,
    lat: 37.5345,
    lng: 126.9944,
    place_text: '이태원역 맛집거리',
    start_at: '2024-03-04T12:00:00Z',
    max_people: 6,
    fee: 30000,
    boost_until: '2024-03-03T18:00:00Z',
    profiles: {
      nickname: '정미영',
      avatar_url: null,
      age_range: '30s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440018',
    title: '용산 국립중앙박물관 관람 🏛️',
    category: 'other' as const,
    lat: 37.5240,
    lng: 126.9802,
    place_text: '국립중앙박물관',
    start_at: '2024-03-04T10:00:00Z',
    max_people: 4,
    fee: 0,
    boost_until: null,
    profiles: {
      nickname: '문화애호가',
      avatar_url: null,
      age_range: '40s',
    }
  },
  
  // 성수/건대 지역  
  {
    id: '550e8400-e29b-41d4-a716-446655440019',
    title: '성수동 카페 투어 ☕',
    category: 'other' as const,
    lat: 37.5447,
    lng: 127.0557,
    place_text: '성수동 카페거리',
    start_at: '2024-03-05T15:00:00Z',
    max_people: 5,
    fee: 25000,
    boost_until: null,
    profiles: {
      nickname: '카페마니아',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440020',
    title: '건대 볼링 모임 🎳',
    category: 'exercise' as const,
    lat: 37.5401,
    lng: 127.0695,
    place_text: '건대입구역 볼링장',
    start_at: '2024-03-05T19:00:00Z',
    max_people: 6,
    fee: 15000,
    boost_until: null,
    profiles: {
      nickname: '스트라이크킹',
      avatar_url: null,
      age_range: '20s_early',
    }
  },
  
  // 잠실/송파 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440021',
    title: '잠실 롯데월드 놀이공원 🎢',
    category: 'other' as const,
    lat: 37.5118,
    lng: 127.0982,
    place_text: '잠실 롯데월드',
    start_at: '2024-03-06T11:00:00Z',
    max_people: 8,
    fee: 45000,
    boost_until: '2024-03-05T12:00:00Z',
    profiles: {
      nickname: '어드벤처러버',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440022',
    title: '석촌호수 산책 🌸',
    category: 'exercise' as const,
    lat: 37.5061,
    lng: 127.1027,
    place_text: '석촌호수공원',
    start_at: '2024-03-06T17:00:00Z',
    max_people: 4,
    fee: 0,
    boost_until: null,
    profiles: {
      nickname: '산책러버',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  
  // 신촌/마포 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440023',
    title: '신촌 노래방 파티 🎤',
    category: 'other' as const,
    lat: 37.5596,
    lng: 126.9425,
    place_text: '신촌역 노래방',
    start_at: '2024-03-07T20:00:00Z',
    max_people: 6,
    fee: 12000,
    boost_until: null,
    profiles: {
      nickname: '노래왕',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440024',
    title: '상암 월드컵공원 축구 ⚽',
    category: 'exercise' as const,
    lat: 37.5659,
    lng: 126.8997,
    place_text: '상암 월드컵공원',
    start_at: '2024-03-07T14:00:00Z',
    max_people: 10,
    fee: 5000,
    boost_until: null,
    profiles: {
      nickname: '축구광',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  
  // 명동/중구 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440025',
    title: '명동 쇼핑 & 맛집 투어 🛍️',
    category: 'other' as const,
    lat: 37.5636,
    lng: 126.9856,
    place_text: '명동 쇼핑거리',
    start_at: '2024-03-08T13:00:00Z',
    max_people: 5,
    fee: 20000,
    boost_until: '2024-03-07T20:00:00Z',
    profiles: {
      nickname: '쇼핑퀸',
      avatar_url: null,
      age_range: '30s_late',
    }
  },
  
  // 동대문/종로 지역
  {
    id: '550e8400-e29b-41d4-a716-446655440026',
    title: '경복궁 야간 개장 관람 🏯',
    category: 'other' as const,
    lat: 37.5788,
    lng: 126.9770,
    place_text: '경복궁',
    start_at: '2024-03-08T19:00:00Z',
    max_people: 8,
    fee: 8000,
    boost_until: null,
    profiles: {
      nickname: '역사탐험가',
      avatar_url: null,
      age_range: '40s',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440027',
    title: '동대문 새벽 시장 투어 🌙',
    category: 'other' as const,
    lat: 37.5662,
    lng: 127.0074,
    place_text: '동대문 종합시장',
    start_at: '2024-03-09T04:00:00Z',
    max_people: 4,
    fee: 15000,
    boost_until: null,
    profiles: {
      nickname: '야행성인간',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  
  // 강남 추가 모임
  {
    id: '550e8400-e29b-41d4-a716-446655440028',
    title: '강남역 치킨&맥주 🍗',
    category: 'drink' as const,
    lat: 37.4979,
    lng: 127.0276,
    place_text: '강남역 치킨집',
    start_at: '2024-03-10T18:00:00Z',
    max_people: 6,
    fee: 25000,
    boost_until: null,
    profiles: {
      nickname: '치킨러버',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440029',
    title: '선릉 헬스장 PT 모집 💪',
    category: 'exercise' as const,
    lat: 37.5045,
    lng: 127.0493,
    place_text: '선릉역 헬스장',
    start_at: '2024-03-10T19:00:00Z',
    max_people: 4,
    fee: 30000,
    boost_until: '2024-03-09T15:00:00Z',
    profiles: {
      nickname: '헬스트레이너',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440030',
    title: '논현동 와인 시음회 🍷',
    category: 'drink' as const,
    lat: 37.5110,
    lng: 127.0268,
    place_text: '논현역 와인바',
    start_at: '2024-03-11T20:00:00Z',
    max_people: 8,
    fee: 40000,
    boost_until: null,
    profiles: {
      nickname: '와인소믈리에',
      avatar_url: null,
      age_range: '30s_late',
    }
  },

  // 홍대 추가 모임
  {
    id: '550e8400-e29b-41d4-a716-446655440031',
    title: '홍대 버스킹 관람 🎵',
    category: 'other' as const,
    lat: 37.5571,
    lng: 126.9240,
    place_text: '홍대 걷고싶은거리',
    start_at: '2024-03-11T19:00:00Z',
    max_people: 6,
    fee: 0,
    boost_until: null,
    profiles: {
      nickname: '음악애호가',
      avatar_url: null,
      age_range: '20s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440032',
    title: '합정 보드게임 카페 🎲',
    category: 'other' as const,
    lat: 37.5495,
    lng: 126.9131,
    place_text: '합정역 보드게임카페',
    start_at: '2024-03-12T14:00:00Z',
    max_people: 6,
    fee: 15000,
    boost_until: null,
    profiles: {
      nickname: '보드게임마니아',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440033',
    title: '상수역 맛집 탐방 🍜',
    category: 'other' as const,
    lat: 37.5473,
    lng: 126.9222,
    place_text: '상수역 맛집거리',
    start_at: '2024-03-12T12:00:00Z',
    max_people: 5,
    fee: 20000,
    boost_until: '2024-03-11T10:00:00Z',
    profiles: {
      nickname: '맛집헌터',
      avatar_url: null,
      age_range: '30s_early',
    }
  },

  // 강북 지역 추가
  {
    id: '550e8400-e29b-41d4-a716-446655440034',
    title: '수유리 등산 모임 🏔️',
    category: 'exercise' as const,
    lat: 37.6369,
    lng: 127.0255,
    place_text: '수유역 도봉산 입구',
    start_at: '2024-03-13T06:00:00Z',
    max_people: 8,
    fee: 0,
    boost_until: null,
    profiles: {
      nickname: '등산대장',
      avatar_url: null,
      age_range: '40s',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440035',
    title: '미아 전통시장 투어 🏪',
    category: 'other' as const,
    lat: 37.6131,
    lng: 127.0298,
    place_text: '미아역 전통시장',
    start_at: '2024-03-13T15:00:00Z',
    max_people: 6,
    fee: 10000,
    boost_until: null,
    profiles: {
      nickname: '전통시장애호가',
      avatar_url: null,
      age_range: '30s_late',
    }
  },

  // 강서 지역 추가  
  {
    id: '550e8400-e29b-41d4-a716-446655440036',
    title: '여의도 한강 라이딩 🚴',
    category: 'exercise' as const,
    lat: 37.5219,
    lng: 126.9245,
    place_text: '여의도한강공원',
    start_at: '2024-03-14T16:00:00Z',
    max_people: 10,
    fee: 5000,
    boost_until: '2024-03-13T20:00:00Z',
    profiles: {
      nickname: '자전거매니아',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440037',
    title: '김포공항 야경 투어 ✈️',
    category: 'other' as const,
    lat: 37.5583,
    lng: 126.7906,
    place_text: '김포공항 전망대',
    start_at: '2024-03-14T19:00:00Z',
    max_people: 4,
    fee: 8000,
    boost_until: null,
    profiles: {
      nickname: '야경사진가',
      avatar_url: null,
      age_range: '20s_late',
    }
  },

  // 송파 추가 모임
  {
    id: '550e8400-e29b-41d4-a716-446655440038',
    title: '잠실 야구 관람 ⚾',
    category: 'other' as const,
    lat: 37.5122,
    lng: 127.0719,
    place_text: '잠실종합운동장',
    start_at: '2024-03-15T18:00:00Z',
    max_people: 6,
    fee: 25000,
    boost_until: '2024-03-14T12:00:00Z',
    profiles: {
      nickname: '야구팬',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440039',
    title: '방이동 카페거리 투어 ☕',
    category: 'other' as const,
    lat: 37.5145,
    lng: 127.1261,
    place_text: '방이동 카페거리',
    start_at: '2024-03-15T14:00:00Z',
    max_people: 4,
    fee: 18000,
    boost_until: null,
    profiles: {
      nickname: '카페투어리스트',
      avatar_url: null,
      age_range: '20s_late',
    }
  },

  // 성동 지역 추가
  {
    id: '550e8400-e29b-41d4-a716-446655440040',
    title: '왕십리 BBQ 파티 🥩',
    category: 'drink' as const,
    lat: 37.5615,
    lng: 127.0371,
    place_text: '왕십리역 고기집',
    start_at: '2024-03-16T18:30:00Z',
    max_people: 8,
    fee: 30000,
    boost_until: null,
    profiles: {
      nickname: '고기마니아',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440041',
    title: '성수 수제맥주 투어 🍺',
    category: 'drink' as const,
    lat: 37.5446,
    lng: 127.0555,
    place_text: '성수동 브루어리',
    start_at: '2024-03-16T19:00:00Z',
    max_people: 6,
    fee: 25000,
    boost_until: '2024-03-15T16:00:00Z',
    profiles: {
      nickname: '맥주브루어',
      avatar_url: null,
      age_range: '30s_late',
    }
  },

  // 마포 추가 모임
  {
    id: '550e8400-e29b-41d4-a716-446655440042',
    title: '마포구청 배드민턴 🏸',
    category: 'exercise' as const,
    lat: 37.5639,
    lng: 126.9083,
    place_text: '마포구민체육센터',
    start_at: '2024-03-17T10:00:00Z',
    max_people: 8,
    fee: 10000,
    boost_until: null,
    profiles: {
      nickname: '배드민턴동호회',
      avatar_url: null,
      age_range: '30s_early',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440043',
    title: '공덕 직장인 모임 💼',
    category: 'other' as const,
    lat: 37.5443,
    lng: 126.9516,
    place_text: '공덕역 근처 카페',
    start_at: '2024-03-17T19:00:00Z',
    max_people: 6,
    fee: 15000,
    boost_until: null,
    profiles: {
      nickname: '직장인모임리더',
      avatar_url: null,
      age_range: '30s_early',
    }
  },

  // 용산 추가 모임
  {
    id: '550e8400-e29b-41d4-a716-446655440044',
    title: '용산역 전자상가 투어 💻',
    category: 'other' as const,
    lat: 37.5299,
    lng: 126.9645,
    place_text: '용산전자상가',
    start_at: '2024-03-18T15:00:00Z',
    max_people: 4,
    fee: 5000,
    boost_until: null,
    profiles: {
      nickname: 'IT매니아',
      avatar_url: null,
      age_range: '20s_late',
    }
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440045',
    title: '한남동 갤러리 투어 🎨',
    category: 'other' as const,
    lat: 37.5307,
    lng: 127.0028,
    place_text: '한남동 갤러리 거리',
    start_at: '2024-03-18T13:00:00Z',
    max_people: 6,
    fee: 12000,
    boost_until: '2024-03-17T09:00:00Z',
    profiles: {
      nickname: '아트러버',
      avatar_url: null,
      age_range: '30s_late',
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
      id: `550e8400-e29b-41d4-a716-${Date.now().toString().slice(-12).padStart(12, '0')}`,
      email,
      nickname,
      age_range: ageRange,
      role: 'user',
    }
  }
}

export const isDevelopmentMode = process.env.NODE_ENV !== 'production'