-- 사용자 안전 및 인증 시스템 테이블 설계
-- 미성년자 보호, 신원 확인, 모임 후 안전 확인 포함

-- 1. 사용자 인증 및 검증 테이블
CREATE TABLE IF NOT EXISTS public.user_verifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verification_type VARCHAR(50) NOT NULL, -- 'phone', 'id_card', 'email', 'age_adult'
  verification_data JSONB, -- 인증 관련 메타데이터 (암호화된 형태)
  status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'verified', 'rejected', 'expired'
  verified_at TIMESTAMP,
  verified_by UUID REFERENCES profiles(id), -- 검증 담당자 (관리자)
  expires_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_verification_type CHECK (verification_type IN ('phone', 'id_card', 'email', 'age_adult')),
  CONSTRAINT valid_status CHECK (status IN ('pending', 'verified', 'rejected', 'expired'))
);

-- 2. 모임 후 피드백 및 안전 확인 테이블
CREATE TABLE IF NOT EXISTS public.meetup_feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  attendee_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  host_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  
  -- 안전 관련 평가
  safety_rating INTEGER CHECK (safety_rating >= 1 AND safety_rating <= 5),
  experience_rating INTEGER CHECK (experience_rating >= 1 AND experience_rating <= 5),
  
  -- 피드백 내용
  feedback_text TEXT,
  
  -- 안전 체크리스트
  safety_checklist JSONB DEFAULT '{
    "met_in_public": null,
    "felt_safe": null,
    "host_was_respectful": null,
    "would_meet_again": null,
    "emergency_contacts_available": null
  }'::jsonb,
  
  -- 신고 관련
  has_safety_concern BOOLEAN DEFAULT FALSE,
  safety_concern_details TEXT,
  
  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  is_anonymous BOOLEAN DEFAULT FALSE -- 익명 피드백 여부
);

-- 3. 연령 인증 로그 테이블 (개인정보보호법 대응)
CREATE TABLE IF NOT EXISTS public.age_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  verification_method VARCHAR(50), -- 'self_declaration', 'id_verification', 'phone_verification'
  age_range VARCHAR(20), -- profiles 테이블의 age_range와 연동
  is_adult BOOLEAN NOT NULL, -- 만 19세 이상 여부
  verification_ip INET, -- 인증 시 IP 주소
  user_agent TEXT, -- 인증 시 사용자 브라우저 정보
  created_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_verification_method CHECK (verification_method IN ('self_declaration', 'id_verification', 'phone_verification'))
);

-- 4. 미성년자 보호 정책 테이블
CREATE TABLE IF NOT EXISTS public.minor_protection_policies (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  policy_name VARCHAR(100) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  policy_data JSONB, -- 정책 상세 규칙
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 5. 사용자 안전 설정 테이블
CREATE TABLE IF NOT EXISTS public.user_safety_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
  
  -- 개인 안전 설정
  allow_adult_only_meetings BOOLEAN DEFAULT TRUE, -- 성인만 참여 가능한 모임 참여 허용
  require_verified_users_only BOOLEAN DEFAULT FALSE, -- 인증된 사용자와만 만남
  share_emergency_contact BOOLEAN DEFAULT FALSE, -- 긴급 연락처 공유 여부
  
  -- 알림 설정
  safety_reminder_enabled BOOLEAN DEFAULT TRUE, -- 모임 전 안전 리마인더
  post_meetup_checkin_enabled BOOLEAN DEFAULT TRUE, -- 모임 후 안전 확인
  
  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- 6. 긴급 상황 신고 테이블
CREATE TABLE IF NOT EXISTS public.emergency_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  
  -- 신고 내용
  emergency_type VARCHAR(50) NOT NULL, -- 'safety_threat', 'harassment', 'fraud', 'other'
  description TEXT NOT NULL,
  location_info TEXT, -- 사건 발생 위치 정보
  
  -- 처리 상태
  status VARCHAR(20) DEFAULT 'reported', -- 'reported', 'investigating', 'resolved', 'dismissed'
  priority_level INTEGER DEFAULT 3 CHECK (priority_level >= 1 AND priority_level <= 5), -- 1: 매우 긴급, 5: 낮음
  
  -- 처리 정보
  assigned_to UUID REFERENCES profiles(id), -- 담당 관리자
  resolution_notes TEXT,
  resolved_at TIMESTAMP,
  
  -- 메타데이터
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  
  CONSTRAINT valid_emergency_type CHECK (emergency_type IN ('safety_threat', 'harassment', 'fraud', 'inappropriate_behavior', 'other')),
  CONSTRAINT valid_status CHECK (status IN ('reported', 'investigating', 'resolved', 'dismissed'))
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_user_verifications_user_id ON user_verifications(user_id);
CREATE INDEX IF NOT EXISTS idx_user_verifications_status ON user_verifications(status);
CREATE INDEX IF NOT EXISTS idx_user_verifications_type_status ON user_verifications(verification_type, status);

CREATE INDEX IF NOT EXISTS idx_meetup_feedback_room_id ON meetup_feedback(room_id);
CREATE INDEX IF NOT EXISTS idx_meetup_feedback_attendee_id ON meetup_feedback(attendee_id);
CREATE INDEX IF NOT EXISTS idx_meetup_feedback_host_id ON meetup_feedback(host_id);
CREATE INDEX IF NOT EXISTS idx_meetup_feedback_safety_concern ON meetup_feedback(has_safety_concern) WHERE has_safety_concern = TRUE;

CREATE INDEX IF NOT EXISTS idx_age_verification_user_id ON age_verification_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_age_verification_adult ON age_verification_logs(is_adult);

CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON emergency_reports(status);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_priority ON emergency_reports(priority_level);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_reported_user ON emergency_reports(reported_user_id);

-- RLS 정책 설정
ALTER TABLE user_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE meetup_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE age_verification_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_safety_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE emergency_reports ENABLE ROW LEVEL SECURITY;

-- user_verifications RLS 정책
CREATE POLICY "user_verifications_own_read" ON user_verifications
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "user_verifications_admin_all" ON user_verifications
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- meetup_feedback RLS 정책
CREATE POLICY "meetup_feedback_own_read" ON meetup_feedback
FOR SELECT TO authenticated
USING (attendee_id = auth.uid() OR host_id = auth.uid());

CREATE POLICY "meetup_feedback_own_write" ON meetup_feedback
FOR INSERT TO authenticated
WITH CHECK (attendee_id = auth.uid());

CREATE POLICY "meetup_feedback_admin_read" ON meetup_feedback
FOR SELECT TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- age_verification_logs RLS 정책
CREATE POLICY "age_verification_own_read" ON age_verification_logs
FOR SELECT TO authenticated
USING (user_id = auth.uid());

CREATE POLICY "age_verification_own_write" ON age_verification_logs
FOR INSERT TO authenticated
WITH CHECK (user_id = auth.uid());

-- user_safety_settings RLS 정책
CREATE POLICY "safety_settings_own_all" ON user_safety_settings
FOR ALL TO authenticated
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- emergency_reports RLS 정책
CREATE POLICY "emergency_reports_own_read" ON emergency_reports
FOR SELECT TO authenticated
USING (reporter_id = auth.uid());

CREATE POLICY "emergency_reports_own_write" ON emergency_reports
FOR INSERT TO authenticated
WITH CHECK (reporter_id = auth.uid());

CREATE POLICY "emergency_reports_admin_all" ON emergency_reports
FOR ALL TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- 트리거 함수: updated_at 자동 업데이트
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
CREATE TRIGGER update_user_verifications_updated_at
    BEFORE UPDATE ON user_verifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_meetup_feedback_updated_at
    BEFORE UPDATE ON meetup_feedback
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_safety_settings_updated_at
    BEFORE UPDATE ON user_safety_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_emergency_reports_updated_at
    BEFORE UPDATE ON emergency_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 기본 미성년자 보호 정책 삽입
INSERT INTO minor_protection_policies (policy_name, description, policy_data) VALUES
(
  'adult_only_service',
  '만 19세 이상 서비스 이용 제한',
  '{
    "min_age": 19,
    "verification_required": true,
    "description": "만 19세 미만 사용자는 서비스를 이용할 수 없습니다.",
    "enforcement": "strict"
  }'::jsonb
),
(
  'safe_meeting_guidelines',
  '안전한 만남을 위한 가이드라인',
  '{
    "public_place_required": true,
    "daytime_meetings_encouraged": true,
    "emergency_contact_sharing": true,
    "post_meeting_checkin": true
  }'::jsonb
)
ON CONFLICT DO NOTHING;

