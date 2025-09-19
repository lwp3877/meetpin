-- MeetPin Seed Data for Development
-- Version: 1.0.0
-- Created: 2025-01-15
-- WARNING: This file contains test data for development only!

-- ============================================================================
-- 개발용 시드 데이터 안내
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'WARNING: This is DEVELOPMENT SEED DATA ONLY!';
  RAISE NOTICE 'Do NOT run this in production environment!';
  RAISE NOTICE '=================================================';
END $$;

-- ============================================================================
-- 1. 테스트 사용자 생성 (auth.users 테이블에 직접 삽입)
-- ============================================================================

-- 관리자 계정 생성
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES (
  'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
  '00000000-0000-0000-0000-000000000000',
  'authenticated',
  'authenticated',
  'admin@meetpin.com',
  '$2a$10$example.hash.for.password.123456', -- 실제로는 해시된 비밀번호
  NOW(),
  NOW(),
  '{"provider":"email","providers":["email"]}',
  '{"nickname":"관리자"}',
  false,
  NOW(),
  NOW(),
  null,
  null,
  '',
  '',
  '',
  ''
) ON CONFLICT (id) DO NOTHING;

-- 테스트 사용자들 생성
INSERT INTO auth.users (
  id,
  instance_id,
  aud,
  role,
  email,
  encrypted_password,
  email_confirmed_at,
  last_sign_in_at,
  raw_app_meta_data,
  raw_user_meta_data,
  is_super_admin,
  created_at,
  updated_at,
  phone,
  phone_confirmed_at,
  confirmation_token,
  email_change,
  email_change_token_new,
  recovery_token
) VALUES 
-- 호스트 사용자들
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host1@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"김민수"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host2@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"이영희"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'host3@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"박철수"}', false, NOW(), NOW(), null, null, '', '', '', ''),

-- 참가자 사용자들
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user1@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"정수민"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user2@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"최지영"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user3@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"강태현"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user4@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"윤서아"}', false, NOW(), NOW(), null, null, '', '', '', ''),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated', 'user5@test.com', '$2a$10$example.hash.for.password.123456', NOW(), NOW(), '{"provider":"email","providers":["email"]}', '{"nickname":"임동욱"}', false, NOW(), NOW(), null, null, '', '', '', '')

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 2. 프로필 데이터 삽입
-- ============================================================================

-- 관리자 프로필
INSERT INTO profiles (uid, nickname, role, age_range, intro) VALUES
('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '관리자', 'admin', '30-39', 'MeetPin 서비스 관리자입니다.')
ON CONFLICT (uid) DO UPDATE SET 
  nickname = EXCLUDED.nickname,
  role = EXCLUDED.role,
  age_range = EXCLUDED.age_range,
  intro = EXCLUDED.intro;

-- 호스트 프로필들
INSERT INTO profiles (uid, nickname, role, age_range, intro) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '김민수', 'user', '25-29', '안녕하세요! 홍대에서 맛집 탐방을 좋아하는 김민수입니다. 함께 맛있는 음식 먹으면서 좋은 시간 보내요!'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '이영희', 'user', '30-39', '운동을 사랑하는 직장인입니다. 요가, 필라테스, 러닝 등 다양한 운동에 관심이 많아요. 건강한 라이프스타일을 함께 만들어가요!'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '박철수', 'user', '40-49', '강남에서 직장생활하는 아빠입니다. 업무 스트레스 해소를 위해 다양한 모임을 기획해요. 진솔한 대화를 나누고 싶습니다.')
ON CONFLICT (uid) DO UPDATE SET 
  nickname = EXCLUDED.nickname,
  age_range = EXCLUDED.age_range,
  intro = EXCLUDED.intro;

