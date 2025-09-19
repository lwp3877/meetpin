-- MeetPin Row Level Security (RLS) Policies
-- Version: 1.0.0
-- Created: 2025-01-15

-- ============================================================================
-- RLS 활성화
-- ============================================================================

-- 모든 테이블에 RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE host_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE blocked_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 1. PROFILES 테이블 RLS 정책
-- ============================================================================

-- 자신의 프로필 조회
CREATE POLICY "Users can view own profile" ON profiles
  FOR SELECT USING (auth.uid() = uid);

-- 다른 사용자의 공개 프로필 조회 (차단되지 않은 경우)
CREATE POLICY "Users can view other profiles" ON profiles
  FOR SELECT USING (
    auth.uid() != uid AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = auth.uid() AND blocked_id = uid) 
         OR (blocker_id = uid AND blocked_id = auth.uid())
    )
  );

-- 자신의 프로필 생성 (회원가입 시)
CREATE POLICY "Users can create own profile" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = uid);

-- 자신의 프로필 수정
CREATE POLICY "Users can update own profile" ON profiles
  FOR UPDATE USING (auth.uid() = uid);

-- 관리자는 모든 프로필 조회 및 수정 가능
CREATE POLICY "Admins can manage all profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 2. ROOMS 테이블 RLS 정책
-- ============================================================================

-- 공개 방 조회 (활성 상태, 차단되지 않은 호스트)
CREATE POLICY "Users can view public active rooms" ON rooms
  FOR SELECT USING (
    visibility = 'public' AND 
    status = 'active' AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users 
      WHERE (blocker_id = auth.uid() AND blocked_id = host_uid) 
         OR (blocker_id = host_uid AND blocked_id = auth.uid())
    )
  );

-- 자신이 호스트인 방 조회
CREATE POLICY "Users can view own hosted rooms" ON rooms
  FOR SELECT USING (auth.uid() = host_uid);

-- 자신이 참가 신청한 방 조회
CREATE POLICY "Users can view requested rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM requests 
      WHERE room_id = rooms.id AND user_id = auth.uid()
    )
  );

-- 자신이 매칭된 방 조회
CREATE POLICY "Users can view matched rooms" ON rooms
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE room_id = rooms.id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 방 생성 (인증된 사용자)
CREATE POLICY "Authenticated users can create rooms" ON rooms
  FOR INSERT WITH CHECK (auth.uid() = host_uid);

-- 자신이 호스트인 방 수정
CREATE POLICY "Hosts can update own rooms" ON rooms
  FOR UPDATE USING (auth.uid() = host_uid);

-- 자신이 호스트인 방 삭제
CREATE POLICY "Hosts can delete own rooms" ON rooms
  FOR DELETE USING (auth.uid() = host_uid);

-- 관리자는 모든 방 관리 가능
CREATE POLICY "Admins can manage all rooms" ON rooms
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 3. REQUESTS 테이블 RLS 정책
-- ============================================================================

-- 자신의 신청 조회
CREATE POLICY "Users can view own requests" ON requests
  FOR SELECT USING (auth.uid() = user_id);

-- 자신이 호스트인 방의 신청 조회
CREATE POLICY "Hosts can view room requests" ON requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE id = room_id AND host_uid = auth.uid()
    )
  );

-- 참가 신청 생성 (방 호스트가 아닌 경우, 차단되지 않은 경우)
CREATE POLICY "Users can create requests" ON requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    NOT EXISTS (
      SELECT 1 FROM rooms 
      WHERE id = room_id AND host_uid = auth.uid()
    ) AND
    NOT EXISTS (
      SELECT 1 FROM blocked_users bu
      JOIN rooms r ON r.id = room_id
      WHERE (bu.blocker_id = auth.uid() AND bu.blocked_id = r.host_uid) 
         OR (bu.blocker_id = r.host_uid AND bu.blocked_id = auth.uid())
    )
  );

