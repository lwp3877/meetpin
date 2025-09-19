-- MeetPin Production Database Schema
-- Version: 1.0.0
-- Created: 2025-01-15

-- ============================================================================
-- 1. PROFILES TABLE - 사용자 프로필 정보
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  nickname VARCHAR(50) NOT NULL,
  role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  age_range VARCHAR(10) CHECK (age_range IN ('10-19', '20-29', '30-39', '40-49', '50-59', '60+')),
  avatar_url TEXT,
  intro TEXT,
  referral_code VARCHAR(10) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 인덱스를 위한 제약조건
  CONSTRAINT profiles_nickname_length CHECK (char_length(nickname) >= 2),
  CONSTRAINT profiles_intro_length CHECK (char_length(intro) <= 500)
);

-- 프로필 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_uid ON profiles(uid);
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_created_at ON profiles(created_at);

-- ============================================================================
-- 2. ROOMS TABLE - 모임방 정보
-- ============================================================================
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  host_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title VARCHAR(100) NOT NULL,
  description TEXT,
  category VARCHAR(20) NOT NULL CHECK (category IN ('drink', 'exercise', 'other')),
  
  -- 위치 정보
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  place_text VARCHAR(200) NOT NULL,
  
  -- 모임 정보
  start_at TIMESTAMPTZ NOT NULL,
  max_people INTEGER NOT NULL CHECK (max_people BETWEEN 2 AND 20),
  fee INTEGER DEFAULT 0 CHECK (fee >= 0),
  
  -- 상태 관리
  visibility VARCHAR(20) DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'completed')),
  
  -- 부스트 기능 (유료)
  boost_until TIMESTAMPTZ,
  
  -- 이미지
  image_url TEXT,
  
  -- 메타데이터
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT rooms_title_length CHECK (char_length(title) >= 5),
  CONSTRAINT rooms_description_length CHECK (char_length(description) <= 1000),
  CONSTRAINT rooms_start_at_future CHECK (start_at > NOW()),
  CONSTRAINT rooms_coordinates_valid CHECK (
    lat BETWEEN -90 AND 90 AND 
    lng BETWEEN -180 AND 180
  )
);

-- 방 인덱스 (지리적 검색 최적화)
CREATE INDEX IF NOT EXISTS idx_rooms_host_uid ON rooms(host_uid);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_location ON rooms(lat, lng);
CREATE INDEX IF NOT EXISTS idx_rooms_start_at ON rooms(start_at);
CREATE INDEX IF NOT EXISTS idx_rooms_boost_until ON rooms(boost_until DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_rooms_visibility_status ON rooms(visibility, status);
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON rooms(created_at DESC);

-- 복합 인덱스 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_rooms_search ON rooms(visibility, status, start_at) WHERE visibility = 'public' AND status = 'active';
CREATE INDEX IF NOT EXISTS idx_rooms_location_search ON rooms(lat, lng, visibility, status) WHERE visibility = 'public' AND status = 'active';

-- ============================================================================
-- 3. REQUESTS TABLE - 참가 신청 관리
-- ============================================================================
CREATE TABLE IF NOT EXISTS requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'cancelled')),
  message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 한 사용자가 같은 방에 중복 신청 방지
  UNIQUE(room_id, user_id),
  
  -- 제약조건
  CONSTRAINT requests_message_length CHECK (char_length(message) <= 200)
);

-- 신청 인덱스
CREATE INDEX IF NOT EXISTS idx_requests_room_id ON requests(room_id);
CREATE INDEX IF NOT EXISTS idx_requests_user_id ON requests(user_id);
CREATE INDEX IF NOT EXISTS idx_requests_status ON requests(status);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON requests(created_at DESC);

-- ============================================================================
-- 4. MATCHES TABLE - 수락된 매칭 관리 (1:1 채팅 활성화)
-- ============================================================================
CREATE TABLE IF NOT EXISTS matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  user1_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user2_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 매칭 고유성 보장 (사용자 순서 무관)
  CONSTRAINT matches_unique_pair CHECK (user1_id != user2_id),
  UNIQUE(room_id, LEAST(user1_id, user2_id), GREATEST(user1_id, user2_id))
);

-- 매칭 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_room_id ON matches(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_user1_id ON matches(user1_id);
CREATE INDEX IF NOT EXISTS idx_matches_user2_id ON matches(user2_id);
CREATE INDEX IF NOT EXISTS idx_matches_created_at ON matches(created_at DESC);

-- ============================================================================
-- 5. MESSAGES TABLE - 1:1 채팅 메시지
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  match_id UUID REFERENCES matches(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT messages_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 1000)
);

-- 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_read_at ON messages(read_at);

-- ============================================================================
-- 6. HOST_MESSAGES TABLE - 호스트에게 보내는 직접 메시지
-- ============================================================================
CREATE TABLE IF NOT EXISTS host_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT host_messages_content_length CHECK (char_length(content) >= 1 AND char_length(content) <= 500)
);

-- 호스트 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_host_messages_room_id ON host_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_host_messages_sender_id ON host_messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_host_messages_read_at ON host_messages(read_at);
CREATE INDEX IF NOT EXISTS idx_host_messages_created_at ON host_messages(created_at DESC);

