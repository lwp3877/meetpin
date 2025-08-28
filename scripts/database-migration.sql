-- 파일경로: scripts/database-migration.sql
-- MeetPin 데이터베이스 마이그레이션 스크립트
-- 기존 데이터베이스를 최신 스키마로 업데이트하고 성능 최적화를 수행합니다.

-- =============================================================================
-- 마이그레이션 버전 관리
-- =============================================================================

-- 마이그레이션 히스토리 테이블 생성
CREATE TABLE IF NOT EXISTS migration_history (
  id SERIAL PRIMARY KEY,
  version VARCHAR(50) NOT NULL UNIQUE,
  description TEXT NOT NULL,
  applied_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  applied_by TEXT DEFAULT current_user,
  execution_time_ms INTEGER,
  checksum TEXT
);

-- 현재 마이그레이션 정보
DO $$
DECLARE
  migration_version TEXT := '2024.01.15.001';
  migration_description TEXT := 'Performance optimization and schema updates';
  start_time TIMESTAMP;
  end_time TIMESTAMP;
  execution_time INTEGER;
BEGIN
  -- 이미 적용된 마이그레이션인지 확인
  IF EXISTS (SELECT 1 FROM migration_history WHERE version = migration_version) THEN
    RAISE NOTICE '마이그레이션 % 이미 적용됨', migration_version;
    RETURN;
  END IF;
  
  start_time := clock_timestamp();
  RAISE NOTICE '마이그레이션 % 시작: %', migration_version, migration_description;

  -- =============================================================================
  -- 1. 기존 테이블 스키마 업데이트
  -- =============================================================================
  
  RAISE NOTICE '1. 기존 테이블 스키마 업데이트 중...';
  
  -- profiles 테이블 개선
  DO $profiles_update$
  BEGIN
    -- location_lat, location_lng 컬럼 추가 (없는 경우에만)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location_lat') THEN
      ALTER TABLE profiles ADD COLUMN location_lat DECIMAL(10, 8);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'location_lng') THEN
      ALTER TABLE profiles ADD COLUMN location_lng DECIMAL(11, 8);
    END IF;
    
    -- last_active_at 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'last_active_at') THEN
      ALTER TABLE profiles ADD COLUMN last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
    END IF;
    
    -- profile_image_url 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'profile_image_url') THEN
      ALTER TABLE profiles ADD COLUMN profile_image_url TEXT;
    END IF;
    
    RAISE NOTICE '  ✅ profiles 테이블 업데이트 완료';
  END $profiles_update$;
  
  -- rooms 테이블 개선
  DO $rooms_update$
  BEGIN
    -- image_urls 컬럼 추가 (JSON 배열)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'image_urls') THEN
      ALTER TABLE rooms ADD COLUMN image_urls JSONB DEFAULT '[]'::jsonb;
    END IF;
    
    -- hashtags 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'hashtags') THEN
      ALTER TABLE rooms ADD COLUMN hashtags TEXT[] DEFAULT ARRAY[]::TEXT[];
    END IF;
    
    -- age_restriction 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'age_restriction') THEN
      ALTER TABLE rooms ADD COLUMN age_restriction JSONB DEFAULT '{"min": null, "max": null}'::jsonb;
    END IF;
    
    -- gender_restriction 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'gender_restriction') THEN
      ALTER TABLE rooms ADD COLUMN gender_restriction TEXT CHECK (gender_restriction IN ('male_only', 'female_only', 'mixed'));
    END IF;
    
    -- recurring_pattern 컬럼 추가 (정기 모임)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'rooms' AND column_name = 'recurring_pattern') THEN
      ALTER TABLE rooms ADD COLUMN recurring_pattern JSONB;
    END IF;
    
    RAISE NOTICE '  ✅ rooms 테이블 업데이트 완료';
  END $rooms_update$;
  
  -- messages 테이블 개선
  DO $messages_update$
  BEGIN
    -- message_type 컬럼 추가 (text, image, system, location 등)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'message_type') THEN
      ALTER TABLE messages ADD COLUMN message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system', 'location'));
    END IF;
    
    -- metadata 컬럼 추가 (이미지 URL, 위치 정보 등)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'metadata') THEN
      ALTER TABLE messages ADD COLUMN metadata JSONB DEFAULT '{}'::jsonb;
    END IF;
    
    -- is_read 컬럼 추가
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'is_read') THEN
      ALTER TABLE messages ADD COLUMN is_read BOOLEAN DEFAULT FALSE;
    END IF;
    
    -- reply_to_id 컬럼 추가 (답글 기능)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'messages' AND column_name = 'reply_to_id') THEN
      ALTER TABLE messages ADD COLUMN reply_to_id UUID REFERENCES messages(id);
    END IF;
    
    RAISE NOTICE '  ✅ messages 테이블 업데이트 완료';
  END $messages_update$;

  -- =============================================================================
  -- 2. 새로운 테이블 생성
  -- =============================================================================
  
  RAISE NOTICE '2. 새로운 테이블 생성 중...';
  
  -- 사용자 활동 로그 테이블
  CREATE TABLE IF NOT EXISTS user_activity_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN ('login', 'logout', 'create_room', 'join_room', 'send_message', 'report_user', 'block_user')),
    metadata JSONB DEFAULT '{}'::jsonb,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- 알림 테이블
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('new_message', 'request_accepted', 'request_rejected', 'room_updated', 'system_announcement')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- 사용자 선호도 테이블
  CREATE TABLE IF NOT EXISTS user_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE UNIQUE,
    preferred_categories TEXT[] DEFAULT ARRAY[]::TEXT[],
    preferred_locations JSONB DEFAULT '[]'::jsonb,
    preferred_times JSONB DEFAULT '{}'::jsonb,
    max_travel_distance INTEGER DEFAULT 5000, -- 미터 단위
    age_range JSONB DEFAULT '{"min": 18, "max": 65}'::jsonb,
    notification_settings JSONB DEFAULT '{"push": true, "email": true, "sms": false}'::jsonb,
    privacy_settings JSONB DEFAULT '{"show_location": true, "show_age": true, "show_phone": false}'::jsonb,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  
  -- 모임 평가 테이블
  CREATE TABLE IF NOT EXISTS room_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    room_id UUID NOT NULL REFERENCES rooms(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    host_rating INTEGER CHECK (host_rating >= 1 AND host_rating <= 5),
    venue_rating INTEGER CHECK (venue_rating >= 1 AND venue_rating <= 5),
    overall_rating INTEGER CHECK (overall_rating >= 1 AND overall_rating <= 5),
    comment TEXT,
    is_anonymous BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(room_id, reviewer_id)
  );
  
  -- 시스템 설정 테이블
  CREATE TABLE IF NOT EXISTS system_settings (
    key TEXT PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_by UUID REFERENCES profiles(id)
  );
  
  RAISE NOTICE '  ✅ 새로운 테이블 생성 완료';

  -- =============================================================================
  -- 3. 인덱스 생성 및 최적화
  -- =============================================================================
  
  RAISE NOTICE '3. 인덱스 생성 및 최적화 중...';
  
  -- profiles 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_location 
    ON profiles USING btree (location_lat, location_lng) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_last_active 
    ON profiles USING btree (last_active_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_role 
    ON profiles USING btree (role);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_profiles_created_at 
    ON profiles USING btree (created_at DESC);
  
  -- rooms 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_location 
    ON rooms USING btree (lat, lng);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_start_at 
    ON rooms USING btree (start_at);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_category_status 
    ON rooms USING btree (category, status);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_host_uid 
    ON rooms USING btree (host_uid);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_boost_until 
    ON rooms USING btree (boost_until DESC NULLS LAST);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_hashtags 
    ON rooms USING gin (hashtags);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_created_at 
    ON rooms USING btree (created_at DESC);
  
  -- messages 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_match_created 
    ON messages USING btree (match_id, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_created 
    ON messages USING btree (sender_uid, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_unread 
    ON messages USING btree (match_id, is_read, created_at DESC) WHERE is_read = FALSE;
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_type 
    ON messages USING btree (message_type);
  
  -- requests 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requests_room_status 
    ON requests USING btree (room_id, status);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requests_requester_status 
    ON requests USING btree (requester_uid, status);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requests_created_at 
    ON requests USING btree (created_at DESC);
  
  -- matches 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_host_uid 
    ON matches USING btree (host_uid);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_guest_uid 
    ON matches USING btree (guest_uid);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_room_created 
    ON matches USING btree (room_id, created_at DESC);
  
  -- blocked_users 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_users_blocker 
    ON blocked_users USING btree (blocker_uid);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_users_blocked 
    ON blocked_users USING btree (blocked_uid);
  
  -- reports 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_status_created 
    ON reports USING btree (status, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_reported_uid 
    ON reports USING btree (reported_uid);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_reports_reporter_uid 
    ON reports USING btree (reporter_uid);
  
  -- 새로운 테이블 인덱스
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_logs_user_created 
    ON user_activity_logs USING btree (user_id, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_activity_logs_activity_type 
    ON user_activity_logs USING btree (activity_type, created_at DESC);
  
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_user_unread 
    ON notifications USING btree (user_id, is_read, created_at DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_notifications_type 
    ON notifications USING btree (type);
  
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_categories 
    ON user_preferences USING gin (preferred_categories);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_user_preferences_locations 
    ON user_preferences USING gin (preferred_locations);
  
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room_reviews_room_rating 
    ON room_reviews USING btree (room_id, overall_rating DESC);
  CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_room_reviews_reviewer 
    ON room_reviews USING btree (reviewer_id, created_at DESC);
  
  RAISE NOTICE '  ✅ 인덱스 생성 및 최적화 완료';

  -- =============================================================================
  -- 4. 저장 프로시저 및 함수 생성
  -- =============================================================================
  
  RAISE NOTICE '4. 저장 프로시저 및 함수 생성 중...';
  
  -- 거리 계산 함수 (Haversine formula)
  CREATE OR REPLACE FUNCTION calculate_distance(lat1 DECIMAL, lng1 DECIMAL, lat2 DECIMAL, lng2 DECIMAL)
  RETURNS DECIMAL AS $$
  DECLARE
    earth_radius DECIMAL := 6371000; -- 지구 반지름 (미터)
    dlat DECIMAL;
    dlng DECIMAL;
    a DECIMAL;
    c DECIMAL;
  BEGIN
    dlat := RADIANS(lat2 - lat1);
    dlng := RADIANS(lng2 - lng1);
    a := SIN(dlat/2) * SIN(dlat/2) + COS(RADIANS(lat1)) * COS(RADIANS(lat2)) * SIN(dlng/2) * SIN(dlng/2);
    c := 2 * ATAN2(SQRT(a), SQRT(1-a));
    RETURN earth_radius * c;
  END;
  $$ LANGUAGE plpgsql IMMUTABLE;
  
  -- 사용자 활동 기록 함수
  CREATE OR REPLACE FUNCTION log_user_activity(
    p_user_id UUID,
    p_activity_type TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb,
    p_ip_address INET DEFAULT NULL,
    p_user_agent TEXT DEFAULT NULL
  ) RETURNS UUID AS $$
  DECLARE
    activity_id UUID;
  BEGIN
    INSERT INTO user_activity_logs (user_id, activity_type, metadata, ip_address, user_agent)
    VALUES (p_user_id, p_activity_type, p_metadata, p_ip_address, p_user_agent)
    RETURNING id INTO activity_id;
    
    -- 사용자 마지막 활동 시간 업데이트
    UPDATE profiles SET last_active_at = NOW() WHERE id = p_user_id;
    
    RETURN activity_id;
  END;
  $$ LANGUAGE plpgsql;
  
  -- 알림 생성 함수
  CREATE OR REPLACE FUNCTION create_notification(
    p_user_id UUID,
    p_type TEXT,
    p_title TEXT,
    p_message TEXT,
    p_metadata JSONB DEFAULT '{}'::jsonb
  ) RETURNS UUID AS $$
  DECLARE
    notification_id UUID;
  BEGIN
    INSERT INTO notifications (user_id, type, title, message, metadata)
    VALUES (p_user_id, p_type, p_title, p_message, p_metadata)
    RETURNING id INTO notification_id;
    
    RETURN notification_id;
  END;
  $$ LANGUAGE plpgsql;
  
  -- 사용자 추천 모임 함수
  CREATE OR REPLACE FUNCTION get_recommended_rooms(p_user_id UUID, p_limit INTEGER DEFAULT 10)
  RETURNS TABLE (
    room_id UUID,
    title TEXT,
    category TEXT,
    distance_score DECIMAL,
    preference_score DECIMAL,
    total_score DECIMAL
  ) AS $$
  BEGIN
    RETURN QUERY
    WITH user_prefs AS (
      SELECT 
        COALESCE(up.preferred_categories, ARRAY[]::TEXT[]) as categories,
        COALESCE(up.max_travel_distance, 5000) as max_distance,
        p.location_lat,
        p.location_lng
      FROM profiles p
      LEFT JOIN user_preferences up ON p.id = up.user_id
      WHERE p.id = p_user_id
    ),
    room_scores AS (
      SELECT 
        r.id,
        r.title,
        r.category,
        CASE 
          WHEN up.location_lat IS NOT NULL AND up.location_lng IS NOT NULL THEN
            (up.max_distance - calculate_distance(up.location_lat, up.location_lng, r.lat, r.lng)) / up.max_distance::DECIMAL
          ELSE 0.5
        END as distance_score,
        CASE 
          WHEN r.category = ANY(up.categories) THEN 1.0
          ELSE 0.3
        END as preference_score
      FROM rooms r
      CROSS JOIN user_prefs up
      WHERE r.status = 'active'
        AND r.host_uid != p_user_id
        AND (up.location_lat IS NULL OR up.location_lng IS NULL OR 
             calculate_distance(up.location_lat, up.location_lng, r.lat, r.lng) <= up.max_distance)
    )
    SELECT 
      rs.id as room_id,
      rs.title,
      rs.category,
      rs.distance_score,
      rs.preference_score,
      (rs.distance_score * 0.4 + rs.preference_score * 0.6) as total_score
    FROM room_scores rs
    ORDER BY total_score DESC, distance_score DESC
    LIMIT p_limit;
  END;
  $$ LANGUAGE plpgsql;
  
  RAISE NOTICE '  ✅ 저장 프로시저 및 함수 생성 완료';

  -- =============================================================================
  -- 5. 트리거 설정
  -- =============================================================================
  
  RAISE NOTICE '5. 트리거 설정 중...';
  
  -- updated_at 자동 업데이트 함수
  CREATE OR REPLACE FUNCTION update_updated_at_column()
  RETURNS TRIGGER AS $$
  BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  -- 기존 테이블에 updated_at 트리거 적용
  DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
  CREATE TRIGGER update_profiles_updated_at
    BEFORE UPDATE ON profiles
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_rooms_updated_at ON rooms;
  CREATE TRIGGER update_rooms_updated_at
    BEFORE UPDATE ON rooms
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_requests_updated_at ON requests;
  CREATE TRIGGER update_requests_updated_at
    BEFORE UPDATE ON requests
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  DROP TRIGGER IF EXISTS update_reports_updated_at ON reports;
  CREATE TRIGGER update_reports_updated_at
    BEFORE UPDATE ON reports
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  -- 새로운 테이블에 updated_at 트리거 적용
  DROP TRIGGER IF EXISTS update_user_preferences_updated_at ON user_preferences;
  CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
  
  -- 알림 생성 트리거 (메시지 수신 시)
  CREATE OR REPLACE FUNCTION notify_new_message()
  RETURNS TRIGGER AS $$
  DECLARE
    recipient_id UUID;
    sender_name TEXT;
  BEGIN
    -- 상대방 ID 찾기
    SELECT 
      CASE 
        WHEN m.host_uid = NEW.sender_uid THEN m.guest_uid 
        ELSE m.host_uid 
      END,
      p.nickname
    INTO recipient_id, sender_name
    FROM matches m
    JOIN profiles p ON p.id = NEW.sender_uid
    WHERE m.id = NEW.match_id;
    
    -- 알림 생성
    PERFORM create_notification(
      recipient_id,
      'new_message',
      sender_name || '님의 새 메시지',
      CASE 
        WHEN LENGTH(NEW.text) > 50 THEN SUBSTRING(NEW.text FROM 1 FOR 50) || '...'
        ELSE NEW.text
      END,
      jsonb_build_object('match_id', NEW.match_id, 'message_id', NEW.id)
    );
    
    RETURN NEW;
  END;
  $$ LANGUAGE plpgsql;
  
  DROP TRIGGER IF EXISTS trigger_notify_new_message ON messages;
  CREATE TRIGGER trigger_notify_new_message
    AFTER INSERT ON messages
    FOR EACH ROW
    EXECUTE FUNCTION notify_new_message();
  
  RAISE NOTICE '  ✅ 트리거 설정 완료';

  -- =============================================================================
  -- 6. 기본 시스템 설정 데이터 삽입
  -- =============================================================================
  
  RAISE NOTICE '6. 기본 시스템 설정 데이터 삽입 중...';
  
  INSERT INTO system_settings (key, value, description) VALUES
  ('max_rooms_per_user', '5', '사용자당 최대 생성 가능한 활성 모임 수')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO system_settings (key, value, description) VALUES
  ('max_requests_per_room', '20', '모임당 최대 요청 수')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO system_settings (key, value, description) VALUES
  ('boost_price_krw', '5000', '모임 부스트 가격 (원)')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO system_settings (key, value, description) VALUES
  ('auto_cleanup_completed_rooms_days', '30', '완료된 모임 자동 정리 기간 (일)')
  ON CONFLICT (key) DO NOTHING;
  
  INSERT INTO system_settings (key, value, description) VALUES
  ('banned_words', '["시발", "씨발", "개새끼", "좆", "병신"]', '금지된 단어 목록')
  ON CONFLICT (key) DO NOTHING;
  
  RAISE NOTICE '  ✅ 기본 시스템 설정 데이터 삽입 완료';

  -- =============================================================================
  -- 7. 마이그레이션 완료 기록
  -- =============================================================================
  
  end_time := clock_timestamp();
  execution_time := EXTRACT(MILLISECONDS FROM (end_time - start_time));
  
  INSERT INTO migration_history (version, description, execution_time_ms)
  VALUES (migration_version, migration_description, execution_time);
  
  RAISE NOTICE '=================================================================';
  RAISE NOTICE '✅ 마이그레이션 % 완료!', migration_version;
  RAISE NOTICE '   실행 시간: % ms', execution_time;
  RAISE NOTICE '   완료 시각: %', end_time;
  RAISE NOTICE '=================================================================';
  
END $$;

-- =============================================================================
-- 데이터베이스 통계 및 최적화
-- =============================================================================

-- 테이블 통계 업데이트
ANALYZE;

-- Vacuum 실행 (필요한 경우)
-- VACUUM ANALYZE;

-- =============================================================================
-- 마이그레이션 검증
-- =============================================================================

DO $$
BEGIN
  RAISE NOTICE '';
  RAISE NOTICE '🔍 마이그레이션 검증 중...';
  RAISE NOTICE '';
  
  -- 테이블 존재 확인
  RAISE NOTICE '📋 생성된 테이블:';
  PERFORM 
    RAISE NOTICE '  ✓ %', table_name
  FROM information_schema.tables 
  WHERE table_schema = 'public' 
    AND table_name IN ('user_activity_logs', 'notifications', 'user_preferences', 'room_reviews', 'system_settings')
  ORDER BY table_name;
  
  -- 인덱스 존재 확인
  RAISE NOTICE '';
  RAISE NOTICE '🔍 생성된 인덱스 수: %', (
    SELECT COUNT(*) 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
      AND indexname LIKE 'idx_%'
  );
  
  -- 함수 존재 확인
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  생성된 함수:';
  PERFORM 
    RAISE NOTICE '  ✓ %', routine_name
  FROM information_schema.routines 
  WHERE routine_schema = 'public'
    AND routine_name IN ('calculate_distance', 'log_user_activity', 'create_notification', 'get_recommended_rooms')
  ORDER BY routine_name;
  
  -- 시스템 설정 확인
  RAISE NOTICE '';
  RAISE NOTICE '⚙️  시스템 설정 수: %', (SELECT COUNT(*) FROM system_settings);
  
  RAISE NOTICE '';
  RAISE NOTICE '✅ 마이그레이션 검증 완료!';
  RAISE NOTICE '';
END $$;