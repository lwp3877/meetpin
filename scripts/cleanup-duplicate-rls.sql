-- ===================================================================
-- RLS 중복 정책 정리 스크립트
-- 파일: scripts/cleanup-duplicate-rls.sql
-- 목적: emergency_reports와 host_messages 테이블의 중복 RLS 정책 정리
-- ===================================================================

-- 실행 전 주의사항:
-- 1. 프로덕션 DB에서는 반드시 백업 후 실행
-- 2. 스테이징 환경에서 먼저 테스트
-- 3. 정책 삭제 후 반드시 기능 테스트 수행

-- ===================================================================
-- 1. emergency_reports 테이블 중복 정책 정리
-- ===================================================================

-- 기존 중복 정책들 확인 (정보 조회용)
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'emergency_reports'
ORDER BY policyname;

-- 중복 정책 제거 (emergency-report-system.sql의 정책 유지)
-- user-safety-system.sql에서 생성된 중복 정책들 제거

DROP POLICY IF EXISTS "emergency_reports_insert_policy" ON emergency_reports;
DROP POLICY IF EXISTS "emergency_reports_select_policy" ON emergency_reports;
DROP POLICY IF EXISTS "emergency_reports_own_read" ON emergency_reports;
DROP POLICY IF EXISTS "emergency_reports_own_write" ON emergency_reports;

-- emergency-report-system.sql의 올바른 정책들은 유지됨:
-- - emergency_reports_public_insert (익명 신고 허용)
-- - emergency_reports_admin_select (관리자 조회)
-- - emergency_reports_own_select (본인 신고 조회)

-- ===================================================================
-- 2. host_messages 테이블 중복 정책 정리  
-- ===================================================================

-- 기존 중복 정책들 확인
SELECT 
  schemaname, 
  tablename, 
  policyname, 
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE tablename = 'host_messages'
ORDER BY policyname;

-- 중복 정책 제거
-- 여러 파일에서 생성된 중복 정책들 정리

-- 기존 중복 정책들 제거
DROP POLICY IF EXISTS "host_messages_insert_policy" ON host_messages;
DROP POLICY IF EXISTS "host_messages_select_policy" ON host_messages;
DROP POLICY IF EXISTS "host_messages_own_read" ON host_messages;
DROP POLICY IF EXISTS "host_messages_own_write" ON host_messages;
DROP POLICY IF EXISTS "host_messages_participants_read" ON host_messages;
DROP POLICY IF EXISTS "host_messages_sender_policy" ON host_messages;
DROP POLICY IF EXISTS "host_messages_recipient_policy" ON host_messages;

-- 최종 통합 정책 생성 (host-messages-rls.sql 기반)
CREATE POLICY "host_messages_comprehensive_policy" ON host_messages
  FOR ALL USING (
    -- 발신자(호스트)는 자신이 보낸 메시지에 접근 가능
    sender_uid = auth.uid()
    OR
    -- 수신자는 자신에게 온 메시지에 접근 가능  
    recipient_uid = auth.uid()
    OR
    -- 관리자는 모든 메시지에 접근 가능
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===================================================================
-- 3. 정책 정리 검증
-- ===================================================================

-- emergency_reports 최종 정책 확인
SELECT 
  'emergency_reports' as table_name,
  policyname, 
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'INSERT' THEN '삽입 정책'
    WHEN cmd = 'SELECT' THEN '조회 정책'
    WHEN cmd = 'ALL' THEN '전체 정책'
    ELSE cmd
  END as policy_type
FROM pg_policies 
WHERE tablename = 'emergency_reports'
ORDER BY cmd, policyname;

-- host_messages 최종 정책 확인  
SELECT 
  'host_messages' as table_name,
  policyname, 
  cmd,
  permissive,
  CASE 
    WHEN cmd = 'INSERT' THEN '삽입 정책'
    WHEN cmd = 'SELECT' THEN '조회 정책'
    WHEN cmd = 'ALL' THEN '전체 정책'
    ELSE cmd
  END as policy_type
FROM pg_policies 
WHERE tablename = 'host_messages'
ORDER BY cmd, policyname;

-- ===================================================================
-- 4. 정책 테스트 쿼리
-- ===================================================================

-- emergency_reports 정책 테스트 (실제 사용자로 테스트)
-- 관리자가 아닌 사용자로 실행:
/*
SELECT COUNT(*) FROM emergency_reports; -- 본인 신고만 조회되어야 함
INSERT INTO emergency_reports (report_type, description) 
VALUES ('test', 'RLS 정책 테스트'); -- 성공해야 함
*/

-- host_messages 정책 테스트
-- 일반 사용자로 실행:
/*
SELECT COUNT(*) FROM host_messages; -- 본인 관련 메시지만 조회되어야 함
*/

-- ===================================================================
-- 5. 롤백 스크립트 (문제 발생 시 사용)
-- ===================================================================

-- 문제 발생 시 원래 정책들을 복원하는 스크립트:
/*
-- emergency_reports 원복
DROP POLICY IF EXISTS "emergency_reports_public_insert" ON emergency_reports;
DROP POLICY IF EXISTS "emergency_reports_admin_select" ON emergency_reports;
DROP POLICY IF EXISTS "emergency_reports_own_select" ON emergency_reports;

-- host_messages 원복
DROP POLICY IF EXISTS "host_messages_comprehensive_policy" ON host_messages;

-- 원래 정책들 재생성 (각 개별 파일의 정책들을 다시 실행)
*/

-- ===================================================================
-- 실행 완료 로그
-- ===================================================================

INSERT INTO transaction_logs (
  function_name, 
  user_id, 
  input_data, 
  output_data, 
  execution_time_ms, 
  success, 
  error_message
) VALUES (
  'cleanup_duplicate_rls',
  NULL, -- 시스템 작업
  '{"tables": ["emergency_reports", "host_messages"]}'::JSONB,
  '{"message": "RLS 중복 정책 정리 완료"}'::JSONB,
  0, -- 수동 실행이므로 0
  TRUE,
  NULL
);

-- 정리 완료 메시지
SELECT 'RLS 중복 정책 정리가 완료되었습니다. 각 테이블의 정책을 확인하세요.' as status;