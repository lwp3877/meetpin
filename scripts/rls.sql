-- 밋핀(MeetPin) Row Level Security (RLS) 정책
-- 주의: migrate.sql을 먼저 실행한 후 이 파일을 실행하세요

-- 모든 테이블에 RLS 활성화
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blocked_users ENABLE ROW LEVEL SECURITY;

-- 기존 정책 삭제 (재실행시 충돌 방지)
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

-- =============================================================================
-- PROFILES 정책
-- =============================================================================

-- 모든 사용자는 공개 프로필 정보를 읽을 수 있음 (차단된 사용자 제외)
CREATE POLICY "profiles_public_read" ON public.profiles
FOR SELECT
TO authenticated
USING (
  -- 본인이거나
  uid = auth.uid()
  OR
  -- 차단되지 않은 사용자
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = uid)
    OR (blocker_uid = uid AND blocked_uid = auth.uid())
  )
);

-- 본인 프로필만 수정/삭제 가능
CREATE POLICY "profiles_owner_all" ON public.profiles
FOR ALL
TO authenticated
USING (uid = auth.uid())
WITH CHECK (uid = auth.uid());

-- =============================================================================
-- ROOMS 정책
-- =============================================================================

-- 모든 인증된 사용자는 공개 방을 읽을 수 있음 (차단 관계 고려)
CREATE POLICY "rooms_public_read" ON public.rooms
FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  AND status = 'open'
  AND
  -- 호스트와 차단 관계가 아닌 경우만
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = host_uid)
    OR (blocker_uid = host_uid AND blocked_uid = auth.uid())
  )
);

-- 방 생성/수정/삭제는 본인만 가능
CREATE POLICY "rooms_owner_write" ON public.rooms
FOR ALL
TO authenticated
USING (host_uid = auth.uid())
WITH CHECK (host_uid = auth.uid());

-- =============================================================================
-- REQUESTS 정책
-- =============================================================================

-- 인증된 사용자는 참가 요청을 생성할 수 있음
CREATE POLICY "requests_requester_insert" ON public.requests
FOR INSERT
TO authenticated
WITH CHECK (
  requester_uid = auth.uid()
  AND
  -- 방의 호스트와 차단 관계가 아닌 경우만
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users 
    WHERE (blocker_uid = auth.uid() AND blocked_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id))
    OR (blocker_uid = (SELECT host_uid FROM public.rooms WHERE id = room_id) AND blocked_uid = auth.uid())
  )
);

-- 요청자와 방 호스트만 요청을 읽을 수 있음
CREATE POLICY "requests_involved_read" ON public.requests
FOR SELECT
TO authenticated
USING (
  requester_uid = auth.uid()
  OR
  EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id AND host_uid = auth.uid()
  )
);

-- 방 호스트만 요청 상태를 업데이트할 수 있음
CREATE POLICY "requests_host_update" ON public.requests
FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id AND host_uid = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.rooms 
    WHERE id = room_id AND host_uid = auth.uid()
  )
);

-- =============================================================================
-- MATCHES 정책
-- =============================================================================

-- 매칭 당사자만 읽기 가능
CREATE POLICY "matches_involved_read" ON public.matches
FOR SELECT
TO authenticated
USING (
  host_uid = auth.uid()
  OR guest_uid = auth.uid()
);

-- 시스템(API)에서만 매칭 생성/수정 (서비스 계정 사용)
-- 일반 사용자는 직접 매칭을 조작할 수 없음
CREATE POLICY "matches_system_write" ON public.matches
FOR ALL
TO authenticated
USING (false)  -- 일반 사용자는 직접 조작 불가
WITH CHECK (false);

-- =============================================================================
-- MESSAGES 정책
-- =============================================================================

-- 매칭 당사자만 메시지 읽기/쓰기 가능
CREATE POLICY "messages_involved_all" ON public.messages
FOR ALL
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (host_uid = auth.uid() OR guest_uid = auth.uid())
  )
)
WITH CHECK (
  sender_uid = auth.uid()
  AND
  EXISTS (
    SELECT 1 FROM public.matches 
    WHERE id = match_id 
    AND (host_uid = auth.uid() OR guest_uid = auth.uid())
  )
);

-- =============================================================================
-- REPORTS 정책  
-- =============================================================================

-- 인증된 사용자는 신고를 생성할 수 있음
CREATE POLICY "reports_user_insert" ON public.reports
FOR INSERT
TO authenticated
WITH CHECK (
  reporter_uid = auth.uid()
  AND reporter_uid != target_uid  -- 자기 자신을 신고할 수 없음
);

-- 관리자만 신고를 읽을 수 있음
CREATE POLICY "reports_admin_read" ON public.reports
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE uid = auth.uid() AND role = 'admin'
  )
);

-- =============================================================================
-- BLOCKED_USERS 정책
-- =============================================================================

-- 본인의 차단 관계만 관리 가능
CREATE POLICY "blocked_users_owner_all" ON public.blocked_users
FOR ALL
TO authenticated
USING (blocker_uid = auth.uid())
WITH CHECK (blocker_uid = auth.uid());

-- =============================================================================
-- 특별 함수: 차단 관계 필터링을 위한 헬퍼
-- =============================================================================

-- 차단되지 않은 방만 필터링하는 함수
CREATE OR REPLACE FUNCTION public.get_unblocked_rooms(user_id UUID)
RETURNS TABLE(room_id UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT r.id
  FROM public.rooms r
  WHERE r.visibility = 'public'
    AND r.status = 'open'
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_uid = user_id AND b.blocked_uid = r.host_uid)
         OR (b.blocker_uid = r.host_uid AND b.blocked_uid = user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 차단되지 않은 사용자만 필터링하는 함수
CREATE OR REPLACE FUNCTION public.get_unblocked_users(user_id UUID)
RETURNS TABLE(user_id_result UUID) AS $$
BEGIN
  RETURN QUERY
  SELECT p.uid
  FROM public.profiles p
  WHERE p.uid != user_id
    AND NOT EXISTS (
      SELECT 1 FROM public.blocked_users b
      WHERE (b.blocker_uid = user_id AND b.blocked_uid = p.uid)
         OR (b.blocker_uid = p.uid AND b.blocked_uid = user_id)
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- Realtime 권한 설정 (실시간 알림)
-- =============================================================================

-- Realtime 메시지에 대한 RLS 정책
ALTER TABLE realtime.messages ENABLE ROW LEVEL SECURITY;

-- 인증된 사용자만 broadcast/presence 메시지 수신 가능
DROP POLICY IF EXISTS "authenticated_realtime_read" ON realtime.messages;
CREATE POLICY "authenticated_realtime_read" ON realtime.messages
FOR SELECT
TO authenticated
USING (true);

-- 인증된 사용자만 broadcast/presence 메시지 전송 가능
DROP POLICY IF EXISTS "authenticated_realtime_insert" ON realtime.messages;
CREATE POLICY "authenticated_realtime_insert" ON realtime.messages
FOR INSERT
TO authenticated
WITH CHECK (true);

-- =============================================================================
-- 권한 최종 확인
-- =============================================================================

-- 필요한 권한 부여
GRANT USAGE ON SCHEMA public TO authenticated, anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 익명 사용자는 읽기만 가능 (회원가입 전 방 목록 조회용)
GRANT SELECT ON public.rooms TO anon;
GRANT SELECT ON public.profiles TO anon;