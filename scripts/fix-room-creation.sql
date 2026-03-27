-- =====================================================
-- MeetPin - 방 생성 RPC 함수 추가
-- =====================================================
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 실행 시점: migrate.sql 실행 후

-- create_room_with_host_participation 함수
-- 방 생성 시 입력값 검증 후 rooms 테이블에 삽입하고 생성된 방을 반환합니다.
CREATE OR REPLACE FUNCTION public.create_room_with_host_participation(
  host_user_id UUID,
  room_data JSONB
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_room_id UUID;
  result JSONB;
  start_time TIMESTAMPTZ;
BEGIN
  -- 사용자 존재 확인
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE uid = host_user_id) THEN
    RAISE EXCEPTION '존재하지 않는 사용자입니다';
  END IF;

  -- 시작 시간 파싱
  start_time := (room_data->>'start_at')::TIMESTAMPTZ;

  -- 시작 시간 검증 (30분 후 이후여야 함)
  IF start_time < NOW() + INTERVAL '30 minutes' THEN
    RAISE EXCEPTION '시작 시간은 최소 30분 후여야 합니다';
  END IF;

  -- 방 생성
  INSERT INTO public.rooms (
    host_uid,
    title,
    category,
    lat,
    lng,
    place_text,
    start_at,
    max_people,
    fee,
    visibility
  ) VALUES (
    host_user_id,
    room_data->>'title',
    room_data->>'category',
    (room_data->>'lat')::DECIMAL,
    (room_data->>'lng')::DECIMAL,
    room_data->>'place_text',
    start_time,
    COALESCE((room_data->>'max_people')::INTEGER, 4),
    COALESCE((room_data->>'fee')::INTEGER, 0),
    COALESCE(room_data->>'visibility', 'public')
  )
  RETURNING id INTO new_room_id;

  -- 생성된 방 정보 반환
  SELECT to_jsonb(r.*) INTO result
  FROM public.rooms r
  WHERE r.id = new_room_id;

  RETURN result;
END;
$$;

-- 함수 실행 권한 부여
GRANT EXECUTE ON FUNCTION public.create_room_with_host_participation(UUID, JSONB) TO authenticated;
