-- 개인정보 권리 요청 시스템 데이터베이스 스키마
-- GDPR 및 개인정보보호법 준수

-- 1. 개인정보 권리 요청 테이블 생성
CREATE TABLE IF NOT EXISTS privacy_rights_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_type VARCHAR(50) NOT NULL CHECK (request_type IN (
    'data_access', 'data_correction', 'data_deletion', 'data_portability',
    'processing_restriction', 'withdraw_consent', 'objection_processing'
  )),
  reason TEXT NOT NULL,
  specific_data TEXT,
  contact_email VARCHAR(320),
  urgency VARCHAR(10) DEFAULT 'medium' CHECK (urgency IN ('low', 'medium', 'high')),
  legal_basis TEXT,
  preferred_response_method VARCHAR(20) DEFAULT 'email' CHECK (preferred_response_method IN (
    'email', 'app_notification', 'postal_mail'
  )),
  additional_info TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'processing', 'completed', 'rejected', 'cancelled'
  )),
  admin_response TEXT,
  processed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  processed_at TIMESTAMPTZ,
  request_metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_privacy_rights_user_id ON privacy_rights_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_status ON privacy_rights_requests(status);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_type ON privacy_rights_requests(request_type);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_created_at ON privacy_rights_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_privacy_rights_urgency ON privacy_rights_requests(urgency);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_privacy_rights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_privacy_rights_updated_at
  BEFORE UPDATE ON privacy_rights_requests
  FOR EACH ROW
  EXECUTE FUNCTION update_privacy_rights_updated_at();

-- 4. Row Level Security (RLS) 정책
ALTER TABLE privacy_rights_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 조회/생성 가능
CREATE POLICY "Users can view their own privacy requests" ON privacy_rights_requests
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create privacy requests" ON privacy_rights_requests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 요청 조회/수정 가능
CREATE POLICY "Admins can view all privacy requests" ON privacy_rights_requests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update privacy requests" ON privacy_rights_requests
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. 개인정보 처리 현황 추적 테이블
CREATE TABLE IF NOT EXISTS data_processing_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  action_type VARCHAR(50) NOT NULL CHECK (action_type IN (
    'data_export', 'data_deletion', 'data_correction', 'consent_withdrawal',
    'processing_restriction', 'data_access_granted'
  )),
  description TEXT NOT NULL,
  affected_tables TEXT[], -- 영향받은 테이블 목록
  affected_data JSONB, -- 영향받은 데이터 정보
  privacy_request_id UUID REFERENCES privacy_rights_requests(id) ON DELETE SET NULL,
  performed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  automated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 개인정보 동의 이력 테이블
CREATE TABLE IF NOT EXISTS consent_history (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  consent_type VARCHAR(50) NOT NULL CHECK (consent_type IN (
    'service_terms', 'privacy_policy', 'marketing', 'data_collection',
    'location_tracking', 'age_verification', 'notification'
  )),
  consent_status BOOLEAN NOT NULL,
  consent_version VARCHAR(20),
  ip_address INET,
  user_agent TEXT,
  withdrawal_reason TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 관리자 대시보드용 뷰
CREATE OR REPLACE VIEW privacy_requests_dashboard AS
SELECT 
  prr.id,
  prr.request_type,
  prr.reason,
  prr.urgency,
  prr.status,
  prr.created_at,
  prr.updated_at,
  prr.processed_at,
  p.nickname as user_nickname,
  p.email as user_email,
  admin_p.nickname as processed_by_nickname,
  CASE 
    WHEN prr.created_at > NOW() - INTERVAL '1 day' THEN 'new'
    WHEN prr.created_at > NOW() - INTERVAL '7 days' THEN 'recent'
    ELSE 'old'
  END as age_category,
  CASE 
    WHEN prr.status = 'pending' AND prr.created_at < NOW() - INTERVAL '10 days' THEN TRUE
    ELSE FALSE
  END as is_overdue
FROM privacy_rights_requests prr
LEFT JOIN profiles p ON prr.user_id = p.id
LEFT JOIN profiles admin_p ON prr.processed_by = admin_p.id
ORDER BY 
  CASE prr.urgency 
    WHEN 'high' THEN 1
    WHEN 'medium' THEN 2
    WHEN 'low' THEN 3
  END,
  prr.created_at DESC;

-- 8. 통계 뷰
CREATE OR REPLACE VIEW privacy_requests_stats AS
SELECT 
  COUNT(*) as total_requests,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
  COUNT(CASE WHEN status = 'processing' THEN 1 END) as processing_requests,
  COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
  COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '30 days' THEN 1 END) as requests_last_30d,
  COUNT(CASE WHEN urgency = 'high' AND status != 'completed' THEN 1 END) as high_priority_pending,
  AVG(CASE WHEN processed_at IS NOT NULL THEN EXTRACT(EPOCH FROM (processed_at - created_at))/86400 END) as avg_processing_days,
  -- 요청 유형별 통계
  COUNT(CASE WHEN request_type = 'data_deletion' THEN 1 END) as deletion_requests,
  COUNT(CASE WHEN request_type = 'data_access' THEN 1 END) as access_requests,
  COUNT(CASE WHEN request_type = 'data_correction' THEN 1 END) as correction_requests
