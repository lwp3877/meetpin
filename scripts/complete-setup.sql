-- 밋핀(MeetPin) 완전 데이터베이스 및 스토리지 설정 스크립트
-- 이 스크립트는 Supabase SQL Editor에서 실행해야 합니다

-- =============================================================================
-- 1. 확장 기능 활성화
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2. 기본 테이블 생성 (migrate.sql 내용)
-- =============================================================================

-- 프로필 테이블 (profiles.uid를 PK로 사용)
CREATE TABLE IF NOT EXISTS public.profiles (
  uid UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  nickname TEXT,
  age_range TEXT CHECK (age_range IN ('20s_early', '20s_late', '30s_early', '30s_late', '40s', '50s+')),
  avatar_url TEXT,
  intro TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT nickname_length CHECK (char_length(nickname) >= 2 AND char_length(nickname) <= 20),
  CONSTRAINT intro_length CHECK (char_length(intro) <= 500),
  CONSTRAINT valid_avatar_url CHECK (avatar_url IS NULL OR avatar_url ~ '^https?://.*')
);

-- 방 테이블
CREATE TABLE IF NOT EXISTS public.rooms (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  host_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('drink', 'exercise', 'other')),
  lat DECIMAL(10, 8) NOT NULL,
  lng DECIMAL(11, 8) NOT NULL,
  place_text TEXT NOT NULL,
  start_at TIMESTAMPTZ NOT NULL,
  max_people INTEGER NOT NULL DEFAULT 4,
  fee INTEGER NOT NULL DEFAULT 0,
  visibility TEXT DEFAULT 'public' CHECK (visibility IN ('public', 'private')),
  boost_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT title_length CHECK (char_length(title) >= 1 AND char_length(title) <= 100),
  CONSTRAINT place_text_length CHECK (char_length(place_text) >= 1 AND char_length(place_text) <= 200),
  CONSTRAINT valid_coordinates CHECK (lat BETWEEN -90 AND 90 AND lng BETWEEN -180 AND 180),
  CONSTRAINT valid_max_people CHECK (max_people >= 2 AND max_people <= 20),
  CONSTRAINT valid_fee CHECK (fee >= 0 AND fee <= 1000000),
  CONSTRAINT valid_start_time CHECK (start_at > created_at)
);

-- 참가 요청 테이블
CREATE TABLE IF NOT EXISTS public.requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  requester_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  message TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 중복 요청 방지
  UNIQUE(room_id, requester_uid),
  
  -- 제약 조건
  CONSTRAINT message_length CHECK (char_length(message) <= 500)
);

-- 매칭 테이블 (수락된 요청들)
CREATE TABLE IF NOT EXISTS public.matches (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  host_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  guest_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 중복 매칭 방지
  UNIQUE(room_id, host_uid, guest_uid),
  
  -- 제약 조건
  CONSTRAINT no_self_match CHECK (host_uid != guest_uid)
);

-- 메시지 테이블 (1:1 채팅)
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 1000)
);

-- 호스트 메시지 테이블 (방 참가 전에도 호스트에게 메시지 가능)
CREATE TABLE IF NOT EXISTS public.host_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  sender_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 1000),
  CONSTRAINT no_self_message CHECK (sender_uid != receiver_uid)
);

-- 신고 테이블
CREATE TABLE IF NOT EXISTS public.reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  target_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  reason TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT reason_length CHECK (char_length(reason) >= 1 AND char_length(reason) <= 500),
  CONSTRAINT no_self_report CHECK (reporter_uid != target_uid)
);

-- 차단된 사용자 테이블
CREATE TABLE IF NOT EXISTS public.blocked_users (
  blocker_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  blocked_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  PRIMARY KEY (blocker_uid, blocked_uid),
  
  -- 제약 조건
  CONSTRAINT no_self_block CHECK (blocker_uid != blocked_uid)
);

-- =============================================================================
-- 3. 인덱스 생성 (성능 최적화)
-- =============================================================================

