-- 밋핀(MeetPin) 추가 테이블 마이그레이션
-- 실행 순서: migrate.sql → 이 파일 → rls.sql → rls-extra.sql
-- notifications, feedback, safety 관련 테이블 생성

-- =============================================================================
-- 알림 테이블 (핵심 - NotificationCenter가 15초마다 폴링)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('room_request', 'message', 'room_full', 'review', 'boost_reminder', 'match_success')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_unread ON public.notifications(user_id, is_read) WHERE is_read = false;

-- =============================================================================
-- 피드백 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'general', 'complaint')),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  contact_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON public.feedback(user_id);

-- =============================================================================
-- 긴급 신고 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.emergency_reports (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  room_id UUID REFERENCES public.rooms(id) ON DELETE SET NULL,
  emergency_type TEXT NOT NULL CHECK (emergency_type IN ('safety_threat', 'harassment', 'fraud', 'inappropriate_behavior', 'other')),
  description TEXT NOT NULL,
  location_info TEXT,
  priority_level TEXT DEFAULT 'high' CHECK (priority_level IN ('low', 'medium', 'high', 'critical')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'investigating', 'resolved', 'dismissed')),
  assigned_to UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  resolution_notes TEXT,
  resolved_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_emergency_reports_reporter ON public.emergency_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON public.emergency_reports(status);

-- =============================================================================
-- 개인정보 처리 요청 테이블 (GDPR/DSAR)
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.privacy_rights_requests (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_type TEXT NOT NULL CHECK (request_type IN ('access', 'deletion', 'rectification', 'portability', 'restriction', 'objection')),
  reason TEXT,
  specific_data TEXT,
  contact_email TEXT,
  urgency TEXT DEFAULT 'normal' CHECK (urgency IN ('normal', 'urgent')),
  legal_basis TEXT,
  preferred_response_method TEXT DEFAULT 'email',
  additional_info TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  request_metadata JSONB DEFAULT '{}',
  admin_response TEXT,
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_privacy_requests_user ON public.privacy_rights_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_requests_status ON public.privacy_rights_requests(status);

-- =============================================================================
-- 관리자 알림 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.admin_notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'critical')),
  reference_id UUID,
  metadata JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_notifications_created ON public.admin_notifications(created_at DESC);

-- =============================================================================
-- 나이 인증 로그 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.age_verification_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_method TEXT NOT NULL,
  age_range TEXT,
  is_adult BOOLEAN NOT NULL,
  verification_ip TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_age_verification_user ON public.age_verification_logs(user_id);

-- =============================================================================
-- 사용자 인증 상태 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_verification_status (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  verification_type TEXT NOT NULL,
  verification_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_verification_status_user ON public.user_verification_status(user_id);

-- =============================================================================
-- 사용자 인증 기록 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  verification_type TEXT NOT NULL,
  verification_data JSONB DEFAULT '{}',
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'verified', 'rejected', 'expired')),
  expires_at TIMESTAMPTZ,
  verified_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_verifications_user ON public.user_verifications(user_id);

-- =============================================================================
-- 모임 후 피드백 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.meetup_feedback (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  attendee_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  host_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  safety_rating INTEGER CHECK (safety_rating BETWEEN 1 AND 5),
  experience_rating INTEGER CHECK (experience_rating BETWEEN 1 AND 5),
  feedback_text TEXT,
  safety_checklist JSONB DEFAULT '{}',
  has_safety_concern BOOLEAN DEFAULT false,
  safety_concern_details TEXT,
  is_anonymous BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,

  UNIQUE(room_id, attendee_id)
);

CREATE INDEX IF NOT EXISTS idx_meetup_feedback_room ON public.meetup_feedback(room_id);
CREATE INDEX IF NOT EXISTS idx_meetup_feedback_attendee ON public.meetup_feedback(attendee_id);

-- =============================================================================
-- 사용자 안전 설정 테이블
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.user_safety_settings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  allow_adult_only_meetings BOOLEAN DEFAULT true,
  require_verified_users_only BOOLEAN DEFAULT false,
  share_emergency_contact BOOLEAN DEFAULT false,
  safety_reminder_enabled BOOLEAN DEFAULT true,
  post_meetup_checkin_enabled BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_user_safety_settings_user ON public.user_safety_settings(user_id);

-- =============================================================================
-- 권한 부여
-- =============================================================================
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.emergency_reports TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.privacy_rights_requests TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.admin_notifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.age_verification_logs TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_verification_status TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_verifications TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.meetup_feedback TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.user_safety_settings TO authenticated;

-- Realtime 추가 (알림용)
ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
