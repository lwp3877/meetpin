-- ===================================================================
-- 방 생성 + 호스트 자동 참가 트랜잭션 PostgreSQL 함수
-- 파일: scripts/room-creation-transaction.sql
-- 목적: 방 생성과 호스트 자동 참가를 원자적으로 처리하여 데이터 일관성 보장
-- ===================================================================

-- 방 생성 + 호스트 자동 참가 트랜잭션 함수
CREATE OR REPLACE FUNCTION create_room_with_host_participation(
  host_user_id UUID,
  room_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id UUID;
  room_result JSONB;
  start_time TIMESTAMPTZ;
  min_start_time TIMESTAMPTZ;
BEGIN
  -- 1. 입력 데이터 검증
  IF host_user_id IS NULL THEN
    RAISE EXCEPTION 'host_user_id는 필수입니다';
  END IF;
  
  IF room_data IS NULL THEN
    RAISE EXCEPTION 'room_data는 필수입니다';
  END IF;
  
  -- 2. 시작 시간 검증 (30분 후여야 함)
  start_time := (room_data->>'start_at')::TIMESTAMPTZ;
  min_start_time := NOW() + INTERVAL '30 minutes';
  
  IF start_time < min_start_time THEN
    RAISE EXCEPTION '방 시작 시간은 최소 30분 후여야 합니다';
  END IF;
  
  -- 3. 호스트 사용자 존재 확인
  IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = host_user_id) THEN
    RAISE EXCEPTION '존재하지 않는 사용자입니다';
  END IF;
  
  -- 트랜잭션 시작 (자동으로 BEGIN 처리됨)
  
  -- 4. 방 생성
  INSERT INTO rooms (
    host_uid, 
    title, 
    description, 
    category, 
    lat, 
    lng, 
    place_text, 
    start_at, 
    max_people, 
    fee, 
    visibility,
    created_at,
    updated_at
  )
  VALUES (
    host_user_id,
    room_data->>'title',
    room_data->>'description',
    room_data->>'category',
    (room_data->>'lat')::DECIMAL,
    (room_data->>'lng')::DECIMAL,
    room_data->>'place_text',
    start_time,
    (room_data->>'max_people')::INTEGER,
    (room_data->>'fee')::INTEGER,
    COALESCE(room_data->>'visibility', 'public'),
    NOW(),
    NOW()
  )
  RETURNING id INTO new_room_id;
  
  -- 5. 호스트 자동 참가 (accepted 상태로)
  INSERT INTO requests (
    room_id, 
    requester_uid, 
    status, 
    message,
    created_at,
    updated_at
  )
  VALUES (
    new_room_id, 
    host_user_id, 
    'accepted', 
    '호스트 자동 참가',
    NOW(),
    NOW()
  );
  
  -- 6. 생성된 방 정보 + 호스트 정보 조회하여 반환
  SELECT json_build_object(
    'id', r.id,
    'title', r.title,
    'description', r.description,
    'category', r.category,
    'lat', r.lat,
    'lng', r.lng,
    'place_text', r.place_text,
    'start_at', r.start_at,
    'max_people', r.max_people,
    'fee', r.fee,
    'visibility', r.visibility,
    'host_uid', r.host_uid,
    'created_at', r.created_at,
    'updated_at', r.updated_at,
    'boost_until', r.boost_until,
    'host', json_build_object(
      'id', p.id,
      'nickname', p.nickname,
      'avatar_url', p.avatar_url,
      'age_range', p.age_range,
      'intro', p.intro
    ),
    'participants_count', 1  -- 호스트 포함해서 1명
  )
  INTO room_result
  FROM rooms r
  LEFT JOIN profiles p ON r.host_uid = p.id
  WHERE r.id = new_room_id;
  
  -- 결과 반환 (트랜잭션 자동 COMMIT)
  RETURN room_result;
  
EXCEPTION
  WHEN OTHERS THEN
    -- 에러 발생 시 자동 ROLLBACK
    RAISE EXCEPTION '방 생성 트랜잭션 실패: %', SQLERRM;
END;
$$;

-- ===================================================================
-- 트랜잭션 로깅을 위한 테이블 생성 (모니터링용)
-- ===================================================================

CREATE TABLE IF NOT EXISTS transaction_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  function_name VARCHAR(100) NOT NULL,
  user_id UUID,
  input_data JSONB,
  output_data JSONB,
  execution_time_ms INTEGER,
  success BOOLEAN NOT NULL,
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS 정책 (관리자만 조회 가능)
ALTER TABLE transaction_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "transaction_logs_admin_only" ON transaction_logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'admin'
    )
  );

-- ===================================================================
-- 로깅이 포함된 개선된 방 생성 함수
-- ===================================================================

