-- MeetPin Supabase Storage RLS Policies
-- Version: 1.0.0 
-- Security hardening for file uploads

-- ============================================================================
-- Storage Bucket 생성 및 설정
-- ============================================================================

-- 아바타 이미지 버킷
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars', 
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 방 이미지 버킷  
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'room-images', 
  'room-images',
  true,
  10485760, -- 10MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp'];

-- 신고 증거 파일 버킷 (비공개)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'report-files',
  'report-files', 
  false,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
) ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 20971520,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- ============================================================================
-- Avatar Storage 정책
-- ============================================================================

-- 아바타 조회: 모든 인증된 사용자
CREATE POLICY "Avatar images are publicly viewable" ON storage.objects
FOR SELECT USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- 아바타 업로드: 자신의 프로필 이미지만 
CREATE POLICY "Users can upload own avatar" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1] AND
  -- 파일명 검증: UUID/filename.ext 형태
  array_length(storage.foldername(name), 1) = 2 AND
  -- 확장자 검증
  lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

-- 아바타 수정: 자신의 기존 이미지만
CREATE POLICY "Users can update own avatar" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- 아바타 삭제: 자신의 이미지만
CREATE POLICY "Users can delete own avatar" ON storage.objects 
FOR DELETE USING (
  bucket_id = 'avatars' AND
  auth.uid()::text = (storage.foldername(name))[1]
);

-- ============================================================================
-- Room Image Storage 정책
-- ============================================================================

-- 방 이미지 조회: 공개 방의 이미지는 모든 사용자
CREATE POLICY "Room images are viewable by participants" ON storage.objects
FOR SELECT USING (
  bucket_id = 'room-images' AND
  auth.role() = 'authenticated' AND
  (
    -- 방 호스트
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE id::text = (storage.foldername(name))[1] 
        AND host_uid = auth.uid()
        AND visibility = 'public'
    ) OR
    -- 방 참가자  
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN requests req ON r.id = req.room_id
      WHERE r.id::text = (storage.foldername(name))[1]
        AND req.user_id = auth.uid()
        AND req.status = 'accepted'
        AND r.visibility = 'public'
    ) OR
    -- 매칭된 사용자
    EXISTS (
      SELECT 1 FROM rooms r
      JOIN matches m ON r.id = m.room_id  
      WHERE r.id::text = (storage.foldername(name))[1]
        AND (m.user1_id = auth.uid() OR m.user2_id = auth.uid())
        AND r.visibility = 'public'
    )
  )
);

-- 방 이미지 업로드: 방 호스트만
CREATE POLICY "Room hosts can upload room images" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'room-images' AND
  EXISTS (
    SELECT 1 FROM rooms 
    WHERE id::text = (storage.foldername(name))[1] 
      AND host_uid = auth.uid()
  ) AND
  -- 파일명 검증: room_id/filename.ext 형태
  array_length(storage.foldername(name), 1) = 2 AND
  -- 확장자 검증
  lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp')
);

-- 방 이미지 수정: 방 호스트만
CREATE POLICY "Room hosts can update room images" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'room-images' AND
  EXISTS (
    SELECT 1 FROM rooms 
    WHERE id::text = (storage.foldername(name))[1] 
      AND host_uid = auth.uid()
  )
);

-- 방 이미지 삭제: 방 호스트만
CREATE POLICY "Room hosts can delete room images" ON storage.objects
FOR DELETE USING (
  bucket_id = 'room-images' AND
  EXISTS (
    SELECT 1 FROM rooms 
    WHERE id::text = (storage.foldername(name))[1] 
      AND host_uid = auth.uid()
  )
);

-- ============================================================================
-- Report Files Storage 정책 (비공개)
-- ============================================================================

-- 신고 파일 조회: 신고자와 관리자만
CREATE POLICY "Report files viewable by reporter and admins" ON storage.objects
FOR SELECT USING (
  bucket_id = 'report-files' AND
  (
    -- 신고 작성자
    EXISTS (
      SELECT 1 FROM reports 
      WHERE id::text = (storage.foldername(name))[1] 
        AND reporter_id = auth.uid()
    ) OR
    -- 관리자
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  )
);

-- 신고 파일 업로드: 신고 작성자만  
CREATE POLICY "Users can upload report files" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'report-files' AND
  EXISTS (
    SELECT 1 FROM reports 
    WHERE id::text = (storage.foldername(name))[1] 
      AND reporter_id = auth.uid()
  ) AND
  -- 파일명 검증: report_id/filename.ext 형태
  array_length(storage.foldername(name), 1) = 2 AND
  -- 확장자 검증 (이미지 + PDF)
  lower(storage.extension(name)) IN ('jpg', 'jpeg', 'png', 'webp', 'pdf')
);

-- 신고 파일 삭제: 신고자와 관리자만
CREATE POLICY "Report files deletable by reporter and admins" ON storage.objects
FOR DELETE USING (
  bucket_id = 'report-files' AND
  (
    -- 신고 작성자
    EXISTS (
      SELECT 1 FROM reports 
      WHERE id::text = (storage.foldername(name))[1] 
        AND reporter_id = auth.uid()
    ) OR
    -- 관리자
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  )
);

-- ============================================================================
-- 관리자 Storage 정책
-- ============================================================================

-- 관리자는 모든 Storage 객체 관리 가능
CREATE POLICY "Admins can manage all storage objects" ON storage.objects
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM profiles 
    WHERE uid = auth.uid() AND role = 'admin'
  )
);

-- ============================================================================
-- Storage 헬퍼 함수
-- ============================================================================

-- 파일 확장자 추출 함수
CREATE OR REPLACE FUNCTION storage.extension(name text)
RETURNS text AS $$
BEGIN
  RETURN lower(substring(name from '\.([^.]*)$'));
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 폴더 경로 추출 함수  
CREATE OR REPLACE FUNCTION storage.foldername(name text)
RETURNS text[] AS $$
BEGIN
  RETURN string_to_array(name, '/');
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- 파일 크기 검증 함수
CREATE OR REPLACE FUNCTION check_file_size(file_size bigint, max_size bigint)
RETURNS boolean AS $$
BEGIN
  RETURN file_size <= max_size;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ============================================================================
-- Storage RLS 활성화
-- ============================================================================

-- Storage 객체에 RLS 활성화
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
ALTER TABLE storage.buckets ENABLE ROW LEVEL SECURITY;

-- Bucket 조회 정책  
CREATE POLICY "Buckets are publicly readable" ON storage.buckets
FOR SELECT USING (true);

-- ============================================================================
-- 완료 로그
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'MeetPin Storage RLS policies applied successfully!';
  RAISE NOTICE 'Buckets configured: avatars, room-images, report-files';
  RAISE NOTICE 'Storage policies: ~15';
  RAISE NOTICE 'File size limits: Avatar 5MB, Room 10MB, Report 20MB';
  RAISE NOTICE 'Allowed formats: JPEG, PNG, WebP, PDF (reports only)';
END $$;