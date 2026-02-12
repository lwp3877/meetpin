-- 밋핀(MeetPin) Storage 버킷 생성
-- 실행 순서: migrate.sql → migrate-extra.sql → 이 파일 → storage-rls.sql
-- 주의: Supabase Dashboard > Storage에서 수동 생성해도 됨

-- avatars 버킷 (프로필 이미지)
INSERT INTO storage.buckets (id, name, public) VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- room-images 버킷 (방 이미지)
INSERT INTO storage.buckets (id, name, public) VALUES ('room-images', 'room-images', true)
ON CONFLICT (id) DO NOTHING;

-- images 버킷 (범용 이미지 업로드 - imageUpload.ts에서 사용)
INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true)
ON CONFLICT (id) DO NOTHING;
