-- 긴급 신고 시스템 데이터베이스 스키마
-- 실행 순서: Supabase SQL Editor에서 실행

-- 1. 긴급 신고 테이블 생성
CREATE TABLE IF NOT EXISTS emergency_reports (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  report_type VARCHAR(50) NOT NULL CHECK (report_type IN (
    'harassment', 'violence', 'fraud', 'inappropriate_behavior', 
    'safety_concern', 'medical_emergency', 'other'
  )),
  description TEXT NOT NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  location_address TEXT,
  room_id UUID REFERENCES rooms(id) ON DELETE SET NULL,
  reported_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN (
    'pending', 'investigating', 'resolved', 'dismissed'
  )),
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN (
    'low', 'medium', 'high', 'critical'
  )),
  admin_notes TEXT,
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 인덱스 생성 (성능 최적화)
CREATE INDEX IF NOT EXISTS idx_emergency_reports_status ON emergency_reports(status);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_created_at ON emergency_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_priority ON emergency_reports(priority);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_reporter ON emergency_reports(reporter_id);
CREATE INDEX IF NOT EXISTS idx_emergency_reports_room ON emergency_reports(room_id);

-- 3. updated_at 자동 업데이트 트리거
CREATE OR REPLACE FUNCTION update_emergency_reports_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_emergency_reports_updated_at
  BEFORE UPDATE ON emergency_reports
  FOR EACH ROW
  EXECUTE FUNCTION update_emergency_reports_updated_at();

-- 4. Row Level Security (RLS) 정책
ALTER TABLE emergency_reports ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 신고만 조회 가능
CREATE POLICY "Users can view their own reports" ON emergency_reports
  FOR SELECT
  USING (auth.uid() = reporter_id);

-- 사용자는 신고 생성 가능
CREATE POLICY "Users can create reports" ON emergency_reports
  FOR INSERT
  WITH CHECK (auth.uid() = reporter_id);

-- 관리자는 모든 신고 조회/수정 가능
CREATE POLICY "Admins can view all reports" ON emergency_reports
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Admins can update reports" ON emergency_reports
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- 5. 관리자 알림용 뷰 생성
CREATE OR REPLACE VIEW emergency_reports_dashboard AS
SELECT 
  er.id,
  er.report_type,
  er.description,
  er.latitude,
  er.longitude,
  er.location_address,
  er.status,
  er.priority,
  er.created_at,
  er.updated_at,
  p_reporter.nickname as reporter_nickname,
  p_reported.nickname as reported_user_nickname,
  r.title as room_title,
  CASE 
    WHEN er.created_at > NOW() - INTERVAL '1 hour' THEN 'urgent'
    WHEN er.created_at > NOW() - INTERVAL '6 hours' THEN 'recent'
    ELSE 'normal'
  END as urgency_level
FROM emergency_reports er
LEFT JOIN profiles p_reporter ON er.reporter_id = p_reporter.id
LEFT JOIN profiles p_reported ON er.reported_user_id = p_reported.id
LEFT JOIN rooms r ON er.room_id = r.id
WHERE er.status != 'resolved'
ORDER BY 
  CASE er.priority 
    WHEN 'critical' THEN 1
    WHEN 'high' THEN 2
    WHEN 'medium' THEN 3
    WHEN 'low' THEN 4
  END,
  er.created_at DESC;

-- 6. 통계 뷰 생성
CREATE OR REPLACE VIEW emergency_reports_stats AS
SELECT 
  COUNT(*) as total_reports,
  COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_reports,
  COUNT(CASE WHEN status = 'investigating' THEN 1 END) as investigating_reports,
  COUNT(CASE WHEN status = 'resolved' THEN 1 END) as resolved_reports,
  COUNT(CASE WHEN created_at > NOW() - INTERVAL '24 hours' THEN 1 END) as reports_last_24h,
  COUNT(CASE WHEN priority = 'critical' AND status != 'resolved' THEN 1 END) as critical_pending,
  AVG(CASE WHEN resolved_at IS NOT NULL THEN EXTRACT(EPOCH FROM (resolved_at - created_at))/3600 END) as avg_resolution_hours
FROM emergency_reports;

-- 7. 자동 우선순위 설정 함수
CREATE OR REPLACE FUNCTION set_emergency_report_priority()
RETURNS TRIGGER AS $$
BEGIN
  -- 의료 응급상황은 항상 critical
  IF NEW.report_type = 'medical_emergency' THEN
    NEW.priority = 'critical';
  -- 폭력이나 괴롭힘은 high
  ELSIF NEW.report_type IN ('violence', 'harassment') THEN
    NEW.priority = 'high';
  -- 안전 우려사항은 medium
  ELSIF NEW.report_type = 'safety_concern' THEN
    NEW.priority = 'medium';
  -- 나머지는 medium 유지
  ELSE
    NEW.priority = COALESCE(NEW.priority, 'medium');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_emergency_report_priority
  BEFORE INSERT ON emergency_reports
  FOR EACH ROW
  EXECUTE FUNCTION set_emergency_report_priority();

-- 8. 관리자 알림 트리거 (실제 구현시 웹훅이나 이메일 연동)
CREATE OR REPLACE FUNCTION notify_admin_emergency_report()
RETURNS TRIGGER AS $$
BEGIN
  -- 여기서는 로그만 남기고, 실제로는 외부 알림 시스템 연동
  INSERT INTO admin_notifications (
    type,
    title,
    message,
    priority,
    reference_id,
    created_at
  ) VALUES (
    'emergency_report',
    '긴급 신고 접수: ' || NEW.report_type,
    '새로운 긴급 신고가 접수되었습니다. 신고 유형: ' || NEW.report_type,
    NEW.priority,
    NEW.id,
    NOW()
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- admin_notifications 테이블이 없다면 생성
CREATE TABLE IF NOT EXISTS admin_notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type VARCHAR(50) NOT NULL,
  title VARCHAR(200) NOT NULL,
  message TEXT NOT NULL,
  priority VARCHAR(10) DEFAULT 'medium',
  reference_id UUID,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TRIGGER trigger_notify_admin_emergency_report
  AFTER INSERT ON emergency_reports
  FOR EACH ROW
  EXECUTE FUNCTION notify_admin_emergency_report();

-- 9. 데이터 검증 및 정리
-- 익명 신고 허용 (reporter_id가 NULL일 수 있음)
ALTER TABLE emergency_reports ALTER COLUMN reporter_id DROP NOT NULL;

-- 설명 최소 길이 검증
ALTER TABLE emergency_reports ADD CONSTRAINT check_description_length 
  CHECK (LENGTH(TRIM(description)) >= 10);

-- 위치 정보 유효성 검증
ALTER TABLE emergency_reports ADD CONSTRAINT check_latitude_range 
  CHECK (latitude IS NULL OR (latitude >= -90 AND latitude <= 90));

ALTER TABLE emergency_reports ADD CONSTRAINT check_longitude_range 
  CHECK (longitude IS NULL OR (longitude >= -180 AND longitude <= 180));

-- 완료 메시지
SELECT 'Emergency Report System Database Schema Created Successfully' as status;