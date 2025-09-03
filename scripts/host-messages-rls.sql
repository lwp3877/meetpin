-- 호스트 메시지 테이블용 RLS (Row Level Security) 정책
-- 기존 rls.sql에 추가될 정책들

-- 1. host_messages 테이블 RLS 활성화
ALTER TABLE public.host_messages ENABLE ROW LEVEL SECURITY;

-- 2. 호스트 메시지 조회 정책
-- 사용자는 자신이 보낸 메시지와 받은 메시지만 볼 수 있음
CREATE POLICY "host_messages_select_policy" ON public.host_messages
  FOR SELECT USING (
    sender_uid = auth.uid() OR receiver_uid = auth.uid()
  );

-- 3. 호스트 메시지 삽입 정책
-- 사용자는 자신만 sender로 설정할 수 있음
CREATE POLICY "host_messages_insert_policy" ON public.host_messages
  FOR INSERT WITH CHECK (
    sender_uid = auth.uid() AND
    sender_uid != receiver_uid AND
    EXISTS (
      -- 받는 사람이 실제로 해당 방의 호스트인지 확인
      SELECT 1 FROM public.rooms 
      WHERE id = room_id AND host_uid = receiver_uid
    )
  );

-- 4. 호스트 메시지 업데이트 정책
-- 받은 사람만 is_read 상태를 업데이트할 수 있음
CREATE POLICY "host_messages_update_policy" ON public.host_messages
  FOR UPDATE USING (
    receiver_uid = auth.uid()
  ) WITH CHECK (
    receiver_uid = auth.uid() AND
    -- is_read 필드만 업데이트 가능하도록 제한
    text = OLD.text AND
    sender_uid = OLD.sender_uid AND
    receiver_uid = OLD.receiver_uid AND
    room_id = OLD.room_id
  );

-- 5. 호스트 메시지 삭제 정책
-- 보낸 사람과 받은 사람 모두 삭제 가능
CREATE POLICY "host_messages_delete_policy" ON public.host_messages
  FOR DELETE USING (
    sender_uid = auth.uid() OR receiver_uid = auth.uid()
  );

-- 6. 차단된 사용자 간 메시지 차단 정책
-- 차단된 사용자로부터 메시지를 받거나 보낼 수 없음
CREATE POLICY "host_messages_block_policy" ON public.host_messages
  FOR ALL USING (
    NOT EXISTS (
      SELECT 1 FROM public.blocked_users
      WHERE (
        (blocker_uid = sender_uid AND blocked_uid = receiver_uid) OR
        (blocker_uid = receiver_uid AND blocked_uid = sender_uid)
      )
    )
  );

-- 7. 관리자 접근 정책 (모든 권한)
CREATE POLICY "host_messages_admin_policy" ON public.host_messages
  FOR ALL TO authenticated USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  ) WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- 8. 메시지 개수 제한을 위한 함수 (스팸 방지)
CREATE OR REPLACE FUNCTION check_message_rate_limit()
RETURNS TRIGGER AS $$
DECLARE
  message_count INTEGER;
BEGIN
  -- 같은 사용자가 같은 호스트에게 1시간 내 보낸 메시지 수 확인
  SELECT COUNT(*) INTO message_count
  FROM public.host_messages
  WHERE sender_uid = NEW.sender_uid
    AND receiver_uid = NEW.receiver_uid
    AND created_at > NOW() - INTERVAL '1 hour';
  
  -- 1시간에 5개 이상 메시지 보내기 방지
  IF message_count >= 5 THEN
    RAISE EXCEPTION 'Too many messages sent to the same host within 1 hour';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. 메시지 rate limit 트리거
DROP TRIGGER IF EXISTS host_messages_rate_limit_trigger ON public.host_messages;
CREATE TRIGGER host_messages_rate_limit_trigger
  BEFORE INSERT ON public.host_messages
  FOR EACH ROW
  EXECUTE FUNCTION check_message_rate_limit();

-- 10. 메시지 알림 트리거 함수 (실시간 알림용)
CREATE OR REPLACE FUNCTION notify_new_host_message()
RETURNS TRIGGER AS $$
BEGIN
  -- Supabase Realtime을 통한 실시간 알림
  PERFORM pg_notify(
    'host_message:' || NEW.receiver_uid,
    json_build_object(
      'id', NEW.id,
      'sender_uid', NEW.sender_uid,
      'room_id', NEW.room_id,
      'text', NEW.text,
      'created_at', NEW.created_at
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 11. 새 호스트 메시지 알림 트리거
DROP TRIGGER IF EXISTS host_messages_notify_trigger ON public.host_messages;
CREATE TRIGGER host_messages_notify_trigger
  AFTER INSERT ON public.host_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_host_message();

-- 12. 권한 부여 (필요시)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.host_messages TO authenticated;
GRANT USAGE ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 13. 인덱스 성능 최적화 확인 (이미 host-messages.sql에 있음)
-- CREATE INDEX IF NOT EXISTS idx_host_messages_sender_receiver ON public.host_messages(sender_uid, receiver_uid);
-- CREATE INDEX IF NOT EXISTS idx_host_messages_room_created ON public.host_messages(room_id, created_at DESC);

COMMENT ON TABLE public.host_messages IS '호스트에게 직접 보내는 메시지 테이블 - RLS 보안 정책 적용됨';
COMMENT ON POLICY "host_messages_select_policy" ON public.host_messages IS '사용자는 자신이 보내거나 받은 메시지만 조회 가능';
COMMENT ON POLICY "host_messages_insert_policy" ON public.host_messages IS '호스트에게만 메시지 전송 가능, 자기 자신에게는 불가';
COMMENT ON POLICY "host_messages_update_policy" ON public.host_messages IS '받은 사람만 읽음 상태 업데이트 가능';
COMMENT ON POLICY "host_messages_block_policy" ON public.host_messages IS '차단된 사용자 간 메시지 차단';
COMMENT ON FUNCTION check_message_rate_limit() IS '1시간에 5개 메시지 제한으로 스팸 방지';
COMMENT ON FUNCTION notify_new_host_message() IS '새 호스트 메시지 실시간 알림';