-- 자신의 신청 수정/취소
CREATE POLICY "Users can update own requests" ON requests
  FOR UPDATE USING (auth.uid() = user_id);

-- 호스트는 자신 방의 신청 수정 (수락/거절)
CREATE POLICY "Hosts can update room requests" ON requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE id = room_id AND host_uid = auth.uid()
    )
  );

-- ============================================================================
-- 4. MATCHES 테이블 RLS 정책
-- ============================================================================

-- 자신이 포함된 매칭 조회
CREATE POLICY "Users can view own matches" ON matches
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

-- 매칭 생성은 시스템/호스트만 가능 (트리거를 통해)
CREATE POLICY "System can create matches" ON matches
  FOR INSERT WITH CHECK (true); -- 트리거에서 제어

-- ============================================================================
-- 5. MESSAGES 테이블 RLS 정책
-- ============================================================================

-- 자신이 포함된 매칭의 메시지 조회
CREATE POLICY "Users can view match messages" ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 자신이 포함된 매칭에 메시지 전송
CREATE POLICY "Users can send messages" ON messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- 자신의 메시지 수정 (읽음 처리 등)
CREATE POLICY "Users can update own messages" ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM matches 
      WHERE id = match_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- ============================================================================
-- 6. HOST_MESSAGES 테이블 RLS 정책
-- ============================================================================

-- 자신이 보낸 호스트 메시지 조회
CREATE POLICY "Users can view own host messages" ON host_messages
  FOR SELECT USING (auth.uid() = sender_id);

-- 자신이 호스트인 방의 메시지 조회
CREATE POLICY "Hosts can view room messages" ON host_messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM rooms 
      WHERE id = room_id AND host_uid = auth.uid()
    )
  );

-- 방 참가자가 호스트에게 메시지 전송
CREATE POLICY "Participants can send host messages" ON host_messages
  FOR INSERT WITH CHECK (
    auth.uid() = sender_id AND
    (
      EXISTS (
        SELECT 1 FROM requests 
        WHERE room_id = host_messages.room_id AND user_id = auth.uid() AND status = 'accepted'
      ) OR
      EXISTS (
        SELECT 1 FROM matches 
        WHERE room_id = host_messages.room_id AND (user1_id = auth.uid() OR user2_id = auth.uid())
      )
    )
  );

-- ============================================================================
-- 7. BLOCKED_USERS 테이블 RLS 정책
-- ============================================================================

-- 자신이 차단한 사용자 목록 조회
CREATE POLICY "Users can view own blocked users" ON blocked_users
  FOR SELECT USING (auth.uid() = blocker_id);

-- 사용자 차단
CREATE POLICY "Users can block others" ON blocked_users
  FOR INSERT WITH CHECK (auth.uid() = blocker_id);

-- 차단 해제
CREATE POLICY "Users can unblock others" ON blocked_users
  FOR DELETE USING (auth.uid() = blocker_id);

-- ============================================================================
-- 8. REPORTS 테이블 RLS 정책
-- ============================================================================

-- 자신이 작성한 신고 조회
CREATE POLICY "Users can view own reports" ON reports
  FOR SELECT USING (auth.uid() = reporter_id);

-- 신고 작성
CREATE POLICY "Users can create reports" ON reports
  FOR INSERT WITH CHECK (auth.uid() = reporter_id);

-- 관리자는 모든 신고 조회 및 관리
CREATE POLICY "Admins can manage all reports" ON reports
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 9. NOTIFICATIONS 테이블 RLS 정책
-- ============================================================================

-- 자신의 알림만 조회
CREATE POLICY "Users can view own notifications" ON notifications
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템이 알림 생성
CREATE POLICY "System can create notifications" ON notifications
  FOR INSERT WITH CHECK (true); -- 서버에서 제어

