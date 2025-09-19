-- MeetPin Database Triggers and Business Logic
-- Version: 1.0.0
-- Created: 2025-01-15

-- ============================================================================
-- 1. 프로필 자동 생성 트리거 (회원가입 시)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_profile_for_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (uid, nickname, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'nickname', '사용자' || substr(NEW.id::text, 1, 8)),
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- auth.users 테이블에 새 사용자가 생성될 때 프로필 자동 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION create_profile_for_new_user();

-- ============================================================================
-- 2. 매칭 자동 생성 트리거 (참가 신청 수락 시)
-- ============================================================================

CREATE OR REPLACE FUNCTION create_match_on_request_accepted()
RETURNS TRIGGER AS $$
DECLARE
  room_host_id UUID;
BEGIN
  -- 요청이 수락된 경우에만 실행
  IF NEW.status = 'accepted' AND (OLD.status IS NULL OR OLD.status != 'accepted') THEN
    
    -- 방 호스트 ID 조회
    SELECT host_uid INTO room_host_id 
    FROM rooms 
    WHERE id = NEW.room_id;
    
    -- 호스트와 참가자 간의 매칭 생성
    INSERT INTO matches (room_id, user1_id, user2_id)
    VALUES (
      NEW.room_id,
      LEAST(room_host_id, NEW.user_id),
      GREATEST(room_host_id, NEW.user_id)
    )
    ON CONFLICT DO NOTHING; -- 중복 방지
    
    -- 수락 알림 생성
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'request_accepted',
      '참가 신청이 수락되었습니다!',
      '축하합니다! 모임에 참가하게 되었습니다. 이제 호스트와 1:1 채팅을 시작할 수 있습니다.',
      jsonb_build_object('room_id', NEW.room_id, 'request_id', NEW.id)
    );
    
    -- 호스트에게도 알림
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      room_host_id,
      'room_request',
      '새로운 참가자가 합류했습니다',
      '모임에 새로운 참가자가 합류했습니다. 따뜻하게 맞이해 주세요!',
      jsonb_build_object('room_id', NEW.room_id, 'participant_id', NEW.user_id)
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_request_accepted
  AFTER UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION create_match_on_request_accepted();

-- ============================================================================
-- 3. 신청 거절 알림 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_request_rejected()
RETURNS TRIGGER AS $$
BEGIN
  -- 요청이 거절된 경우
  IF NEW.status = 'rejected' AND (OLD.status IS NULL OR OLD.status != 'rejected') THEN
    
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'request_rejected',
      '참가 신청이 거절되었습니다',
      '아쉽게도 이번 모임에는 참가할 수 없게 되었습니다. 다른 멋진 모임을 찾아보세요!',
      jsonb_build_object('room_id', NEW.room_id, 'request_id', NEW.id)
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_request_rejected
  AFTER UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION notify_on_request_rejected();

-- ============================================================================
-- 4. 새 메시지 알림 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_new_message()
RETURNS TRIGGER AS $$
DECLARE
  match_record RECORD;
  recipient_id UUID;
  sender_nickname TEXT;
