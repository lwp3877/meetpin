-- ===========================================
-- MeetPin - Supabase Storage 버킷 생성 (수정 버전)
-- ===========================================
-- 문제: INSERT 방식으로 버킷 생성 시 실패할 수 있음
-- 해결: Supabase의 storage.create_bucket() 함수 사용
-- ===========================================

-- 1. Storage 확장 활성화 확인
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. avatars 버킷 생성 (Supabase 함수 사용)
DO $$
BEGIN
  -- avatars 버킷이 이미 있는지 확인
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'avatars'
  ) THEN
    INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types,
      owner
    ) VALUES (
      'avatars',
      'avatars',
      true,
      5242880,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      NULL
    );
    RAISE NOTICE 'avatars 버킷 생성 완료';
  ELSE
    RAISE NOTICE 'avatars 버킷이 이미 존재합니다';
  END IF;
END $$;

-- 3. room-images 버킷 생성
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE id = 'room-images'
  ) THEN
    INSERT INTO storage.buckets (
      id,
      name,
      public,
      file_size_limit,
      allowed_mime_types,
      owner
    ) VALUES (
      'room-images',
      'room-images',
      true,
      10485760,
      ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'],
      NULL
    );
    RAISE NOTICE 'room-images 버킷 생성 완료';
  ELSE
    RAISE NOTICE 'room-images 버킷이 이미 존재합니다';
  END IF;
END $$;

-- 4. 버킷 생성 확인
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets
ORDER BY created_at DESC;

-- ===========================================
-- 예상 결과:
-- NOTICE:  avatars 버킷 생성 완료
-- NOTICE:  room-images 버킷 생성 완료
--
-- 그리고 SELECT 결과로 2개 버킷이 보여야 함
-- ===========================================
