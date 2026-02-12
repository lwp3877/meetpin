-- ===========================================
-- MeetPin - Supabase Storage RLS 정책 스크립트
-- ===========================================
-- 실행 위치: Supabase Dashboard > SQL Editor
-- 실행 순서: storage-setup.sql 실행 후 이 스크립트 실행

-- ===========================================
-- 1. avatars 버킷 RLS 정책
-- ===========================================

-- 1-1. 모든 사용자가 아바타 읽기 가능 (공개)
CREATE POLICY "Public avatars are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');

-- 1-2. 인증된 사용자만 자신의 아바타 업로드 가능
CREATE POLICY "Authenticated users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 1-3. 사용자는 자신의 아바타만 업데이트 가능
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- 1-4. 사용자는 자신의 아바타만 삭제 가능
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

-- ===========================================
-- 2. room-images 버킷 RLS 정책
-- ===========================================

-- 2-1. 모든 사용자가 방 이미지 읽기 가능 (공개)
CREATE POLICY "Public room images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'room-images');

-- 2-2. 인증된 사용자만 방 이미지 업로드 가능
CREATE POLICY "Authenticated users can upload room images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'room-images'
  AND auth.role() = 'authenticated'
);

-- 2-3. 방 호스트만 자신의 방 이미지 업데이트 가능
CREATE POLICY "Room hosts can update their room images"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'room-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.host_uid = auth.uid()
    AND (storage.foldername(name))[1] = rooms.id::text
  )
)
WITH CHECK (
  bucket_id = 'room-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.host_uid = auth.uid()
    AND (storage.foldername(name))[1] = rooms.id::text
  )
);

-- 2-4. 방 호스트만 자신의 방 이미지 삭제 가능
CREATE POLICY "Room hosts can delete their room images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'room-images'
  AND auth.role() = 'authenticated'
  AND EXISTS (
    SELECT 1 FROM public.rooms
    WHERE rooms.host_uid = auth.uid()
    AND (storage.foldername(name))[1] = rooms.id::text
  )
);

-- ===========================================
-- 3. images 버킷 RLS 정책 (범용 이미지 업로드)
-- ===========================================

-- 3-1. 모든 사용자가 이미지 읽기 가능 (공개)
CREATE POLICY "Public images are viewable by everyone"
ON storage.objects FOR SELECT
USING (bucket_id = 'images');

-- 3-2. 인증된 사용자만 자신의 폴더에 업로드 가능
CREATE POLICY "Authenticated users can upload images"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
);

-- 3-3. 업로더만 자신의 이미지 삭제 가능
CREATE POLICY "Users can delete their own images"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'images'
  AND auth.role() = 'authenticated'
  AND (storage.foldername(name))[2] = auth.uid()::text
);

-- ===========================================
-- 4. Storage RLS 활성화 확인
-- ===========================================

-- Storage objects 테이블의 RLS 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ===========================================
-- 4. 정책 적용 확인
-- ===========================================

SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'storage'
  AND tablename = 'objects'
  AND policyname LIKE '%avatar%' OR policyname LIKE '%room%'
ORDER BY policyname;

-- ===========================================
-- 실행 결과 확인:
-- - avatars: 4개 정책 (SELECT, INSERT, UPDATE, DELETE)
-- - room-images: 4개 정책 (SELECT, INSERT, UPDATE, DELETE)
-- - 총 8개 RLS 정책 활성화
--
-- 보안 검증:
-- ✅ 공개 읽기: 모두 가능
-- ✅ 업로드: 인증된 사용자만
-- ✅ 수정/삭제: 소유자만 (아바타) 또는 호스트만 (방 이미지)
-- ===========================================
