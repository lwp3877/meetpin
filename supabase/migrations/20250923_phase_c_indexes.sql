-- Phase C Performance Indexes Migration
-- 실행일: 2025-09-23
-- 목적: 핵심 쿼리 p95 지연시간 20% 단축

-- 🚀 Core Performance Indexes for High-Traffic Queries

-- 1. 방 목록 조회 최적화 (위치 기반 + 생성일순)
-- 패턴: SELECT * FROM rooms WHERE lat BETWEEN ? AND ? AND lng BETWEEN ? AND ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_location_created
  ON public.rooms (lat, lng, created_at DESC);

-- 2. 카테고리별 방 목록 조회 최적화 
-- 패턴: SELECT * FROM rooms WHERE category = ? AND lat BETWEEN ? AND ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_rooms_category_location_created
  ON public.rooms (category, lat, lng, created_at DESC);

-- 3. 메시지 목록 조회 최적화 (매치별 메시지)
-- 패턴: SELECT * FROM messages WHERE match_id = ? ORDER BY created_at DESC LIMIT 50
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_match_created
  ON public.messages (match_id, created_at DESC);

-- 4. 사용자별 메시지 조회 최적화 (발신자 기준)
-- 패턴: SELECT * FROM messages WHERE sender_uid = ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_messages_sender_created
  ON public.messages (sender_uid, created_at DESC);

-- 5. 안읽은 호스트 메시지 조회 최적화 
-- 패턴: SELECT COUNT(*) FROM host_messages WHERE receiver_uid = ? AND is_read = false
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_host_messages_receiver_unread
  ON public.host_messages (receiver_uid) WHERE is_read = false;

-- 6. 호스트 메시지 목록 조회 최적화 (받는 사람 기준)
-- 패턴: SELECT * FROM host_messages WHERE receiver_uid = ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_host_messages_receiver_created
  ON public.host_messages (receiver_uid, created_at DESC);

-- 7. 방별 요청 조회 최적화 
-- 패턴: SELECT * FROM requests WHERE room_id = ? ORDER BY created_at DESC
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requests_room_created
  ON public.requests (room_id, created_at DESC);

-- 8. 사용자별 요청 조회 최적화 (요청자 기준)
-- 패턴: SELECT * FROM requests WHERE guest_uid = ? ORDER BY created_at DESC  
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_requests_guest_created
  ON public.requests (guest_uid, created_at DESC);

-- 9. 매치 조회 최적화 (참여자 기준)
-- 패턴: SELECT * FROM matches WHERE host_uid = ? OR guest_uid = ?
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_host_uid
  ON public.matches (host_uid);
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_matches_guest_uid  
  ON public.matches (guest_uid);

-- 10. 차단된 사용자 빠른 조회
-- 패턴: SELECT 1 FROM blocked_users WHERE blocker_uid = ? AND blocked_uid = ?
-- (이미 PRIMARY KEY로 커버되지만 명시적 추가)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_blocked_users_lookup
  ON public.blocked_users (blocker_uid, blocked_uid);

-- =============================================================================
-- 성능 측정을 위한 설명
-- =============================================================================

-- 💡 예상 성능 개선 영역:
-- 1. 지도 페이지 방 목록 로딩: 200ms → 80ms (-60%)
-- 2. 채팅 메시지 로딩: 150ms → 50ms (-67%) 
-- 3. 안읽은 메시지 카운트: 100ms → 25ms (-75%)
-- 4. 요청함 페이지 로딩: 180ms → 60ms (-67%)

-- 🎯 커버하는 주요 쿼리 패턴:
-- - 위치 기반 방 검색 (bbox)
-- - 카테고리 필터링된 방 목록
-- - 실시간 채팅 메시지 로딩  
-- - 안읽은 알림 카운트
-- - 사용자별 요청/매치 목록