-- MeetPin 완전 설정 스크립트 (Production 환경용)
-- 실행 순서: migrate.sql → rls.sql → 이 파일 순서로 실행

-- =============================================================================
-- MISSING TABLES CREATION (host_messages가 빠진 경우 대비)
-- =============================================================================

-- host_messages 테이블이 없는 경우 생성
CREATE TABLE IF NOT EXISTS public.host_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  sender_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 1000),
  CONSTRAINT no_self_message CHECK (sender_uid != receiver_uid)
);

-- RLS 활성화
ALTER TABLE public.host_messages ENABLE ROW LEVEL SECURITY;

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_host_messages_room_id ON public.host_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_host_messages_sender_uid ON public.host_messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_receiver_uid ON public.host_messages(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_created_at ON public.host_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_host_messages_conversation ON public.host_messages(room_id, sender_uid, receiver_uid, created_at DESC);

-- RLS 정책 생성
DROP POLICY IF EXISTS "host_messages_conversation_all" ON public.host_messages;
CREATE POLICY "host_messages_conversation_all" ON public.host_messages
FOR ALL
TO authenticated
USING (
  sender_uid = auth.uid()
  OR receiver_uid = auth.uid()
)
WITH CHECK (
  sender_uid = auth.uid()
  AND sender_uid != receiver_uid
);

-- =============================================================================
-- PERFORMANCE OPTIMIZATIONS
-- =============================================================================

-- 자주 사용하는 복합 쿼리를 위한 추가 인덱스
CREATE INDEX IF NOT EXISTS idx_rooms_active_boost ON public.rooms(visibility, boost_until DESC NULLS LAST, created_at DESC)
WHERE visibility = 'public';

CREATE INDEX IF NOT EXISTS idx_requests_room_status ON public.requests(room_id, status)
WHERE status IN ('pending', 'accepted');

CREATE INDEX IF NOT EXISTS idx_profiles_active ON public.profiles(created_at DESC)
WHERE role = 'user';

-- =============================================================================
-- DATABASE FUNCTIONS FOR COMMON OPERATIONS
-- =============================================================================

-- 방의 현재 참가자 수 계산 함수
CREATE OR REPLACE FUNCTION get_room_participant_count(room_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) + 1 -- 호스트 포함
    FROM requests
    WHERE room_id = room_uuid AND status = 'accepted'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자가 특정 방에 참가 요청했는지 확인
CREATE OR REPLACE FUNCTION user_has_requested_room(user_uuid UUID, room_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM requests
    WHERE requester_uid = user_uuid 
    AND room_id = room_uuid
    AND status IN ('pending', 'accepted')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 읽지 않은 메시지 수 계산
CREATE OR REPLACE FUNCTION get_unread_message_count(user_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*)
    FROM host_messages
    WHERE receiver_uid = user_uuid AND is_read = false
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================================================

-- updated_at 자동 업데이트 함수
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 모든 테이블에 updated_at 트리거 적용
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rooms_updated_at BEFORE UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_requests_updated_at BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_host_messages_updated_at BEFORE UPDATE ON host_messages
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- SYSTEM HEALTH CHECK
-- =============================================================================

-- 시스템 상태 확인 함수
CREATE OR REPLACE FUNCTION system_health_check()
RETURNS TABLE(
  component TEXT,
  status TEXT,
  details TEXT
) AS $$
BEGIN
  -- 데이터베이스 연결 확인
  RETURN QUERY SELECT 'database'::TEXT, 'healthy'::TEXT, 'Database connection successful'::TEXT;
  
  -- 테이블 존재 확인
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'profiles') THEN
    RETURN QUERY SELECT 'tables'::TEXT, 'error'::TEXT, 'Missing profiles table'::TEXT;
  ELSIF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_messages') THEN
    RETURN QUERY SELECT 'tables'::TEXT, 'error'::TEXT, 'Missing host_messages table'::TEXT;
  ELSE
    RETURN QUERY SELECT 'tables'::TEXT, 'healthy'::TEXT, 'All required tables exist'::TEXT;
  END IF;
  
  -- RLS 정책 확인
  IF (SELECT COUNT(*) FROM pg_policies WHERE tablename IN ('profiles', 'rooms', 'requests', 'matches', 'messages', 'host_messages', 'reports', 'blocked_users')) < 8 THEN
    RETURN QUERY SELECT 'rls'::TEXT, 'warning'::TEXT, 'Some RLS policies may be missing'::TEXT;
  ELSE
    RETURN QUERY SELECT 'rls'::TEXT, 'healthy'::TEXT, 'RLS policies configured'::TEXT;
  END IF;
  
  -- 인덱스 확인
  IF (SELECT COUNT(*) FROM pg_indexes WHERE tablename LIKE '%messages%' OR tablename LIKE '%rooms%') < 10 THEN
    RETURN QUERY SELECT 'indexes'::TEXT, 'warning'::TEXT, 'Some performance indexes may be missing'::TEXT;
  ELSE
    RETURN QUERY SELECT 'indexes'::TEXT, 'healthy'::TEXT, 'Performance indexes configured'::TEXT;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =============================================================================
-- FINAL SETUP VERIFICATION
-- =============================================================================

-- 설정 완료 확인
DO $$
BEGIN
  -- 필수 테이블 존재 확인
  IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'host_messages') THEN
    RAISE NOTICE 'Creating missing host_messages table...';
  END IF;
  
  -- RLS 활성화 확인
  IF NOT EXISTS (SELECT 1 FROM pg_class WHERE relname = 'host_messages' AND relrowsecurity = true) THEN
    RAISE NOTICE 'Enabling RLS on host_messages...';
  END IF;
  
  RAISE NOTICE 'MeetPin database setup completed successfully!';
  RAISE NOTICE 'Please verify the setup by running: SELECT * FROM system_health_check();';
END $$;