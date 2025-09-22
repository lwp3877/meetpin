-- 원자적 참가 요청 수락 함수 생성
-- Race condition 방지를 위한 PostgreSQL 함수

CREATE OR REPLACE FUNCTION accept_request_atomically(
  request_id UUID,
  max_capacity INTEGER
) RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  request_record RECORD;
  current_accepted_count INTEGER;
  match_id UUID;
BEGIN
  -- 요청 정보 조회 및 잠금
  SELECT * INTO request_record
  FROM requests
  WHERE id = request_id
  FOR UPDATE;
  
  -- 요청이 존재하지 않거나 이미 처리된 경우
  IF NOT FOUND OR request_record.status != 'pending' THEN
    RETURN FALSE;
  END IF;
  
  -- 현재 수락된 참가자 수 확인 (FOR UPDATE로 잠금)
  SELECT COUNT(*) INTO current_accepted_count
  FROM requests
  WHERE room_id = request_record.room_id
    AND status = 'accepted'
  FOR UPDATE;
  
  -- 방이 가득 찬 경우
  IF current_accepted_count >= (max_capacity - 1) THEN
    RAISE EXCEPTION 'room_full';
  END IF;
  
  -- 요청 상태를 수락으로 변경
  UPDATE requests
  SET status = 'accepted', updated_at = NOW()
  WHERE id = request_id;
  
  -- 매칭 생성 (중복 시 무시)
  INSERT INTO matches (room_id, host_uid, guest_uid)
  SELECT 
    request_record.room_id,
    r.host_uid,
    request_record.requester_uid
  FROM rooms r
  WHERE r.id = request_record.room_id
  ON CONFLICT (room_id, host_uid, guest_uid) DO NOTHING;
  
  RETURN TRUE;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 오류 발생 시 롤백
    RAISE;
END;
$$;

-- 함수 실행 권한 설정
GRANT EXECUTE ON FUNCTION accept_request_atomically(UUID, INTEGER) TO authenticated;
GRANT EXECUTE ON FUNCTION accept_request_atomically(UUID, INTEGER) TO service_role;

-- 코멘트 추가
COMMENT ON FUNCTION accept_request_atomically(UUID, INTEGER) IS 
'원자적으로 참가 요청을 수락하고 매칭을 생성합니다. Race condition을 방지하기 위해 FOR UPDATE 잠금을 사용합니다.';