-- ============================================================================
-- 7. BLOCKED_USERS TABLE - 사용자 차단 관리
-- ============================================================================
CREATE TABLE IF NOT EXISTS blocked_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  blocker_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reason VARCHAR(100),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 자기 자신 차단 방지 및 중복 차단 방지
  CONSTRAINT blocked_users_not_self CHECK (blocker_id != blocked_id),
  UNIQUE(blocker_id, blocked_id)
);

-- 차단 사용자 인덱스
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker_id ON blocked_users(blocker_id);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked_id ON blocked_users(blocked_id);

-- ============================================================================
-- 8. REPORTS TABLE - 신고 관리
-- ============================================================================
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  category VARCHAR(50) NOT NULL CHECK (category IN (
    'inappropriate_behavior', 'spam', 'harassment', 
    'fake_profile', 'inappropriate_content', 'other'
  )),
  reason TEXT NOT NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'reviewing', 'resolved', 'dismissed')),
  admin_notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT reports_not_self CHECK (reporter_id != reported_id),
  CONSTRAINT reports_reason_length CHECK (char_length(reason) >= 5 AND char_length(reason) <= 500)
);

-- 신고 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_reporter_id ON reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_reports_reported_id ON reports(reported_id);
CREATE INDEX IF NOT EXISTS idx_reports_room_id ON reports(room_id);
CREATE INDEX IF NOT EXISTS idx_reports_status ON reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_category ON reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);

-- ============================================================================
-- 9. NOTIFICATIONS TABLE - 알림 시스템
-- ============================================================================
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN (
    'room_request', 'request_accepted', 'request_rejected', 
    'new_message', 'host_message', 'room_cancelled', 
    'room_reminder', 'boost_expired', 'system_announcement'
  )),
  title VARCHAR(100) NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 제약조건
  CONSTRAINT notifications_title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT notifications_message_length CHECK (char_length(message) >= 1 AND char_length(message) <= 500)
);

-- 알림 인덱스
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = FALSE;

-- ============================================================================
-- 10. FEEDBACK TABLE - 사용자 피드백 및 평가
-- ============================================================================
CREATE TABLE IF NOT EXISTS feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE NOT NULL,
  reviewer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reviewed_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  tags TEXT[], -- 태그 배열
  would_meet_again BOOLEAN,
  is_anonymous BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- 한 모임에서 같은 사용자에 대한 중복 평가 방지
  UNIQUE(room_id, reviewer_id, reviewed_id),
  
  -- 자기 자신 평가 방지
  CONSTRAINT feedback_not_self CHECK (reviewer_id != reviewed_id),
  CONSTRAINT feedback_review_length CHECK (char_length(review_text) <= 300)
);

-- 피드백 인덱스
CREATE INDEX IF NOT EXISTS idx_feedback_room_id ON feedback(room_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewer_id ON feedback(reviewer_id);
CREATE INDEX IF NOT EXISTS idx_feedback_reviewed_id ON feedback(reviewed_id);
CREATE INDEX IF NOT EXISTS idx_feedback_rating ON feedback(rating);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- ============================================================================
-- 11. PAYMENT_RECORDS TABLE - 결제 기록 (부스트 구매)
-- ============================================================================
CREATE TABLE IF NOT EXISTS payment_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  stripe_payment_intent_id VARCHAR(200) UNIQUE,
  amount INTEGER NOT NULL CHECK (amount > 0), -- 원화 단위
  currency VARCHAR(3) DEFAULT 'KRW',
  plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('1day', '3days', '7days')),
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'succeeded', 'failed', 'cancelled')),
  boost_start_at TIMESTAMPTZ,
  boost_end_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 결제 기록 인덱스
CREATE INDEX IF NOT EXISTS idx_payment_records_user_id ON payment_records(user_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_room_id ON payment_records(room_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_stripe_payment_intent_id ON payment_records(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payment_records_status ON payment_records(status);
CREATE INDEX IF NOT EXISTS idx_payment_records_created_at ON payment_records(created_at DESC);

-- ============================================================================
-- 12. ANALYTICS_EVENTS TABLE - 사용자 행동 분석
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id VARCHAR(100),
  event_name VARCHAR(100) NOT NULL,
  event_data JSONB,
  user_agent TEXT,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 분석 이벤트 인덱스
CREATE INDEX IF NOT EXISTS idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_session_id ON analytics_events(session_id);
CREATE INDEX IF NOT EXISTS idx_analytics_events_event_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON analytics_events(created_at DESC);

-- ============================================================================
-- 추가 제약조건 및 관계 설정
-- ============================================================================

-- profiles 테이블 updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- 각 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_reports_updated_at BEFORE UPDATE ON reports FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_payment_records_updated_at BEFORE UPDATE ON payment_records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 테이블 생성 완료 로그
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'MeetPin database schema created successfully!';
  RAISE NOTICE 'Tables created: 12';
  RAISE NOTICE 'Indexes created: ~50';
  RAISE NOTICE 'Next step: Apply RLS policies (002-row-level-security.sql)';
END $$;