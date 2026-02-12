-- 밋핀(MeetPin) 추가 테이블 RLS 정책
-- 실행 순서: migrate.sql → migrate-extra.sql → rls.sql → 이 파일

-- =============================================================================
-- RLS 활성화
-- =============================================================================
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.privacy_rights_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.age_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verification_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.meetup_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_safety_settings ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- NOTIFICATIONS 정책 — 본인 알림만 접근
-- =============================================================================
DROP POLICY IF EXISTS "notifications_owner_read" ON public.notifications;
CREATE POLICY "notifications_owner_read" ON public.notifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_owner_update" ON public.notifications;
CREATE POLICY "notifications_owner_update" ON public.notifications
FOR UPDATE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_owner_delete" ON public.notifications;
CREATE POLICY "notifications_owner_delete" ON public.notifications
FOR DELETE TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "notifications_system_insert" ON public.notifications;
CREATE POLICY "notifications_system_insert" ON public.notifications
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- FEEDBACK 정책 — 본인 피드백 생성, 관리자 읽기
-- =============================================================================
DROP POLICY IF EXISTS "feedback_user_insert" ON public.feedback;
CREATE POLICY "feedback_user_insert" ON public.feedback
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "feedback_admin_read" ON public.feedback;
CREATE POLICY "feedback_admin_read" ON public.feedback
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- EMERGENCY_REPORTS 정책 — 본인 생성, 관리자 읽기/수정
-- =============================================================================
DROP POLICY IF EXISTS "emergency_reports_user_insert" ON public.emergency_reports;
CREATE POLICY "emergency_reports_user_insert" ON public.emergency_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

DROP POLICY IF EXISTS "emergency_reports_read" ON public.emergency_reports;
CREATE POLICY "emergency_reports_read" ON public.emergency_reports
FOR SELECT TO authenticated
USING (
  reporter_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "emergency_reports_admin_update" ON public.emergency_reports;
CREATE POLICY "emergency_reports_admin_update" ON public.emergency_reports
FOR UPDATE TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin'));

-- =============================================================================
-- PRIVACY_RIGHTS_REQUESTS 정책 — 본인 생성/읽기, 관리자 관리
-- =============================================================================
DROP POLICY IF EXISTS "privacy_requests_user_insert" ON public.privacy_rights_requests;
CREATE POLICY "privacy_requests_user_insert" ON public.privacy_rights_requests
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "privacy_requests_read" ON public.privacy_rights_requests;
CREATE POLICY "privacy_requests_read" ON public.privacy_rights_requests
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- ADMIN_NOTIFICATIONS 정책 — 관리자만 접근
-- =============================================================================
DROP POLICY IF EXISTS "admin_notifications_admin_all" ON public.admin_notifications;
CREATE POLICY "admin_notifications_admin_all" ON public.admin_notifications
FOR ALL TO authenticated
USING (EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "admin_notifications_insert" ON public.admin_notifications;
CREATE POLICY "admin_notifications_insert" ON public.admin_notifications
FOR INSERT TO authenticated
WITH CHECK (true);

-- =============================================================================
-- AGE_VERIFICATION_LOGS 정책 — 본인 기록, 관리자 읽기
-- =============================================================================
DROP POLICY IF EXISTS "age_verification_user_insert" ON public.age_verification_logs;
CREATE POLICY "age_verification_user_insert" ON public.age_verification_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS "age_verification_read" ON public.age_verification_logs;
CREATE POLICY "age_verification_read" ON public.age_verification_logs
FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- USER_VERIFICATION_STATUS 정책 — 본인 읽기, 시스템 수정
-- =============================================================================
DROP POLICY IF EXISTS "verification_status_owner_read" ON public.user_verification_status;
CREATE POLICY "verification_status_owner_read" ON public.user_verification_status
FOR SELECT TO authenticated
USING (user_id = auth.uid());

DROP POLICY IF EXISTS "verification_status_insert" ON public.user_verification_status;
CREATE POLICY "verification_status_insert" ON public.user_verification_status
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- USER_VERIFICATIONS 정책 — 본인 읽기/생성
-- =============================================================================
DROP POLICY IF EXISTS "user_verifications_owner" ON public.user_verifications;
CREATE POLICY "user_verifications_owner" ON public.user_verifications
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- =============================================================================
-- MEETUP_FEEDBACK 정책 — 참가자 생성, 관련자 읽기
-- =============================================================================
DROP POLICY IF EXISTS "meetup_feedback_insert" ON public.meetup_feedback;
CREATE POLICY "meetup_feedback_insert" ON public.meetup_feedback
FOR INSERT TO authenticated
WITH CHECK (attendee_id = auth.uid());

DROP POLICY IF EXISTS "meetup_feedback_read" ON public.meetup_feedback;
CREATE POLICY "meetup_feedback_read" ON public.meetup_feedback
FOR SELECT TO authenticated
USING (
  attendee_id = auth.uid()
  OR host_id = auth.uid()
  OR EXISTS (SELECT 1 FROM public.profiles WHERE uid = auth.uid() AND role = 'admin')
);

-- =============================================================================
-- USER_SAFETY_SETTINGS 정책 — 본인만 접근
-- =============================================================================
DROP POLICY IF EXISTS "safety_settings_owner" ON public.user_safety_settings;
CREATE POLICY "safety_settings_owner" ON public.user_safety_settings
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());
