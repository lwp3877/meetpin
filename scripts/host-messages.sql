-- 호스트 메시지 기능을 위한 테이블 추가
-- 기존 messages 테이블과 별개로 호스트에게 직접 보내는 메시지용

-- 호스트 메시지 테이블 (방 참가 전에도 호스트에게 메시지 가능)
CREATE TABLE IF NOT EXISTS public.host_messages (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  room_id UUID REFERENCES public.rooms(id) ON DELETE CASCADE NOT NULL,
  sender_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  receiver_uid UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL,
  
  -- 제약 조건
  CONSTRAINT text_length CHECK (char_length(text) >= 1 AND char_length(text) <= 1000),
  CONSTRAINT no_self_message CHECK (sender_uid != receiver_uid)
);

-- 호스트 메시지 인덱스
CREATE INDEX IF NOT EXISTS idx_host_messages_room_id ON public.host_messages(room_id);
CREATE INDEX IF NOT EXISTS idx_host_messages_sender_uid ON public.host_messages(sender_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_receiver_uid ON public.host_messages(receiver_uid);
CREATE INDEX IF NOT EXISTS idx_host_messages_created_at ON public.host_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_host_messages_unread ON public.host_messages(receiver_uid, is_read, created_at DESC);

-- 권한 설정
GRANT ALL ON public.host_messages TO anon, authenticated;

-- Realtime 설정 (실시간 알림용)
ALTER PUBLICATION supabase_realtime ADD TABLE public.host_messages;

-- 통계 뷰에 호스트 메시지 추가
DROP VIEW IF EXISTS public.admin_stats;
CREATE OR REPLACE VIEW public.admin_stats AS
SELECT
  'users'::text as metric,
  count(*)::int as value,
  'total registered users'::text as description
FROM public.profiles
UNION ALL
SELECT
  'rooms'::text as metric,
  count(*)::int as value,
  'total rooms created'::text as description
FROM public.rooms
UNION ALL
SELECT
  'active_rooms'::text as metric,
  count(*)::int as value,
  'currently active rooms'::text as description
FROM public.rooms
WHERE start_at > now()
UNION ALL
SELECT
  'matches'::text as metric,
  count(*)::int as value,
  'total successful matches'::text as description
FROM public.matches
UNION ALL
SELECT
  'messages'::text as metric,
  count(*)::int as value,
  'total messages sent'::text as description
FROM public.messages
UNION ALL
SELECT
  'host_messages'::text as metric,
  count(*)::int as value,
  'total host messages sent'::text as description
FROM public.host_messages
UNION ALL
SELECT
  'reports'::text as metric,
  count(*)::int as value,
  'total reports submitted'::text as description
FROM public.reports;