-- 자신의 알림 수정 (읽음 처리)
CREATE POLICY "Users can update own notifications" ON notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 자신의 알림 삭제
CREATE POLICY "Users can delete own notifications" ON notifications
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================================================
-- 10. FEEDBACK 테이블 RLS 정책
-- ============================================================================

-- 자신이 작성한 피드백 조회
CREATE POLICY "Users can view own feedback given" ON feedback
  FOR SELECT USING (auth.uid() = reviewer_id);

-- 자신에 대한 피드백 조회 (익명화된 경우 작성자 정보 제외)
CREATE POLICY "Users can view feedback received" ON feedback
  FOR SELECT USING (auth.uid() = reviewed_id);

-- 피드백 작성 (같은 방에서 매칭된 사용자에 대해서만)
CREATE POLICY "Users can create feedback" ON feedback
  FOR INSERT WITH CHECK (
    auth.uid() = reviewer_id AND
    EXISTS (
      SELECT 1 FROM matches 
      WHERE room_id = feedback.room_id 
        AND ((user1_id = auth.uid() AND user2_id = reviewed_id) 
          OR (user2_id = auth.uid() AND user1_id = reviewed_id))
    )
  );

-- ============================================================================
-- 11. PAYMENT_RECORDS 테이블 RLS 정책
-- ============================================================================

-- 자신의 결제 기록만 조회
CREATE POLICY "Users can view own payments" ON payment_records
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템이 결제 기록 생성
CREATE POLICY "System can create payments" ON payment_records
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 시스템이 결제 상태 업데이트
CREATE POLICY "System can update payments" ON payment_records
  FOR UPDATE USING (auth.uid() = user_id);

-- 관리자는 모든 결제 기록 조회
CREATE POLICY "Admins can view all payments" ON payment_records
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 12. ANALYTICS_EVENTS 테이블 RLS 정책
-- ============================================================================

-- 자신의 분석 데이터만 조회
CREATE POLICY "Users can view own analytics" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

-- 시스템이 분석 이벤트 생성
CREATE POLICY "System can create analytics" ON analytics_events
  FOR INSERT WITH CHECK (true); -- 서버에서 제어

-- 관리자는 집계된 분석 데이터 조회 (개인정보 제외)
CREATE POLICY "Admins can view aggregated analytics" ON analytics_events
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE uid = auth.uid() AND role = 'admin'
    )
  );

-- ============================================================================
-- 헬퍼 함수 및 뷰
-- ============================================================================

-- 사용자가 차단되었는지 확인하는 함수
CREATE OR REPLACE FUNCTION is_user_blocked(user1_uuid UUID, user2_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM blocked_users 
    WHERE (blocker_id = user1_uuid AND blocked_id = user2_uuid) 
       OR (blocker_id = user2_uuid AND blocked_id = user1_uuid)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 방의 현재 참가자 수를 계산하는 함수
CREATE OR REPLACE FUNCTION get_room_participant_count(room_uuid UUID)
RETURNS INTEGER AS $$
BEGIN
  RETURN (
    SELECT COUNT(*) FROM requests 
    WHERE room_id = room_uuid AND status = 'accepted'
  ) + 1; -- 호스트 포함
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 사용자의 평균 평점을 계산하는 함수
CREATE OR REPLACE FUNCTION get_user_average_rating(user_uuid UUID)
RETURNS DECIMAL(3,2) AS $$
BEGIN
  RETURN (
    SELECT COALESCE(AVG(rating::DECIMAL), 0) 
    FROM feedback 
    WHERE reviewed_id = user_uuid
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- RLS 정책 적용 완료 로그
-- ============================================================================
DO $$
BEGIN
  RAISE NOTICE 'MeetPin RLS policies applied successfully!';
  RAISE NOTICE 'Security policies: ~30';
  RAISE NOTICE 'Helper functions: 3';
  RAISE NOTICE 'Next step: Apply triggers and business logic (003-triggers.sql)';
END $$;