BEGIN
  -- 매칭 정보 조회
  SELECT m.user1_id, m.user2_id, m.room_id
  INTO match_record
  FROM matches m
  WHERE m.id = NEW.match_id;
  
  -- 수신자 결정
  IF match_record.user1_id = NEW.sender_id THEN
    recipient_id := match_record.user2_id;
  ELSE
    recipient_id := match_record.user1_id;
  END IF;
  
  -- 발신자 닉네임 조회
  SELECT nickname INTO sender_nickname
  FROM profiles
  WHERE uid = NEW.sender_id;
  
  -- 메시지 알림 생성
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    recipient_id,
    'new_message',
    format('%s님이 메시지를 보냈습니다', sender_nickname),
    CASE 
      WHEN NEW.message_type = 'text' THEN 
        CASE 
          WHEN length(NEW.content) > 50 THEN substring(NEW.content, 1, 50) || '...'
          ELSE NEW.content
        END
      WHEN NEW.message_type = 'image' THEN '📷 이미지를 보냈습니다'
      ELSE '메시지를 확인해보세요'
    END,
    jsonb_build_object(
      'match_id', NEW.match_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id,
      'room_id', match_record.room_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_new_message
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_new_message();

-- ============================================================================
-- 5. 호스트 메시지 알림 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_host_message()
RETURNS TRIGGER AS $$
DECLARE
  room_host_id UUID;
  sender_nickname TEXT;
BEGIN
  -- 방 호스트 ID 조회
  SELECT host_uid INTO room_host_id
  FROM rooms
  WHERE id = NEW.room_id;
  
  -- 발신자 닉네임 조회
  SELECT nickname INTO sender_nickname
  FROM profiles
  WHERE uid = NEW.sender_id;
  
  -- 호스트에게 알림 생성
  INSERT INTO notifications (user_id, type, title, message, metadata)
  VALUES (
    room_host_id,
    'host_message',
    format('%s님이 메시지를 보냈습니다', sender_nickname),
    CASE 
      WHEN length(NEW.content) > 50 THEN substring(NEW.content, 1, 50) || '...'
      ELSE NEW.content
    END,
    jsonb_build_object(
      'room_id', NEW.room_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id
    )
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_host_message
  AFTER INSERT ON host_messages
  FOR EACH ROW EXECUTE FUNCTION notify_on_host_message();

-- ============================================================================
-- 6. 방 취소 알림 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_on_room_cancelled()
RETURNS TRIGGER AS $$
DECLARE
  participant_record RECORD;
BEGIN
  -- 방이 취소된 경우
  IF NEW.status = 'cancelled' AND (OLD.status IS NULL OR OLD.status != 'cancelled') THEN
    
    -- 모든 참가자에게 알림
    FOR participant_record IN 
      SELECT user_id FROM requests 
      WHERE room_id = NEW.id AND status = 'accepted'
    LOOP
      INSERT INTO notifications (user_id, type, title, message, metadata)
      VALUES (
        participant_record.user_id,
        'room_cancelled',
        '모임이 취소되었습니다',
        format('"%s" 모임이 호스트에 의해 취소되었습니다.', NEW.title),
        jsonb_build_object('room_id', NEW.id, 'room_title', NEW.title)
      );
    END LOOP;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_room_cancelled
  AFTER UPDATE ON rooms
  FOR EACH ROW EXECUTE FUNCTION notify_on_room_cancelled();

-- ============================================================================
-- 7. 부스트 만료 알림 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION notify_boost_expiry()
RETURNS void AS $$
DECLARE
  room_record RECORD;
BEGIN
  -- 24시간 내에 만료되는 부스트가 있는 방들
  FOR room_record IN 
    SELECT r.id, r.title, r.host_uid 
    FROM rooms r
    WHERE r.boost_until IS NOT NULL 
      AND r.boost_until > NOW()
      AND r.boost_until <= NOW() + INTERVAL '24 hours'
      AND NOT EXISTS (
        SELECT 1 FROM notifications n
        WHERE n.user_id = r.host_uid 
          AND n.type = 'boost_reminder'
          AND n.metadata->>'room_id' = r.id::text
          AND n.created_at > NOW() - INTERVAL '24 hours'
      )
  LOOP
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      room_record.host_uid,
      'boost_reminder',
      '부스트가 곧 만료됩니다',
      format('"%s" 모임의 부스트가 24시간 내에 만료됩니다. 연장을 원하시면 부스트를 갱신해주세요.', room_record.title),
      jsonb_build_object('room_id', room_record.id, 'room_title', room_record.title)
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 부스트 만료 알림을 위한 cron job 함수 (pg_cron 필요)
-- SELECT cron.schedule('boost-expiry-check', '0 */6 * * *', 'SELECT notify_boost_expiry();');

-- ============================================================================
-- 8. 결제 완료 시 부스트 적용 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION apply_boost_on_payment_success()
RETURNS TRIGGER AS $$
DECLARE
  boost_duration INTERVAL;
BEGIN
  -- 결제가 성공된 경우에만 실행
  IF NEW.status = 'succeeded' AND (OLD.status IS NULL OR OLD.status != 'succeeded') THEN
    
    -- 플랜에 따른 부스트 기간 계산
    CASE NEW.plan_type
      WHEN '1day' THEN boost_duration := INTERVAL '1 day';
      WHEN '3days' THEN boost_duration := INTERVAL '3 days';
      WHEN '7days' THEN boost_duration := INTERVAL '7 days';
      ELSE boost_duration := INTERVAL '1 day';
    END CASE;
    
    -- 방에 부스트 적용
    UPDATE rooms 
    SET boost_until = GREATEST(
      COALESCE(boost_until, NOW()),
      NOW()
    ) + boost_duration,
    updated_at = NOW()
    WHERE id = NEW.room_id;
    
    -- 결제 기록에 부스트 기간 업데이트
    UPDATE payment_records
    SET 
      boost_start_at = NOW(),
      boost_end_at = NOW() + boost_duration,
      updated_at = NOW()
    WHERE id = NEW.id;
    
    -- 부스트 적용 알림
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (
      NEW.user_id,
      'boost_applied',
      '부스트가 적용되었습니다!',
      format('결제가 완료되어 %s 부스트가 적용되었습니다. 모임이 상위에 노출됩니다.', NEW.plan_type),
      jsonb_build_object(
        'room_id', NEW.room_id,
        'payment_id', NEW.id,
        'plan_type', NEW.plan_type,
        'boost_until', NOW() + boost_duration
      )
    );
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_payment_success
  AFTER UPDATE ON payment_records
  FOR EACH ROW EXECUTE FUNCTION apply_boost_on_payment_success();

-- ============================================================================
-- 9. 방 참가자 수 검증 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION validate_room_capacity()
RETURNS TRIGGER AS $$
DECLARE
  current_participants INTEGER;
  max_capacity INTEGER;
BEGIN
  -- 요청이 수락되는 경우에만 검증
  IF NEW.status = 'accepted' THEN
    
    -- 현재 참가자 수와 최대 인원 조회
    SELECT 
      COUNT(*) + 1, -- +1은 호스트
      r.max_people
    INTO current_participants, max_capacity
    FROM requests req
    JOIN rooms r ON r.id = req.room_id
    WHERE req.room_id = NEW.room_id 
      AND req.status = 'accepted'
    GROUP BY r.max_people;
    
    -- 정원 초과 방지
    IF current_participants > max_capacity THEN
      RAISE EXCEPTION '모임 정원이 초과되었습니다. (현재: %, 최대: %)', current_participants, max_capacity;
    END IF;
    
    -- 정원이 가득 찬 경우 호스트에게 알림
    IF current_participants = max_capacity THEN
      INSERT INTO notifications (
        user_id, type, title, message, metadata
      )
      SELECT 
        r.host_uid,
        'room_full',
        '모임이 가득 찼습니다!',
        format('"%s" 모임의 정원이 가득 찼습니다. (%d/%d명)', r.title, current_participants, max_capacity),
        jsonb_build_object('room_id', r.id, 'participant_count', current_participants)
      FROM rooms r
      WHERE r.id = NEW.room_id;
    END IF;
    
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER validate_room_capacity_trigger
  BEFORE UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION validate_room_capacity();

-- ============================================================================
-- 10. 중복 신청 방지 트리거
-- ============================================================================

CREATE OR REPLACE FUNCTION prevent_duplicate_requests()
RETURNS TRIGGER AS $$
BEGIN
  -- 이미 수락된 신청이 있는지 확인
  IF EXISTS (
    SELECT 1 FROM requests 
    WHERE room_id = NEW.room_id 
      AND user_id = NEW.user_id 
      AND status = 'accepted'
      AND id != COALESCE(NEW.id, gen_random_uuid())
  ) THEN
    RAISE EXCEPTION '이미 이 모임에 참가하고 있습니다.';
  END IF;
  
  -- 호스트가 자신의 방에 신청하는 것 방지
  IF EXISTS (
    SELECT 1 FROM rooms 
    WHERE id = NEW.room_id AND host_uid = NEW.user_id
  ) THEN
    RAISE EXCEPTION '자신이 만든 모임에는 신청할 수 없습니다.';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER prevent_duplicate_requests_trigger
  BEFORE INSERT OR UPDATE ON requests
  FOR EACH ROW EXECUTE FUNCTION prevent_duplicate_requests();

-- ============================================================================
-- 11. 자동 알림 정리 트리거 (30일 이상 된 읽은 알림 삭제)
-- ============================================================================

CREATE OR REPLACE FUNCTION cleanup_old_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications 
  WHERE is_read = true 
    AND created_at < NOW() - INTERVAL '30 days';
    
  -- 90일 이상 된 미읽음 알림도 정리
  DELETE FROM notifications 
  WHERE created_at < NOW() - INTERVAL '90 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 매일 새벽 2시에 알림 정리 실행 (pg_cron 필요)
-- SELECT cron.schedule('cleanup-notifications', '0 2 * * *', 'SELECT cleanup_old_notifications();');

-- ============================================================================
-- 12. 실시간 업데이트를 위한 알림 함수
-- ============================================================================

-- 새 메시지에 대한 실시간 알림
CREATE OR REPLACE FUNCTION notify_realtime_message()
RETURNS TRIGGER AS $$
DECLARE
  match_info RECORD;
  recipient_id UUID;
BEGIN
  -- 매칭 정보 및 수신자 결정
  SELECT m.user1_id, m.user2_id, m.room_id 
  INTO match_info
  FROM matches m 
  WHERE m.id = NEW.match_id;
  
  recipient_id := CASE 
    WHEN match_info.user1_id = NEW.sender_id THEN match_info.user2_id
    ELSE match_info.user1_id
  END;
  
  -- 실시간 알림 발송
  PERFORM pg_notify(
    'realtime:messages',
    json_build_object(
      'type', 'new_message',
      'payload', json_build_object(
        'message_id', NEW.id,
        'match_id', NEW.match_id,
        'sender_id', NEW.sender_id,
        'recipient_id', recipient_id,
        'room_id', match_info.room_id,
        'content', NEW.content,
        'message_type', NEW.message_type,
        'created_at', NEW.created_at
      )
    )::text
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER realtime_message_trigger
  AFTER INSERT ON messages
  FOR EACH ROW EXECUTE FUNCTION notify_realtime_message();

-- ============================================================================
-- 트리거 적용 완료 로그
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'MeetPin triggers and business logic applied successfully!';
  RAISE NOTICE 'Triggers created: 12';
  RAISE NOTICE 'Business logic functions: 10';
  RAISE NOTICE 'Next step: Insert seed data (004-seed-data.sql)';
END $$;