CREATE OR REPLACE FUNCTION create_room_with_host_participation_logged(
  host_user_id UUID,
  room_data JSONB
) RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id UUID;
  room_result JSONB;
  start_time TIMESTAMPTZ;
  min_start_time TIMESTAMPTZ;
  execution_start TIMESTAMPTZ;
  execution_time INTEGER;
  log_success BOOLEAN := TRUE;
  log_error TEXT := NULL;
BEGIN
  execution_start := NOW();
  
  BEGIN
    -- 기존 로직과 동일
    IF host_user_id IS NULL THEN
      RAISE EXCEPTION 'host_user_id는 필수입니다';
    END IF;
    
    IF room_data IS NULL THEN
      RAISE EXCEPTION 'room_data는 필수입니다';
    END IF;
    
    start_time := (room_data->>'start_at')::TIMESTAMPTZ;
    min_start_time := NOW() + INTERVAL '30 minutes';
    
    IF start_time < min_start_time THEN
      RAISE EXCEPTION '방 시작 시간은 최소 30분 후여야 합니다';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM profiles WHERE id = host_user_id) THEN
      RAISE EXCEPTION '존재하지 않는 사용자입니다';
    END IF;
    
    -- 방 생성
    INSERT INTO rooms (
      host_uid, title, description, category, 
      lat, lng, place_text, start_at, 
      max_people, fee, visibility, created_at, updated_at
    )
    VALUES (
      host_user_id,
      room_data->>'title',
      room_data->>'description',
      room_data->>'category',
      (room_data->>'lat')::DECIMAL,
      (room_data->>'lng')::DECIMAL,
      room_data->>'place_text',
      start_time,
      (room_data->>'max_people')::INTEGER,
      (room_data->>'fee')::INTEGER,
      COALESCE(room_data->>'visibility', 'public'),
      NOW(),
      NOW()
    )
    RETURNING id INTO new_room_id;
    
    -- 호스트 자동 참가
    INSERT INTO requests (
      room_id, requester_uid, status, message, created_at, updated_at
    )
    VALUES (
      new_room_id, host_user_id, 'accepted', '호스트 자동 참가', NOW(), NOW()
    );
    
    -- 결과 조회
    SELECT json_build_object(
      'id', r.id,
      'title', r.title,
      'description', r.description,
      'category', r.category,
      'lat', r.lat,
      'lng', r.lng,
      'place_text', r.place_text,
      'start_at', r.start_at,
      'max_people', r.max_people,
      'fee', r.fee,
      'visibility', r.visibility,
      'host_uid', r.host_uid,
      'created_at', r.created_at,
      'updated_at', r.updated_at,
      'boost_until', r.boost_until,
      'host', json_build_object(
        'id', p.id,
        'nickname', p.nickname,
        'avatar_url', p.avatar_url,
        'age_range', p.age_range,
        'intro', p.intro
      ),
      'participants_count', 1
    )
    INTO room_result
    FROM rooms r
    LEFT JOIN profiles p ON r.host_uid = p.id
    WHERE r.id = new_room_id;
    
  EXCEPTION
    WHEN OTHERS THEN
      log_success := FALSE;
      log_error := SQLERRM;
      RAISE;
  END;
  
  -- 실행 시간 계산
  execution_time := EXTRACT(EPOCH FROM (NOW() - execution_start)) * 1000;
  
  -- 로그 저장 (에러가 발생해도 로그는 저장)
  BEGIN
    INSERT INTO transaction_logs (
      function_name, user_id, input_data, output_data, 
      execution_time_ms, success, error_message
    )
    VALUES (
      'create_room_with_host_participation',
      host_user_id,
      room_data,
      CASE WHEN log_success THEN room_result ELSE NULL END,
      execution_time,
      log_success,
      log_error
    );
  EXCEPTION
    WHEN OTHERS THEN
      -- 로그 저장 실패는 무시 (원본 트랜잭션에 영향 없음)
      NULL;
  END;
  
  RETURN room_result;
END;
$$;

-- ===================================================================
-- 함수 사용 권한 설정
-- ===================================================================

-- 인증된 사용자만 함수 실행 가능
GRANT EXECUTE ON FUNCTION create_room_with_host_participation(UUID, JSONB) TO authenticated;
GRANT EXECUTE ON FUNCTION create_room_with_host_participation_logged(UUID, JSONB) TO authenticated;

-- ===================================================================
-- 사용 예시 (테스트용)
-- ===================================================================

-- 테스트 실행 예시:
/*
SELECT create_room_with_host_participation(
  'user-uuid-here'::UUID,
  '{
    "title": "테스트 모임",
    "description": "트랜잭션 테스트용 모임입니다",
    "category": "drink",
    "lat": 37.5665,
    "lng": 126.9780,
    "place_text": "서울시청",
    "start_at": "2024-12-25T19:00:00Z",
    "max_people": 4,
    "fee": 0,
    "visibility": "public"
  }'::JSONB
);
*/