-- 피드백 테이블 생성
CREATE TABLE IF NOT EXISTS feedback (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('bug', 'feature', 'improvement', 'other')),
  title TEXT NOT NULL CHECK (length(title) >= 5 AND length(title) <= 100),
  content TEXT NOT NULL CHECK (length(content) >= 10 AND length(content) <= 1000),
  contact_email TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved', 'rejected')),
  admin_response TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  resolved_at TIMESTAMP WITH TIME ZONE
);

-- 인덱스 생성
CREATE INDEX IF NOT EXISTS idx_feedback_user_id ON feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_feedback_status ON feedback(status);
CREATE INDEX IF NOT EXISTS idx_feedback_type ON feedback(type);
CREATE INDEX IF NOT EXISTS idx_feedback_created_at ON feedback(created_at DESC);

-- RLS 정책 설정
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 피드백만 조회 가능
CREATE POLICY "Users can view own feedback" ON feedback
  FOR SELECT USING (auth.uid() = user_id);

-- 사용자는 자신의 피드백만 생성 가능
CREATE POLICY "Users can create own feedback" ON feedback
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 관리자는 모든 피드백 조회/수정 가능
CREATE POLICY "Admins can manage all feedback" ON feedback
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.uid = auth.uid() 
      AND profiles.role = 'admin'
    )
  );

-- 업데이트 트리거 생성
CREATE OR REPLACE FUNCTION update_feedback_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF OLD.status != NEW.status AND NEW.status = 'resolved' THEN
    NEW.resolved_at = NOW();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER feedback_updated_at
  BEFORE UPDATE ON feedback
  FOR EACH ROW
  EXECUTE FUNCTION update_feedback_updated_at();

-- 코멘트 추가
COMMENT ON TABLE feedback IS '사용자 피드백 및 문의사항';
COMMENT ON COLUMN feedback.type IS '피드백 유형: bug(버그신고), feature(기능요청), improvement(개선사항), other(기타)';
COMMENT ON COLUMN feedback.status IS '처리 상태: pending(대기), in_progress(진행중), resolved(해결완료), rejected(거절)';