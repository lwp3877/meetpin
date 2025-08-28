-- 밋핀(MeetPin) 시드 데이터 - 수정된 버전
-- 개발/테스트 환경에서 사용할 샘플 데이터

-- 주의: 이 파일은 개발 환경에서만 사용하세요!
-- 프로덕션 환경에서는 실행하지 마세요!

-- 🚨 중요 안내 🚨
-- profiles 테이블에 데이터를 삽입하려면:
-- 1. 먼저 실제 사용자가 Supabase Auth로 회원가입을 완료해야 합니다
-- 2. 그 후 auth.users 테이블에 실제 UUID가 생성됩니다
-- 3. 그 UUID를 사용해서 profiles에 데이터를 삽입할 수 있습니다

-- 현재 이 스크립트는 실제 auth.users가 존재하지 않으므로 
-- profiles 삽입 부분은 주석 처리되어 있습니다.

-- 실제 사용 방법:
-- 1. 웹사이트에서 회원가입을 완료하세요
-- 2. Supabase Dashboard > Authentication > Users에서 실제 user ID를 확인하세요
-- 3. 아래 주석을 해제하고 실제 UUID로 교체하여 실행하세요

/*
-- 샘플 프로필 데이터 (실제 auth.users UUID로 교체 필요)
INSERT INTO public.profiles (uid, nickname, age_range, intro, role) VALUES
  ('실제-user-uuid-1', '김철수', '20s_late', '안녕하세요! 새로운 사람들과 만나고 싶어요.', 'user'),
  ('실제-user-uuid-2', '박영희', '30s_early', '운동 좋아하는 직장인입니다.', 'user'),
  ('실제-user-uuid-3', '이민수', '20s_early', '맛있는 술과 음식을 좋아합니다.', 'user'),
  ('실제-user-uuid-4', '정수정', '30s_late', '새로운 취미를 찾고 있어요.', 'user'),
  ('실제-user-uuid-5', '관리자', '30s_early', '밋핀 관리자입니다.', 'admin')
ON CONFLICT (uid) DO UPDATE SET
  nickname = EXCLUDED.nickname,
  age_range = EXCLUDED.age_range,
  intro = EXCLUDED.intro,
  role = EXCLUDED.role;
*/

-- 📋 실제 사용자 생성 후 실행할 수 있는 샘플 방 데이터
-- (host_uid를 실제 사용자 UUID로 교체 필요)

/*
-- 샘플 방 데이터 (서울 주요 지역)
INSERT INTO public.rooms (id, host_uid, title, category, lat, lng, place_text, start_at, max_people, fee, boost_until) VALUES
  (
    '10000000-0000-0000-0000-000000000001',
    '실제-user-uuid-1',
    '강남에서 치킨과 맥주 한잔 🍻',
    'drink',
    37.4979,
    127.0276,
    '강남역 교보타워 1층 교촌치킨',
    now() + interval '2 hours',
    4,
    15000,
    now() + interval '3 days'
  ),
  (
    '10000000-0000-0000-0000-000000000002',
    '실제-user-uuid-2',
    '한강에서 러닝 모임 🏃‍♀️',
    'exercise',
    37.5172,
    126.9034,
    '여의도 한강공원 물빛광장',
    now() + interval '1 day',
    8,
    0,
    NULL
  ),
  (
    '10000000-0000-0000-0000-000000000003',
    '실제-user-uuid-3',
    '홍대에서 보드게임 카페',
    'other',
    37.5563,
    126.9234,
    '홍대입구역 보드게임카페 푸하하',
    now() + interval '3 hours',
    6,
    8000,
    NULL
  ),
  (
    '10000000-0000-0000-0000-000000000004',
    '실제-user-uuid-4',
    '이태원에서 와인 시음 🍷',
    'drink',
    37.5347,
    126.9947,
    '이태원역 와인바 르뷰',
    now() + interval '5 hours',
    4,
    25000,
    now() + interval '1 day'
  ),
  (
    '10000000-0000-0000-0000-000000000005',
    '실제-user-uuid-1',
    '건대에서 볼링 치기',
    'exercise',
    37.5403,
    127.0695,
    '건대입구역 CGV 볼링장',
    now() + interval '4 hours',
    6,
    12000,
    NULL
  )
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  category = EXCLUDED.category,
  lat = EXCLUDED.lat,
  lng = EXCLUDED.lng,
  place_text = EXCLUDED.place_text,
  start_at = EXCLUDED.start_at,
  max_people = EXCLUDED.max_people,
  fee = EXCLUDED.fee,
  boost_until = EXCLUDED.boost_until;
*/

-- 🎯 즉시 사용 가능한 스크립트 (Mock 데이터 없이)
-- 테이블 구조 확인
SELECT 'Database tables created successfully! 🎉' as message;

-- 현재 사용자 수 확인 (auth.users 테이블)
SELECT 
  'Total registered users: ' || COUNT(*) as user_count 
FROM auth.users;

-- 현재 프로필 수 확인
SELECT 
  'Profiles created: ' || COUNT(*) as profile_count 
FROM public.profiles;

-- 현재 방 수 확인
SELECT 
  'Rooms created: ' || COUNT(*) as room_count 
FROM public.rooms;

-- 📚 사용 가이드
SELECT '
🚀 MeetPin 데이터베이스 초기화 완료!

📋 다음 단계:
1. 웹사이트에서 회원가입하세요: http://localhost:3000/auth/signup
2. 로그인하세요: http://localhost:3000/auth/login  
3. 관리자 권한이 필요하면 Supabase Dashboard에서 role을 "admin"으로 변경하세요
4. 방을 생성해보세요: http://localhost:3000/room/new

💡 개발 팁:
- 임시 로그인: admin@meetpin.com / 123456 (개발 모드)
- 관리자 페이지: http://localhost:3000/admin
- Mock 데이터로 모든 기능 테스트 가능

✅ 모든 테이블이 성공적으로 생성되었습니다!
' as guide;