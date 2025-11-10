-- 익명 사용자도 공개 방을 조회할 수 있도록 RLS 정책 수정
-- Supabase SQL Editor에서 실행하세요

-- 기존 정책 삭제
DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
DROP POLICY IF EXISTS "rooms_anonymous_read" ON public.rooms;

-- 인증된 사용자용 정책 (차단 관계 고려)
CREATE POLICY "rooms_public_read" ON public.rooms
FOR SELECT
TO authenticated
USING (
  visibility = 'public'
  AND
  -- 호스트와 차단 관계가 아닌 경우만
  NOT EXISTS (
    SELECT 1 FROM public.blocked_users
    WHERE (blocker_uid = auth.uid() AND blocked_uid = host_uid)
    OR (blocker_uid = host_uid AND blocked_uid = auth.uid())
  )
);

-- 익명 사용자용 정책 (모든 공개 방 조회 가능)
CREATE POLICY "rooms_anonymous_read" ON public.rooms
FOR SELECT
TO anon
USING (visibility = 'public');

-- 검증 쿼리 (익명으로 실행)
-- SELECT COUNT(*) FROM public.rooms WHERE visibility = 'public';