FROM privacy_rights_requests;

-- 9. 자동 알림 트리거
CREATE OR REPLACE FUNCTION notify_admin_privacy_request()
RETURNS TRIGGER AS $$
BEGIN
  -- 관리자 알림 생성
  INSERT INTO admin_notifications (
    type,
    title,
    message,
    priority,
    reference_id,
    created_at
  ) VALUES (
    'privacy_rights_request',
    '개인정보 권리 요청: ' || NEW.request_type,
    '새로운 개인정보 권리 요청이 접수되었습니다.',
    CASE NEW.urgency WHEN 'high' THEN 'high' ELSE 'medium' END,
    NEW.id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_notify_admin_privacy_request
  AFTER INSERT ON privacy_rights_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_privacy_request();

-- 10. 자동 처리 기한 알림 함수 (크론잡으로 실행)
CREATE OR REPLACE FUNCTION check_overdue_privacy_requests()
RETURNS void AS $$
DECLARE
  overdue_request RECORD;
BEGIN
  -- 10일 이상 미처리된 요청 확인
  FOR overdue_request IN 
    SELECT id, request_type, urgency, created_at
    FROM privacy_rights_requests 
    WHERE status = 'pending' 
    AND created_at < NOW() - INTERVAL '10 days'
  LOOP
    -- 긴급 알림 생성
    INSERT INTO admin_notifications (
      type,
      title,
      message,
      priority,
      reference_id,
      created_at
    ) VALUES (
      'privacy_request_overdue',
      '개인정보 권리 요청 처리 기한 초과',
      '처리 기한을 초과한 개인정보 권리 요청이 있습니다. (요청일: ' || overdue_request.created_at || ')',
      'high',
      overdue_request.id,
      NOW()
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql;

-- 11. 데이터 익명화 함수 (GDPR 잊혀질 권리 구현용)
CREATE OR REPLACE FUNCTION anonymize_user_data(target_user_id UUID)
RETURNS void AS $$
BEGIN
  -- 프로필 익명화
  UPDATE profiles 
  SET 
    nickname = 'anonymous_' || SUBSTRING(id::text, 1, 8),
    email = NULL,
    avatar_url = NULL,
    bio = NULL,
    birth_year = NULL,
    updated_at = NOW()
  WHERE id = target_user_id;
  
  -- 메시지 내용 익명화
  UPDATE messages 
  SET content = '[삭제된 메시지]'
  WHERE sender_id = target_user_id;
  
  -- 방 제목/설명 익명화 (호스트인 경우)
  UPDATE rooms 
  SET 
    title = '[삭제된 방]',
    description = '[삭제된 설명]'
  WHERE host_id = target_user_id;
  
  -- 로그 기록
  INSERT INTO data_processing_log (
    user_id,
    action_type,
    description,
    affected_tables,
    automated
  ) VALUES (
    target_user_id,
    'data_deletion',
    '사용자 요청에 따른 개인정보 익명화 처리',
    ARRAY['profiles', 'messages', 'rooms'],
    FALSE
  );
END;
$$ LANGUAGE plpgsql;

-- 12. 개인정보 내보내기 함수
CREATE OR REPLACE FUNCTION export_user_data(target_user_id UUID)
RETURNS JSON AS $$
DECLARE
  user_data JSON;
BEGIN
  SELECT json_build_object(
    'profile', (
      SELECT json_build_object(
        'id', id,
        'nickname', nickname,
        'email', email,
        'bio', bio,
        'birth_year', birth_year,
        'created_at', created_at,
        'updated_at', updated_at
      ) FROM profiles WHERE id = target_user_id
    ),
    'rooms', (
      SELECT json_agg(json_build_object(
        'id', id,
        'title', title,
        'description', description,
        'created_at', created_at
      )) FROM rooms WHERE host_id = target_user_id
    ),
    'messages', (
      SELECT json_agg(json_build_object(
        'content', content,
        'created_at', created_at
      )) FROM messages WHERE sender_id = target_user_id
    ),
    'requests', (
      SELECT json_agg(json_build_object(
        'status', status,
        'created_at', created_at
      )) FROM requests WHERE user_id = target_user_id
    )
  ) INTO user_data;
  
  -- 로그 기록
  INSERT INTO data_processing_log (
    user_id,
    action_type,
    description,
    affected_tables,
    automated
  ) VALUES (
    target_user_id,
    'data_export',
    '사용자 요청에 따른 개인정보 내보내기',
    ARRAY['profiles', 'rooms', 'messages', 'requests'],
    FALSE
  );
  
  RETURN user_data;
END;
$$ LANGUAGE plpgsql;

-- 완료 메시지
SELECT 'Privacy Rights System Database Schema Created Successfully' as status;