-- 뷰 생성: 사용자 안전 대시보드용
CREATE OR REPLACE VIEW user_safety_dashboard AS
SELECT 
  p.id,
  p.nickname,
  p.age_range,
  -- 인증 상태
  COALESCE(uv_phone.status, 'not_verified') as phone_verification_status,
  COALESCE(uv_adult.status, 'not_verified') as adult_verification_status,
  -- 안전 점수 (피드백 기반)
  COALESCE(AVG(mf.safety_rating), 0) as avg_safety_rating,
  COUNT(mf.id) as total_feedbacks,
  -- 신고 관련
  COUNT(er.id) as reports_against_user,
  -- 마지막 활동
  p.updated_at as last_activity
FROM profiles p
LEFT JOIN user_verifications uv_phone ON p.id = uv_phone.user_id AND uv_phone.verification_type = 'phone'
LEFT JOIN user_verifications uv_adult ON p.id = uv_adult.user_id AND uv_adult.verification_type = 'age_adult'
LEFT JOIN meetup_feedback mf ON p.id = mf.host_id
LEFT JOIN emergency_reports er ON p.id = er.reported_user_id AND er.status != 'dismissed'
GROUP BY p.id, p.nickname, p.age_range, uv_phone.status, uv_adult.status, p.updated_at;

-- 관리자용 뷰: 안전 통계
CREATE OR REPLACE VIEW safety_statistics AS
SELECT 
  COUNT(DISTINCT p.id) as total_users,
  COUNT(DISTINCT CASE WHEN av.is_adult = true THEN av.user_id END) as verified_adults,
  COUNT(DISTINCT CASE WHEN uv.status = 'verified' THEN uv.user_id END) as verified_users,
  COUNT(DISTINCT CASE WHEN er.status = 'reported' THEN er.id END) as pending_reports,
  AVG(mf.safety_rating) as avg_safety_rating,
  COUNT(DISTINCT CASE WHEN mf.has_safety_concern = true THEN mf.id END) as safety_concerns
FROM profiles p
LEFT JOIN age_verification_logs av ON p.id = av.user_id
LEFT JOIN user_verifications uv ON p.id = uv.user_id
LEFT JOIN emergency_reports er ON p.id = er.reported_user_id
LEFT JOIN meetup_feedback mf ON p.id = mf.host_id OR p.id = mf.attendee_id;

COMMENT ON TABLE user_verifications IS '사용자 신원 확인 및 인증 정보';
COMMENT ON TABLE meetup_feedback IS '모임 후 안전 확인 및 피드백';
COMMENT ON TABLE age_verification_logs IS '연령 인증 로그 (개인정보보호법 대응)';
COMMENT ON TABLE emergency_reports IS '긴급 상황 신고 및 처리';
COMMENT ON TABLE user_safety_settings IS '사용자별 안전 설정';