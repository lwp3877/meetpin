-- 쿼리 성능 분석 스크립트
-- 인덱스 적용 전/후 성능 비교용

-- =============================================================================
-- 1. 방 목록 조회 쿼리 (지도 페이지 핵심 쿼리)
-- =============================================================================

-- BEFORE: 인덱스 적용 전 성능 측정
EXPLAIN (ANALYZE, BUFFERS, COSTS OFF) 
SELECT r.*, p.nickname, p.avatar_url, p.age_range
FROM public.rooms r
JOIN public.profiles p ON r.host_uid = p.uid
WHERE r.lat BETWEEN 37.4563 AND 37.6761 
  AND r.lng BETWEEN 126.8226 AND 127.1836
ORDER BY r.boost_until DESC NULLS LAST, r.created_at DESC
LIMIT 50;

-- =============================================================================
-- 2. 카테고리 필터링된 방 목록 쿼리  
-- =============================================================================

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT r.*, p.nickname, p.avatar_url, p.age_range
FROM public.rooms r
JOIN public.profiles p ON r.host_uid = p.uid  
WHERE r.category = 'drink'
  AND r.lat BETWEEN 37.4563 AND 37.6761
  AND r.lng BETWEEN 126.8226 AND 127.1836
ORDER BY r.created_at DESC
LIMIT 50;

-- =============================================================================
-- 3. 메시지 목록 조회 쿼리 (채팅 페이지)
-- =============================================================================

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT m.*, p.nickname, p.avatar_url
FROM public.messages m
JOIN public.profiles p ON m.sender_uid = p.uid
WHERE m.match_id = 'sample-match-uuid'
ORDER BY m.created_at DESC
LIMIT 50;

-- =============================================================================
-- 4. 안읽은 호스트 메시지 카운트 (실시간 알림)
-- =============================================================================

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT COUNT(*) as unread_count
FROM public.host_messages
WHERE receiver_uid = 'sample-user-uuid' 
  AND is_read = false;

-- =============================================================================
-- 5. 사용자별 요청 목록 (요청함 페이지)
-- ============================================================================= 

EXPLAIN (ANALYZE, BUFFERS, COSTS OFF)
SELECT r.*, rm.title, rm.place_text, rm.start_at, p.nickname
FROM public.requests r
JOIN public.rooms rm ON r.room_id = rm.id
JOIN public.profiles p ON rm.host_uid = p.uid
WHERE r.guest_uid = 'sample-user-uuid'
ORDER BY r.created_at DESC
LIMIT 20;

-- =============================================================================
-- 인덱스 사용률 확인 쿼리
-- =============================================================================

-- 생성된 인덱스 목록 확인
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE schemaname = 'public' 
  AND indexname LIKE 'idx_%'
ORDER BY tablename, indexname;

-- 인덱스 사용 통계 (pg_stat_user_indexes)
SELECT 
    schemaname,
    relname as table_name,
    indexrelname as index_name,
    idx_scan as index_scans,
    idx_tup_read as tuples_read,
    idx_tup_fetch as tuples_fetched
FROM pg_stat_user_indexes 
WHERE schemaname = 'public'
  AND indexrelname LIKE 'idx_%'
ORDER BY idx_scan DESC;

-- =============================================================================
-- 성능 벤치마크 결과 예상치
-- =============================================================================

/*
예상 성능 개선 (1K-5K 행 기준):

쿼리 유형                      | BEFORE | AFTER | 개선율
------------------------------|--------|-------|-------
위치 기반 방 목록             | 200ms  | 80ms  | -60%
카테고리 필터 방 목록         | 250ms  | 90ms  | -64%  
매치별 메시지 목록            | 150ms  | 50ms  | -67%
안읽은 메시지 카운트          | 100ms  | 25ms  | -75%
사용자별 요청 목록            | 180ms  | 60ms  | -67%

🎯 평균 p95 지연 개선: 196ms → 61ms (-69%)
*/