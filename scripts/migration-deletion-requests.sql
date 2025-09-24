-- 계정 삭제 요청 테이블 생성
-- DSAR (Data Subject Access Rights) 지원을 위한 soft delete 시스템

-- 삭제 요청 테이블
CREATE TABLE IF NOT EXISTS deletion_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    reason TEXT NOT NULL DEFAULT 'user_request',
    additional_info TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'cancelled', 'completed')),
    scheduled_deletion_date TIMESTAMPTZ NOT NULL,
    cancelled_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now(),
    
    -- 한 사용자당 하나의 대기 중인 요청만 허용
    UNIQUE(user_id, status) DEFERRABLE INITIALLY DEFERRED
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_deletion_requests_user_id ON deletion_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_status ON deletion_requests(status);
CREATE INDEX IF NOT EXISTS idx_deletion_requests_scheduled_date ON deletion_requests(scheduled_deletion_date);

-- RLS 정책 설정
ALTER TABLE deletion_requests ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 삭제 요청만 조회/수정 가능
CREATE POLICY deletion_requests_user_policy ON deletion_requests
    FOR ALL
    TO authenticated
    USING (user_id = auth.uid());

-- 관리자는 모든 삭제 요청 조회 가능
CREATE POLICY deletion_requests_admin_policy ON deletion_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM profiles 
            WHERE id = auth.uid() AND role = 'admin'
        )
    );

-- profiles 테이블에 삭제 예정 컬럼 추가 (이미 있으면 무시)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'profiles' AND column_name = 'deletion_scheduled_at'
    ) THEN
        ALTER TABLE profiles ADD COLUMN deletion_scheduled_at TIMESTAMPTZ;
    END IF;
END $$;

-- 트리거 함수: 삭제 요청 상태 변경 시 프로필 업데이트
CREATE OR REPLACE FUNCTION update_profile_deletion_status()
RETURNS TRIGGER AS $$
BEGIN
    -- 삭제 요청이 취소되었을 때
    IF NEW.status = 'cancelled' AND OLD.status = 'pending' THEN
        UPDATE profiles 
        SET deletion_scheduled_at = NULL, updated_at = now()
        WHERE id = NEW.user_id;
    END IF;
    
    -- 삭제 요청이 완료되었을 때
    IF NEW.status = 'completed' AND OLD.status = 'pending' THEN
        UPDATE profiles 
        SET deletion_scheduled_at = NULL, updated_at = now()
        WHERE id = NEW.user_id;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 트리거 생성
DROP TRIGGER IF EXISTS trigger_update_profile_deletion_status ON deletion_requests;
CREATE TRIGGER trigger_update_profile_deletion_status
    AFTER UPDATE ON deletion_requests
    FOR EACH ROW
    EXECUTE FUNCTION update_profile_deletion_status();

-- 자동 삭제를 위한 함수 (cron job에서 호출)
CREATE OR REPLACE FUNCTION process_pending_deletions()
RETURNS TABLE(deleted_user_id UUID, deleted_count INTEGER) AS $$
DECLARE
    user_record RECORD;
    deletion_count INTEGER := 0;
BEGIN
    -- 삭제 예정일이 지난 대기 중인 요청들 처리
    FOR user_record IN 
        SELECT user_id, id as request_id
        FROM deletion_requests 
        WHERE status = 'pending' 
        AND scheduled_deletion_date <= now()
    LOOP
        -- 실제 데이터 삭제 (cascade로 연관 데이터도 함께 삭제)
        DELETE FROM profiles WHERE id = user_record.user_id;
        
        -- 삭제 요청 상태 업데이트
        UPDATE deletion_requests 
        SET status = 'completed', completed_at = now()
        WHERE id = user_record.request_id;
        
        deletion_count := deletion_count + 1;
        
        -- 결과 반환
        deleted_user_id := user_record.user_id;
        deleted_count := deletion_count;
        RETURN NEXT;
    END LOOP;
    
    RETURN;
END;
$$ LANGUAGE plpgsql;

-- 삭제 요청 통계를 위한 뷰
CREATE OR REPLACE VIEW deletion_requests_stats AS
SELECT 
    status,
    COUNT(*) as count,
    MIN(created_at) as oldest_request,
    MAX(created_at) as newest_request,
    AVG(EXTRACT(EPOCH FROM (scheduled_deletion_date - created_at))/86400) as avg_grace_period_days
FROM deletion_requests 
GROUP BY status;

-- 만료 예정인 삭제 요청 조회를 위한 뷰
CREATE OR REPLACE VIEW pending_deletions AS
SELECT 
    dr.*,
    p.nickname,
    p.email,
    EXTRACT(EPOCH FROM (dr.scheduled_deletion_date - now()))/86400 as days_remaining
FROM deletion_requests dr
JOIN profiles p ON dr.user_id = p.id
WHERE dr.status = 'pending'
ORDER BY dr.scheduled_deletion_date ASC;

-- 권한 설정
GRANT SELECT ON deletion_requests_stats TO authenticated;
GRANT SELECT ON pending_deletions TO authenticated;

-- 관리자만 실제 삭제 함수 실행 가능
REVOKE EXECUTE ON FUNCTION process_pending_deletions() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION process_pending_deletions() TO service_role;

COMMENT ON TABLE deletion_requests IS 'GDPR/개인정보보호법 준수를 위한 계정 삭제 요청 관리';
COMMENT ON FUNCTION process_pending_deletions() IS '예정된 계정 삭제를 실행하는 함수 (cron job에서 호출)';
COMMENT ON VIEW pending_deletions IS '대기 중인 삭제 요청들과 남은 일수 조회';