-- 프로필 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_profiles_nickname ON public.profiles(nickname);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 방 검색용 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_created_at ON public.rooms(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_boost_until ON public.rooms(boost_until DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_rooms_location ON public.rooms(lat, lng);
CREATE INDEX IF NOT EXISTS idx_rooms_category ON public.rooms(category);
CREATE INDEX IF NOT EXISTS idx_rooms_host_uid ON public.rooms(host_uid);
CREATE INDEX IF NOT EXISTS idx_rooms_start_at ON public.rooms(start_at);

-- 복합 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_boost_created ON public.rooms(boost_until DESC NULLS LAST, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rooms_category_location ON public.rooms(category, lat, lng);

-- 요청 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_requests_room_id ON public.requests(room_id);
CREATE INDEX IF NOT EXISTS idx_requests_requester_uid ON public.requests(requester_uid);
CREATE INDEX IF NOT EXISTS idx_requests_created_at ON public.requests(created_at DESC);

-- 매칭 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_matches_room_id ON public.matches(room_id);
CREATE INDEX IF NOT EXISTS idx_matches_host_uid ON public.matches(host_uid);
CREATE INDEX IF NOT EXISTS idx_matches_guest_uid ON public.matches(guest_uid);
CREATE INDEX IF NOT EXISTS idx_matches_host_guest ON public.matches(host_uid, guest_uid);

-- 메시지 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_messages_match_id ON public.messages(match_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON public.messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender_uid ON public.messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_messages_match_created ON public.messages(match_id, created_at DESC);

-- 호스트 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_host_messages_room_id ON public.host_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_host_messages_sender_uid ON public.host_messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_receiver_uid ON public.host_messages(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_created_at ON public.host_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_host_messages_unread ON public.host_messages(receiver_uid, is_read, created_at DESC);

-- 신고 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_reporter_uid ON public.reports(reporter_uid);
CREATE INDEX IF NOT EXISTS idx_reports_target_uid ON public.reports(target_uid);
CREATE INDEX IF NOT EXISTS idx_reports_room_id ON public.reports(room_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- 차단 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_uid);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_uid);

-- =============================================================================
-- 4. 트리거 함수 및 트리거
-- =============================================================================

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- updated_at 트리거 적용
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS rooms_updated_at ON public.rooms;
CREATE TRIGGER rooms_updated_at
  BEFORE UPDATE ON public.rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS requests_updated_at ON public.requests;
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 트리거 함수: 새 사용자 프로필 자동 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (uid, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 새 사용자 트리거
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 트리거 함수: 요청 수락 시 매칭 생성
CREATE OR REPLACE FUNCTION public.handle_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
  -- 요청이 수락된 경우에만 매칭 생성
  IF NEW.status = 'accepted' AND OLD.status != 'accepted' THEN
    INSERT INTO public.matches (room_id, host_uid, guest_uid)
    SELECT 
      NEW.room_id,
      r.host_uid,
      NEW.requester_uid
    FROM public.rooms r
    WHERE r.id = NEW.room_id
    ON CONFLICT (room_id, host_uid, guest_uid) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 요청 수락 시 매칭 자동 생성 트리거
DROP TRIGGER IF EXISTS on_request_accepted ON public.requests;
CREATE TRIGGER on_request_accepted
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_request_accepted();

-- =============================================================================
-- 5. 권한 설정
-- =============================================================================

GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- 호스트 메시지 테이블 권한
GRANT ALL ON public.host_messages TO anon, authenticated;

-- =============================================================================
-- 6. RLS (Row Level Security) 정책
-- =============================================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.host_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- 프로필 정책
CREATE POLICY "profiles_select_policy" ON public.profiles FOR SELECT USING (
  uid = auth.uid() OR 
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin') OR
  NOT EXISTS(
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = uid AND blocked_uid = auth.uid()) OR (blocker_uid = auth.uid() AND blocked_uid = uid)
  )
);

CREATE POLICY "profiles_insert_policy" ON public.profiles FOR INSERT WITH CHECK (uid = auth.uid());
CREATE POLICY "profiles_update_policy" ON public.profiles FOR UPDATE USING (uid = auth.uid());
CREATE POLICY "profiles_delete_policy" ON public.profiles FOR DELETE USING (uid = auth.uid());

-- 방 정책
CREATE POLICY "rooms_select_policy" ON public.rooms FOR SELECT USING (
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin') OR
  NOT EXISTS(
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = host_uid AND blocked_uid = auth.uid()) OR (blocker_uid = auth.uid() AND blocked_uid = host_uid)
  )
);

CREATE POLICY "rooms_insert_policy" ON public.rooms FOR INSERT WITH CHECK (host_uid = auth.uid());
CREATE POLICY "rooms_update_policy" ON public.rooms FOR UPDATE USING (host_uid = auth.uid());
CREATE POLICY "rooms_delete_policy" ON public.rooms FOR DELETE USING (host_uid = auth.uid());

-- 요청 정책
CREATE POLICY "requests_select_policy" ON public.requests FOR SELECT USING (
  requester_uid = auth.uid() OR 
  EXISTS(SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = auth.uid()) OR
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

CREATE POLICY "requests_insert_policy" ON public.requests FOR INSERT WITH CHECK (
  requester_uid = auth.uid() AND
  EXISTS(SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid != auth.uid()) AND
  NOT EXISTS(
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id) AND blocked_uid = auth.uid()) OR
          (blocker_uid = auth.uid() AND blocked_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id))
  )
);

CREATE POLICY "requests_update_policy" ON public.requests FOR UPDATE USING (
  EXISTS(SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = auth.uid())
);

-- 매칭 정책
CREATE POLICY "matches_select_policy" ON public.matches FOR SELECT USING (
  host_uid = auth.uid() OR guest_uid = auth.uid() OR
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

-- 메시지 정책
CREATE POLICY "messages_select_policy" ON public.messages FOR SELECT USING (
  sender_uid = auth.uid() OR 
  EXISTS(SELECT 1 FROM public.matches WHERE id = match_id AND (host_uid = auth.uid() OR guest_uid = auth.uid()))
);

CREATE POLICY "messages_insert_policy" ON public.messages FOR INSERT WITH CHECK (
  sender_uid = auth.uid() AND
  EXISTS(SELECT 1 FROM public.matches WHERE id = match_id AND (host_uid = auth.uid() OR guest_uid = auth.uid()))
);

-- 호스트 메시지 정책
CREATE POLICY "host_messages_select_policy" ON public.host_messages FOR SELECT USING (
  sender_uid = auth.uid() OR receiver_uid = auth.uid() OR
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

CREATE POLICY "host_messages_insert_policy" ON public.host_messages FOR INSERT WITH CHECK (
  sender_uid = auth.uid() AND
  EXISTS(SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = receiver_uid) AND
  sender_uid != receiver_uid AND
  NOT EXISTS(
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = receiver_uid AND blocked_uid = auth.uid()) OR (blocker_uid = auth.uid() AND blocked_uid = receiver_uid)
  )
);

CREATE POLICY "host_messages_update_policy" ON public.host_messages FOR UPDATE USING (receiver_uid = auth.uid());

-- 신고 정책
CREATE POLICY "reports_select_policy" ON public.reports FOR SELECT USING (
  reporter_uid = auth.uid() OR 
  EXISTS(SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

CREATE POLICY "reports_insert_policy" ON public.reports FOR INSERT WITH CHECK (
  reporter_uid = auth.uid() AND reporter_uid != target_uid
);

-- 차단 정책
CREATE POLICY "blocked_users_select_policy" ON public.blocked_users FOR SELECT USING (blocker_uid = auth.uid());
CREATE POLICY "blocked_users_insert_policy" ON public.blocked_users FOR INSERT WITH CHECK (blocker_uid = auth.uid());
CREATE POLICY "blocked_users_delete_policy" ON public.blocked_users FOR DELETE USING (blocker_uid = auth.uid());

-- =============================================================================
-- 7. Realtime 설정
-- =============================================================================

DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- 실시간 구독이 필요한 테이블들만 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;
ALTER PUBLICATION supabase_realtime ADD TABLE public.host_messages;

-- =============================================================================
-- 8. 관리자 통계 뷰
-- =============================================================================

CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  'users'::text as metric,
  count(*)::int as value,
  'total registered users'::text as description
FROM public.profiles
UNION ALL
SELECT
  'rooms'::text as metric,
  count(*)::int as value,
  'total rooms created'::text as description
FROM public.rooms
UNION ALL
SELECT
  'active_rooms'::text as metric,
  count(*)::int as value,
  'currently active rooms'::text as description
FROM public.rooms
WHERE start_at > now()
UNION ALL
SELECT
  'matches'::text as metric,
  count(*)::int as value,
  'total successful matches'::text as description
FROM public.matches
UNION ALL
SELECT
  'messages'::text as metric,
  count(*)::int as value,
  'total messages sent'::text as description
FROM public.messages
UNION ALL
SELECT
  'host_messages'::text as metric,
  count(*)::int as value,
  'total host messages sent'::text as description
FROM public.host_messages
UNION ALL
SELECT
  'reports'::text as metric,
  count(*)::int as value,
  'total reports submitted'::text as description
FROM public.reports;

-- =============================================================================
-- 9. 통계 수집 및 최적화
-- =============================================================================

ANALYZE public.profiles;
ANALYZE public.rooms;
ANALYZE public.requests;
ANALYZE public.matches;
ANALYZE public.messages;
ANALYZE public.host_messages;
ANALYZE public.reports;
ANALYZE public.blocked_users;

-- =============================================================================
-- 완료 메시지
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ MeetPin 데이터베이스 설정이 완료되었습니다!';
  RAISE NOTICE '📋 다음 단계:';
  RAISE NOTICE '1. Supabase 대시보드에서 "images" Storage 버킷 생성';
  RAISE NOTICE '2. 버킷을 Public으로 설정';
  RAISE NOTICE '3. 샘플 데이터 삽입 (scripts/seed.sql 실행)';
  RAISE NOTICE '4. 애플리케이션 환경 변수 확인';
END $$;