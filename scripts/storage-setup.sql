-- ===========================================
-- MeetPin - Supabase Storage 버킷 생성 스크립트
-- ===========================================
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 실행 순서: 1. 이 스크립트 실행 → 2. storage-rls.sql 실행

-- 1. avatars 버킷 생성 (프로필 아바타 이미지)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,  -- 공개 버킷
  5242880,  -- 5MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. room-images 버킷 생성 (방 대표 이미지)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images',
  'room-images',
  true,  -- 공개 버킷
  10485760,  -- 10MB 제한
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 3. 버킷 생성 확인
SELECT
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at
FROM storage.buckets
WHERE id IN ('avatars', 'room-images')
ORDER BY created_at DESC;

-- ===========================================
-- 실행 결과 확인:
-- - avatars 버킷: public=true, 5MB 제한
-- - room-images 버킷: public=true, 10MB 제한
--
-- 다음 단계:
-- scripts/storage-rls.sql 실행하여 RLS 정책 적용
-- ===========================================