-- 참가자 프로필들
INSERT INTO profiles (uid, nickname, role, age_range, intro) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '정수민', 'user', '20-29', '대학생이에요! 새로운 사람들과 만나는 걸 좋아합니다.'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', '최지영', 'user', '30-39', '직장인입니다. 퇴근 후 취미 활동을 통해 새로운 인연을 만들고 싶어요.'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', '강태현', 'user', '25-29', '운동을 좋아하는 회사원입니다. 같이 운동하실 분들 환영합니다!'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '윤서아', 'user', '20-29', '카페 투어와 맛집 탐방을 좋아해요. 함께 맛있는 거 먹어요!'),
('iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '임동욱', 'user', '30-39', '퇴근 후 스트레스 해소를 위해 다양한 모임에 참여하고 있습니다.')
ON CONFLICT (uid) DO UPDATE SET 
  nickname = EXCLUDED.nickname,
  age_range = EXCLUDED.age_range,
  intro = EXCLUDED.intro;

-- ============================================================================
-- 3. 테스트 모임방 생성
-- ============================================================================

INSERT INTO rooms (
  id,
  host_uid,
  title,
  description,
  category,
  lat,
  lng,
  place_text,
  start_at,
  max_people,
  fee,
  boost_until
) VALUES
-- 술 모임
('00000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '홍대 치킨 & 맥주 모임 🍗🍺', '홍대에서 치킨과 맥주로 스트레스 해소해요! 직장인들 환영합니다. 분위기 좋은 곳에서 편하게 대화하며 좋은 시간 보내요. 1차는 치킨, 2차는 선택사항입니다.', 'drink', 37.5563, 126.9240, '홍대입구역 9번 출구 앞 교촌치킨', NOW() + INTERVAL '2 hours', 6, 15000, NOW() + INTERVAL '3 days'),

('00000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '강남 와인바에서 와인 한 잔 🍷', '강남역 근처 분위기 좋은 와인바에서 와인 테이스팅해요. 와인 초보자도 환영합니다! 전문 소믈리에가 추천하는 와인들을 맛보며 우아한 저녁 시간을 보내봐요.', 'drink', 37.4979, 127.0278, '강남역 2번 출구 와인바 "르뷰"', NOW() + INTERVAL '1 day', 4, 25000, NULL),

('00000003-0000-0000-0000-000000000003', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '회사원 스트레스 해소 모임 🍻', '직장 스트레스를 시원하게 털어버릴 수 있는 모임입니다. 자유로운 분위기에서 업무 고민도 나누고, 좋은 사람들과 함께 힐링하는 시간을 가져봐요.', 'drink', 37.5172, 127.0473, '서울역 맥주집 "더 부스"', NOW() + INTERVAL '3 days', 8, 20000, NOW() + INTERVAL '1 day'),

-- 운동 모임
('00000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', '한강 러닝 크루 모집 🏃‍♀️', '한강에서 함께 러닝하실 분들 모집합니다! 초보자부터 숙련자까지 모두 환영해요. 운동 후에는 치킨과 맥주로 마무리! 건강한 라이프스타일을 만들어가요.', 'exercise', 37.5326, 126.9026, '여의도 한강공원 러닝코스', NOW() + INTERVAL '1 day', 10, 0, NOW() + INTERVAL '2 days'),

('00000005-0000-0000-0000-000000000005', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '강남 헬스장 PT 그룹 수업 💪', '강남역 근처 헬스장에서 그룹 PT 수업을 진행합니다. 전문 트레이너가 지도하며, 개인별 맞춤 운동 프로그램을 제공해요. 운동 초보자도 부담 없이 참여하세요!', 'exercise', 37.4979, 127.0276, '강남역 5번 출구 "파워짐"', NOW() + INTERVAL '2 days', 6, 30000, NULL),

('00000006-0000-0000-0000-000000000006', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', '요가 클래스 & 브런치 🧘‍♀️', '주말 아침 요가 클래스 후 건강한 브런치를 함께 즐겨요. 몸과 마음의 균형을 찾고, 좋은 사람들과 힐링하는 시간을 가져봐요. 요가매트는 준비되어 있습니다.', 'exercise', 37.5443, 126.9506, '홍대 요가스튜디오 "젠"', NOW() + INTERVAL '4 days', 8, 25000, NULL),

-- 기타 모임
('00000007-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd', '보드게임 카페에서 즐기는 시간 🎲', '다양한 보드게임을 즐기며 새로운 친구들과 만나요! 보드게임 초보자도 환영합니다. 룰 설명해드리고 함께 즐겁게 플레이해요. 음료와 간식도 준비되어 있어요.', 'other', 37.5547, 126.9707, '신촌 보드게임카페 "놀자"', NOW() + INTERVAL '2 days', 6, 15000, NOW() + INTERVAL '1 day'),

('00000008-0000-0000-0000-000000000008', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '독서 모임 & 북토크 📚', '한 달에 한 권씩 책을 읽고 함께 이야기 나누는 독서 모임입니다. 이번 달 도서는 "미드나잇 라이브러리"예요. 책을 통해 깊이 있는 대화를 나누고 새로운 관점을 발견해봐요.', 'other', 37.5665, 126.9780, '홍대 북카페 "책과 커피"', NOW() + INTERVAL '3 days', 8, 10000, NULL),

('00000009-0000-0000-0000-000000000009', 'ffffffff-ffff-ffff-ffff-ffffffffffff', '사진 촬영 투어 📸', '서울의 아름다운 장소들을 돌아다니며 사진 촬영을 해봐요! 사진 초보자도 환영합니다. 서로의 작품을 공유하고 피드백을 주고받으며 사진 실력을 늘려봐요.', 'other', 37.5794, 126.9770, '경복궁역 3번 출구', NOW() + INTERVAL '5 days', 5, 5000, NULL),

('00000010-0000-0000-0000-000000000010', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '요리 클래스 - 파스타 만들기 👨‍🍳', '이탈리아 정통 파스타를 직접 만들어보는 요리 클래스입니다. 재료와 도구는 모두 준비되어 있고, 전문 셰프가 차근차근 알려드려요. 만든 파스타는 함께 맛있게 드셔요!', 'other', 37.5172, 127.0286, '용산구 쿠킹스튜디오 "맘마미아"', NOW() + INTERVAL '6 days', 8, 35000, NULL)

ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- 4. 테스트 참가 신청 생성
-- ============================================================================

INSERT INTO requests (room_id, user_id, status, message) VALUES
-- 홍대 치킨 모임 신청들
('00000001-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'accepted', '치킨 좋아해요! 함께 맛있게 먹어요 😊'),
('00000001-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'accepted', '직장 스트레스 해소하고 싶어요. 참여할게요!'),
('00000001-0000-0000-0000-000000000001', 'gggggggg-gggg-gggg-gggg-gggggggggggg', 'pending', '홍대 자주 다니는데 참여하고 싶습니다.'),

-- 강남 와인바 신청들
('00000002-0000-0000-0000-000000000002', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'accepted', '와인에 관심이 많아요. 많이 배우고 싶습니다.'),
('00000002-0000-0000-0000-000000000002', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', 'pending', '와인 초보인데 괜찮을까요?'),

-- 러닝 크루 신청들
('00000004-0000-0000-0000-000000000004', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'accepted', '러닝 좋아해요! 함께 뛰어봐요!'),
('00000004-0000-0000-0000-000000000004', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'accepted', '운동 부족인데 같이 뛰면 좋겠네요.'),
('00000004-0000-0000-0000-000000000004', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'accepted', '한강러닝 처음인데 잘 부탁드려요!'),

-- 보드게임 모임 신청들
('00000007-0000-0000-0000-000000000007', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'accepted', '보드게임 좋아해요! 다양한 게임 해봐요.'),
('00000007-0000-0000-0000-000000000007', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'pending', '보드게임 초보인데 괜찮을까요?')

ON CONFLICT (room_id, user_id) DO NOTHING;

-- ============================================================================
-- 5. 매칭 데이터 생성 (accepted 된 requests 기반)
-- ============================================================================

-- 매칭은 트리거에 의해 자동 생성되므로 별도 삽입 불필요
-- 하지만 수동으로 몇 개 추가 생성

INSERT INTO matches (room_id, user1_id, user2_id) VALUES
-- 홍대 치킨 모임의 매칭들 (호스트와 참가자들)
('00000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),
('00000001-0000-0000-0000-000000000001', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'ffffffff-ffff-ffff-ffff-ffffffffffff'),

-- 강남 와인바 매칭
('00000002-0000-0000-0000-000000000002', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh'),

-- 러닝 크루 매칭들
('00000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb'),
('00000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'dddddddd-dddd-dddd-dddd-dddddddddddd'),
('00000004-0000-0000-0000-000000000004', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee'),

-- 보드게임 모임 매칭
('00000007-0000-0000-0000-000000000007', 'dddddddd-dddd-dddd-dddd-dddddddddddd', 'cccccccc-cccc-cccc-cccc-cccccccccccc')

ON CONFLICT DO NOTHING;

-- ============================================================================
-- 6. 테스트 메시지 생성
-- ============================================================================

INSERT INTO messages (match_id, sender_id, content, message_type) 
SELECT 
  m.id,
  m.user1_id,
  CASE 
    WHEN m.room_id = '00000001-0000-0000-0000-000000000001' THEN '안녕하세요! 홍대 치킨 모임 정말 기대되네요 😊'
    WHEN m.room_id = '00000002-0000-0000-0000-000000000002' THEN '와인바 어디인지 정확한 위치 알 수 있을까요?'
    WHEN m.room_id = '00000004-0000-0000-0000-000000000004' THEN '러닝 준비물 따로 있나요? 운동화만 챙기면 될까요?'
    WHEN m.room_id = '00000007-0000-0000-0000-000000000007' THEN '보드게임 완전 초보인데 괜찮을까요? ㅎㅎ'
    ELSE '안녕하세요! 모임 참여하게 되어 기뻐요!'
  END,
  'text'
FROM matches m
LIMIT 10;

-- 답장 메시지들
INSERT INTO messages (match_id, sender_id, content, message_type)
SELECT 
  m.id,
  m.user2_id,
  CASE 
    WHEN m.room_id = '00000001-0000-0000-0000-000000000001' THEN '네 안녕하세요! 저도 정말 기대되네요. 6시에 교촌치킨 앞에서 만나요!'
    WHEN m.room_id = '00000002-0000-0000-0000-000000000002' THEN '강남역 2번 출구에서 5분 거리에 있어요. 구체적인 주소는 채팅으로 보내드릴게요.'
    WHEN m.room_id = '00000004-0000-0000-0000-000000000004' THEN '운동화와 수건, 물만 챙기시면 됩니다! 날씨 좋으면 정말 좋을 것 같아요.'
    WHEN m.room_id = '00000007-0000-0000-0000-000000000007' THEN '전혀 문제없어요! 룰 쉬운 게임부터 차근차근 알려드릴게요 ㅎㅎ'
    ELSE '저도 기뻐요! 좋은 시간 보내봐요 😊'
  END,
  'text'
FROM matches m
WHERE m.id IN (
  SELECT id FROM matches LIMIT 5
);

-- ============================================================================
-- 7. 호스트 메시지 생성
-- ============================================================================

INSERT INTO host_messages (room_id, sender_id, content) VALUES
('00000001-0000-0000-0000-000000000001', 'gggggggg-gggg-gggg-gggg-gggggggggggg', '안녕하세요! 홍대 치킨 모임 참여하고 싶은데 아직 자리 있나요?'),
('00000002-0000-0000-0000-000000000002', 'iiiiiiii-iiii-iiii-iiii-iiiiiiiiiiii', '와인 완전 초보인데 참여해도 될까요? 분위기 어떤지 궁금해요!'),
('00000004-0000-0000-0000-000000000004', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', '러닝 크루 참여하고 싶어요! 평소에 얼마나 뛰시나요?');

-- ============================================================================
-- 8. 알림 데이터 생성
-- ============================================================================

INSERT INTO notifications (user_id, type, title, message, metadata) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'request_accepted', '참가 신청이 수락되었습니다!', '홍대 치킨 & 맥주 모임에 참가하게 되었습니다. 호스트와 1:1 채팅을 시작할 수 있어요!', '{"room_id": "00000001-0000-0000-0000-000000000001"}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'request_accepted', '참가 신청이 수락되었습니다!', '홍대 치킨 & 맥주 모임에 참가하게 되었습니다. 호스트와 1:1 채팅을 시작할 수 있어요!', '{"room_id": "00000001-0000-0000-0000-000000000001"}'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'request_accepted', '참가 신청이 수락되었습니다!', '강남 와인바에서 와인 한 잔 모임에 참가하게 되었습니다.', '{"room_id": "00000002-0000-0000-0000-000000000002"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'new_message', '정수민님이 메시지를 보냈습니다', '안녕하세요! 홍대 치킨 모임 정말 기대되네요 😊', '{"match_id": "1", "sender_id": "eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee"}'),
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'host_message', '강태현님이 메시지를 보냈습니다', '안녕하세요! 홍대 치킨 모임 참여하고 싶은데 아직 자리 있나요?', '{"room_id": "00000001-0000-0000-0000-000000000001", "sender_id": "gggggggg-gggg-gggg-gggg-gggggggggggg"}');

-- ============================================================================
-- 9. 피드백 데이터 생성 (과거 모임 기준)
-- ============================================================================

INSERT INTO feedback (room_id, reviewer_id, reviewed_id, rating, review_text, tags, would_meet_again) VALUES
('00000001-0000-0000-0000-000000000001', 'eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 5, '정말 즐거운 시간이었어요! 호스트분이 분위기를 잘 이끌어주셔서 편하게 대화할 수 있었습니다.', ARRAY['시간 약속을 잘 지켜요', '대화가 즐거워요', '매너가 좋아요'], true),
('00000001-0000-0000-0000-000000000001', 'ffffffff-ffff-ffff-ffff-ffffffffffff', 'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 4, '맛있는 치킨과 함께 좋은 사람들과 만날 수 있어서 좋았어요. 추천합니다!', ARRAY['매너가 좋아요', '분위기를 잘 띄워요'], true),
('00000002-0000-0000-0000-000000000002', 'hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'cccccccc-cccc-cccc-cccc-cccccccccccc', 5, '와인에 대해 많이 배울 수 있었어요. 호스트분의 설명이 정말 좋았습니다.', ARRAY['진솔한 대화를 해요', '공통 관심사가 많아요'], true);

-- ============================================================================
-- 10. 결제 기록 생성 (테스트용)
-- ============================================================================

INSERT INTO payment_records (
  user_id, 
  room_id, 
  stripe_payment_intent_id, 
  amount, 
  plan_type, 
  status, 
  boost_start_at, 
  boost_end_at
) VALUES
('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '00000001-0000-0000-0000-000000000001', 'pi_test_1234567890', 2500, '3days', 'succeeded', NOW() - INTERVAL '1 day', NOW() + INTERVAL '2 days'),
('cccccccc-cccc-cccc-cccc-cccccccccccc', '00000004-0000-0000-0000-000000000004', 'pi_test_0987654321', 5000, '7days', 'succeeded', NOW() - INTERVAL '2 days', NOW() + INTERVAL '5 days'),
('dddddddd-dddd-dddd-dddd-dddddddddddd', '00000007-0000-0000-0000-000000000007', 'pi_test_1122334455', 1000, '1day', 'succeeded', NOW() - INTERVAL '6 hours', NOW() + INTERVAL '18 hours');

-- ============================================================================
-- 11. 분석 이벤트 생성 (테스트용)
-- ============================================================================

INSERT INTO analytics_events (user_id, session_id, event_name, event_data) VALUES
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'session_001', 'room_view', '{"room_id": "00000001-0000-0000-0000-000000000001", "category": "drink"}'),
('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'session_001', 'request_create', '{"room_id": "00000001-0000-0000-0000-000000000001"}'),
('ffffffff-ffff-ffff-ffff-ffffffffffff', 'session_002', 'room_search', '{"category": "drink", "location": "hongdae"}'),
('gggggggg-gggg-gggg-gggg-gggggggggggg', 'session_003', 'message_send', '{"match_id": "1", "message_type": "text"}'),
('hhhhhhhh-hhhh-hhhh-hhhh-hhhhhhhhhhhh', 'session_004', 'profile_update', '{"field": "intro"}');

-- ============================================================================
-- 시드 데이터 완료 로그
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'MeetPin seed data inserted successfully!';
  RAISE NOTICE 'Test users: 9 (1 admin + 8 users)';
  RAISE NOTICE 'Test rooms: 10 (3 drink + 3 exercise + 4 other)';
  RAISE NOTICE 'Test requests: 10';
  RAISE NOTICE 'Test matches: 7';
  RAISE NOTICE 'Test messages: 15';
  RAISE NOTICE 'Test notifications: 5';
  RAISE NOTICE 'Test feedback: 3';
  RAISE NOTICE 'Test payments: 3';
  RAISE NOTICE '=================================================';
  RAISE NOTICE 'DEVELOPMENT ENVIRONMENT READY!';
  RAISE NOTICE '=================================================';
END $$;