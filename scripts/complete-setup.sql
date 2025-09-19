-- 밋핀(MeetPin) 기존 프로젝트 안전 업데이트 스크립트
-- 기존 데이터를 보존하면서 새로운 스키마를 안전하게 적용합니다.

-- =============================================================================
-- 1단계: 확장 및 기본 설정
-- =============================================================================

-- UUID 확장 활성화
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================================================
-- 2단계: 테이블 생성 (기존 테이블이 있으면 건너뛰기)
-- =============================================================================

-- 프로필 테이블
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

-- 방 테이블 (기존 테이블이 있으면 컬럼 추가만)
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

-- boost_until 컬럼 추가 (기존 테이블에 없는 경우만)
ALTER TABLE public.rooms 
ADD COLUMN IF NOT EXISTS boost_until TIMESTAMPTZ;

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

-- 매칭 테이블
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

-- 메시지 테이블
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  match_id UUID REFERENCES public.matches(id) ON DELETE CASCADE NOT NULL,
  sender_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 1000)
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
-- 3단계: 인덱스 생성 (기존 인덱스가 있으면 건너뛰기)
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

-- 신고 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_reports_reporter_uid ON public.reports(reporter_uid);
CREATE INDEX IF NOT EXISTS idx_reports_target_uid ON public.reports(target_uid);
CREATE INDEX IF NOT EXISTS idx_reports_room_id ON public.reports(room_id);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);

-- 차단 관련 인덱스
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocker ON public.blocked_users(blocker_uid);
CREATE INDEX IF NOT EXISTS idx_blocked_users_blocked ON public.blocked_users(blocked_uid);

-- =============================================================================
-- 4단계: 트리거 함수 및 트리거 설정
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

-- 새 사용자 프로필 자동 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (uid, role)
  VALUES (NEW.id, 'user')
  ON CONFLICT (uid) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 요청 수락 시 매칭 생성 트리거
CREATE OR REPLACE FUNCTION public.handle_request_accepted()
RETURNS TRIGGER AS $$
BEGIN
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

DROP TRIGGER IF EXISTS on_request_accepted ON public.requests;
CREATE TRIGGER on_request_accepted
  AFTER UPDATE ON public.requests
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_request_accepted();

-- =============================================================================
-- 5단계: RLS 정책 적용
-- =============================================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 후 재생성 (안전한 업데이트)
DROP POLICY IF EXISTS "profiles_public_read" ON public.profiles;
DROP POLICY IF EXISTS "profiles_owner_all" ON public.profiles;
DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
DROP POLICY IF EXISTS "rooms_owner_write" ON public.rooms;
DROP POLICY IF EXISTS "requests_requester_insert" ON public.requests;
DROP POLICY IF EXISTS "requests_involved_read" ON public.requests;
DROP POLICY IF EXISTS "requests_host_update" ON public.requests;
DROP POLICY IF EXISTS "matches_involved_read" ON public.matches;
DROP POLICY IF EXISTS "matches_system_write" ON public.matches;
DROP POLICY IF EXISTS "messages_involved_all" ON public.messages;
DROP POLICY IF EXISTS "reports_user_insert" ON public.reports;
DROP POLICY IF EXISTS "reports_admin_read" ON public.reports;
DROP POLICY IF EXISTS "blocked_users_owner_all" ON public.blocked_users;

-- 프로필 정책
CREATE POLICY "profiles_public_read" ON public.profiles
FOR SELECT TO authenticated
USING (
  uid = auth.uid() OR
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = uid)
    OR (blocker_uid = uid AND blocked_uid = auth.uid())
  )
);

CREATE POLICY "profiles_owner_all" ON public.profiles
FOR ALL TO authenticated
USING (uid = auth.uid())
WITH CHECK (uid = auth.uid());

-- 방 정책
CREATE POLICY "rooms_public_read" ON public.rooms
FOR SELECT TO authenticated
USING (
  visibility = 'public' AND
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = host_uid)
    OR (blocker_uid = host_uid AND blocked_uid = auth.uid())
  )
);

CREATE POLICY "rooms_owner_write" ON public.rooms
FOR ALL TO authenticated
USING (host_uid = auth.uid())
WITH CHECK (host_uid = auth.uid());

-- 요청 정책
CREATE POLICY "requests_requester_insert" ON public.requests
FOR INSERT TO authenticated
WITH CHECK (
  requester_uid = auth.uid() AND
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id))
    OR (blocker_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id) AND blocked_uid = auth.uid())
  )
);

CREATE POLICY "requests_involved_read" ON public.requests
FOR SELECT TO authenticated
USING (
  requester_uid = auth.uid() OR
  EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = auth.uid())
);

CREATE POLICY "requests_host_update" ON public.requests
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = auth.uid()))
WITH CHECK (EXISTS (SELECT 1 FROM public.rooms WHERE id = room_id AND host_uid = auth.uid()));

-- 매칭 정책
CREATE POLICY "matches_involved_read" ON public.matches
FOR SELECT TO authenticated
USING (host_uid = auth.uid() OR guest_uid = auth.uid());

CREATE POLICY "matches_system_write" ON public.matches
FOR ALL TO authenticated
USING (false)
WITH CHECK (false);

-- 메시지 정책
CREATE POLICY "messages_involved_all" ON public.messages
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id AND (host_uid = auth.uid() OR guest_uid = auth.uid())
  )
)
WITH CHECK (
  sender_uid = auth.uid() AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id AND (host_uid = auth.uid() OR guest_uid = auth.uid())
  )
);

-- 신고 정책
CREATE POLICY "reports_user_insert" ON public.reports
FOR INSERT TO authenticated
WITH CHECK (reporter_uid = auth.uid() AND reporter_uid != target_uid);

CREATE POLICY "reports_admin_read" ON public.reports
FOR SELECT TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin'));

-- 차단 정책
CREATE POLICY "blocked_users_owner_all" ON public.blocked_users
FOR ALL TO authenticated
USING (blocker_uid = auth.uid())
WITH CHECK (blocker_uid = auth.uid());

-- =============================================================================
-- 6단계: Realtime 설정 및 권한
-- =============================================================================

-- 권한 설정
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- Realtime 설정
DROP PUBLICATION IF EXISTS supabase_realtime;
CREATE PUBLICATION supabase_realtime;

-- 실시간 구독 테이블 추가
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.requests;
ALTER PUBLICATION supabase_realtime ADD TABLE public.matches;

-- =============================================================================
-- 7단계: 관리자 뷰 생성
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
  'reports'::text as metric,
  count(*)::int as value,
  'total reports submitted'::text as description
FROM public.reports;

-- =============================================================================
-- 8단계: 통계 업데이트 및 완료 메시지
-- =============================================================================

ANALYZE public.profiles;
ANALYZE public.rooms;
ANALYZE public.requests;
ANALYZE public.matches;
ANALYZE public.messages;
ANALYZE public.reports;
ANALYZE public.blocked_users;

-- 완료 메시지
SELECT '🎉 MeetPin 데이터베이스 업데이트 완료!' as message;

-- 현재 상태 확인
SELECT 
  'Tables: ' || 
  (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') ||
  ' | Users: ' || 
  (SELECT count(*) FROM auth.users) ||
  ' | Profiles: ' || 
  (SELECT count(*) FROM public.profiles) ||
  ' | Rooms: ' || 
  (SELECT count(*) FROM public.rooms)
as status_summary;