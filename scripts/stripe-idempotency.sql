-- stripe_webhook_events
-- Stripe 웹훅 이벤트 중복 처리 방지용 테이블.
-- Stripe는 네트워크 오류 시 동일 이벤트를 재전송할 수 있음.
-- 이 테이블에 처리 완료된 event.id를 저장해두고,
-- 웹훅 수신 시 이미 있으면 즉시 200 반환 (멱등성 보장).
--
-- Supabase SQL Editor에서 한 번만 실행하면 됩니다.

CREATE TABLE IF NOT EXISTS stripe_webhook_events (
  event_id     TEXT        PRIMARY KEY,           -- Stripe event ID (예: evt_xxx)
  event_type   TEXT        NOT NULL,              -- 이벤트 종류 (예: checkout.session.completed)
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW() -- 처리 완료 시각
);

-- 30일 지난 이벤트는 조회할 일 없으므로 인덱스로 정리 편의 제공
CREATE INDEX IF NOT EXISTS idx_stripe_webhook_events_processed_at
  ON stripe_webhook_events (processed_at);

-- 이 테이블은 서비스 계정(service role)만 접근 허용 (RLS)
ALTER TABLE stripe_webhook_events ENABLE ROW LEVEL SECURITY;

-- 일반 사용자/anon은 읽기/쓰기 불가. 웹훅은 service role key 사용.
-- (별도 정책 없음 = 기본 거부)
