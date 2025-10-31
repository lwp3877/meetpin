-- ===============================================
-- 프로덕션 환경에 샘플 방 추가 스크립트
-- ===============================================
--
-- 사용 방법:
-- 1. Supabase Dashboard > SQL Editor 열기
-- 2. 이 스크립트 전체를 복사하여 붙여넣기
-- 3. 실행 (Run)
--
-- 주의:
-- - 실제 사용자 계정이 필요합니다
-- - 먼저 웹사이트에서 회원가입을 완료하세요
-- - auth.users 테이블에서 실제 user ID를 확인하세요
-- ===============================================

-- 1단계: 현재 등록된 사용자 확인
SELECT id, email, created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- 위 쿼리 결과에서 user ID를 복사하여 아래에 사용하세요
-- 예: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- 2단계: 샘플 방 추가 (실제 user ID로 교체 필요)
-- 아래 '실제-user-id'를 위에서 확인한 실제 UUID로 교체하세요

/*
-- 샘플 방 10개 추가 (서울 주요 지역)
INSERT INTO public.rooms (
  id,
  host_uid,
  title,
  category,
  lat,
  lng,
  place_text,
  start_at,
  max_people,
  current_people,
  fee,
  gender_limit,
  age_limit,
  description
) VALUES
-- 1. 강남 - 술
(
  gen_random_uuid(),
  '실제-user-id',  -- 여기를 실제 UUID로 교체
  '강남에서 치맥 한잔 🍗🍺',
  'drink',
  37.4979,
  127.0276,
  '강남역 교보타워',
  now() + interval '3 hours',
  5,
  1,
  15000,
  'all',
  'all',
  '퇴근 후 가볍게 치맥 한잔해요! 편하게 와서 이야기 나눠요~'
),
-- 2. 홍대 - 술
(
  gen_random_uuid(),
  '실제-user-id',
  '홍대 루프탑 바에서 와인 한잔 🍷',
  'drink',
  37.5563,
  126.9236,
  '홍대입구역 근처 루프탑 바',
  now() + interval '5 hours',
  4,
  1,
  20000,
  'all',
  '20s,30s',
  '힐링할 수 있는 루프탑 바에서 와인 한잔해요. 분위기 좋은 곳이에요!'
),
-- 3. 잠실 - 운동
(
  gen_random_uuid(),
  '실제-user-id',
  '한강 야간 러닝 🏃‍♂️',
  'exercise',
  37.5145,
  127.1029,
  '잠실 한강공원',
  now() + interval '2 hours',
  6,
  1,
  0,
  'all',
  'all',
  '잠실 한강공원에서 함께 뛰실 분! 초보도 환영합니다 :)'
),
-- 4. 신촌 - 기타
(
  gen_random_uuid(),
  '실제-user-id',
  '보드게임 카페에서 놀아요 🎲',
  'other',
  37.5551,
  126.9364,
  '신촌 보드게임 카페',
  now() + interval '4 hours',
  4,
  1,
  10000,
  'all',
  'all',
  '보드게임 좋아하시는 분들 모여요! 다양한 게임 준비되어 있어요~'
),
-- 5. 이태원 - 술
(
  gen_random_uuid(),
  '실제-user-id',
  '이태원에서 수제맥주 🍻',
  'drink',
  37.5347,
  126.9946,
  '이태원 크래프트비어 펍',
  now() + interval '6 hours',
  5,
  1,
  18000,
  'all',
  '20s,30s,40s',
  '수제맥주 좋아하시는 분! 다양한 맥주를 맛볼 수 있어요.'
),
-- 6. 건대 - 운동
(
  gen_random_uuid(),
  '실제-user-id',
  '건대 클라이밍 체육관 🧗',
  'exercise',
  37.5405,
  127.0691,
  '건대입구역 클라이밍 센터',
  now() + interval '1 day',
  4,
  1,
  25000,
  'all',
  'all',
  '실내 클라이밍 처음이신 분도 환영! 강사님이 기초부터 알려줍니다.'
),
-- 7. 강남 - 기타
(
  gen_random_uuid(),
  '실제-user-id',
  '코엑스 스타필드 도서관 독서모임 📚',
  'other',
  37.5110,
  127.0592,
  '코엑스 스타필드 라이브러리',
  now() + interval '1 day 2 hours',
  6,
  1,
  0,
  'all',
  'all',
  '각자 책 가져와서 조용히 독서하다가 나중에 커피 한잔해요~'
),
-- 8. 여의도 - 술
(
  gen_random_uuid(),
  '실제-user-id',
  '여의도 한강 맥주 파티 🌅',
  'drink',
  37.5285,
  126.9335,
  '여의도 한강공원 물빛광장',
  now() + interval '1 day 5 hours',
  8,
  1,
  10000,
  'all',
  'all',
  '한강에서 치맥하면서 일몰 구경해요! 돗자리 준비할게요.'
),
-- 9. 신림 - 운동
(
  gen_random_uuid(),
  '실제-user-id',
  '관악산 등산 ⛰️',
  'exercise',
  37.4433,
  126.9634,
  '신림역 관악산 입구',
  now() + interval '2 days',
  10,
  1,
  0,
  'all',
  'all',
  '주말 아침 등산! 초보 코스로 천천히 올라가요. 정상에서 막걸리 한잔!'
),
-- 10. 서울역 - 기타
(
  gen_random_uuid(),
  '실제-user-id',
  '서울로7017 산책 모임 🌳',
  'other',
  37.5548,
  126.9707,
  '서울역 서울로7017 입구',
  now() + interval '1 day 3 hours',
  5,
  1,
  0,
  'all',
  '20s,30s',
  '도심 속 정원 산책하면서 사진도 찍고 카페도 가요!'
);

-- 3단계: 추가된 방 확인
SELECT
  id,
  title,
  category,
  place_text,
  start_at,
  max_people,
  current_people,
  created_at
FROM public.rooms
ORDER BY created_at DESC
LIMIT 10;

*/

-- ===============================================
-- 빠른 테스트용: 회원가입 없이 테스트 계정으로 방 추가
-- ===============================================
-- 주의: 실제 auth.users가 없으면 RLS 정책 때문에 실패할 수 있습니다
-- 프로덕션 환경에서는 반드시 실제 회원가입 후 진행하세요

-- 사용 가능한 사용자 ID 목록 (실제 존재하는 ID로 교체)
-- SELECT id FROM auth.users LIMIT 5;
