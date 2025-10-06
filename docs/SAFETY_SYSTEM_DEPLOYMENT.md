# 사용자 안전 시스템 배포 가이드

## 📋 개요

밋핀(MeetPin) 사용자 안전 시스템은 다음 기능을 제공합니다:

- ✅ 모임 후 안전 피드백 수집
- ✅ 긴급 상황 신고 및 관리
- ✅ 사용자 신원 인증 시스템
- ✅ 개인별 안전 설정 관리
- ✅ 미성년자 보호 정책

## 🗄️ 데이터베이스 마이그레이션

### 1단계: Supabase SQL Editor 열기

1. [Supabase Dashboard](https://app.supabase.com) 접속
2. 프로젝트 선택
3. 왼쪽 메뉴에서 **SQL Editor** 클릭

### 2단계: 스키마 적용

`scripts/user-safety-system.sql` 파일의 전체 내용을 복사하여 SQL Editor에 붙여넣고 실행합니다.

```sql
-- 파일 내용 복사 후 실행
-- 실행 버튼 클릭 또는 Ctrl + Enter
```

#### 생성되는 테이블

1. **user_verifications** - 사용자 신원 확인 및 인증
2. **meetup_feedback** - 모임 후 안전 확인 및 피드백
3. **age_verification_logs** - 연령 인증 로그 (개인정보보호법 대응)
4. **minor_protection_policies** - 미성년자 보호 정책
5. **user_safety_settings** - 사용자별 안전 설정
6. **emergency_reports** - 긴급 상황 신고 및 처리

### 3단계: RLS 정책 확인

스크립트 실행 후 다음 RLS 정책이 자동으로 활성화됩니다:

- ✅ 사용자는 자신의 데이터만 조회/수정 가능
- ✅ 관리자는 모든 데이터 접근 가능
- ✅ 피드백은 작성자와 호스트만 조회 가능
- ✅ 긴급 신고는 신고자만 조회 가능

## 🔌 API 엔드포인트

### 안전 피드백 API

```typescript
// POST /api/safety/feedback - 모임 후 피드백 제출
fetch('/api/safety/feedback', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    room_id: 'uuid',
    host_id: 'uuid',
    safety_rating: 5,
    experience_rating: 5,
    feedback_text: '좋은 모임이었습니다',
    safety_checklist: {
      met_in_public: true,
      felt_safe: true,
      host_was_respectful: true,
      would_meet_again: true,
      emergency_contacts_available: false,
    },
    has_safety_concern: false,
    is_anonymous: false,
  }),
})

// GET /api/safety/feedback - 내 피드백 조회
fetch('/api/safety/feedback')
```

### 긴급 신고 API

```typescript
// POST /api/safety/emergency - 긴급 상황 신고
fetch('/api/safety/emergency', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    reported_user_id: 'uuid',
    room_id: 'uuid',
    emergency_type: 'safety_threat',
    description: '상세 설명',
    location_info: '강남역 근처',
  }),
})

// GET /api/safety/emergency - 긴급 신고 목록 (관리자 전용)
fetch('/api/safety/emergency')

// PATCH /api/safety/emergency - 신고 상태 업데이트 (관리자 전용)
fetch('/api/safety/emergency', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    report_id: 'uuid',
    status: 'resolved',
    resolution_notes: '처리 완료',
  }),
})
```

### 안전 설정 API

```typescript
// GET /api/safety/settings - 내 안전 설정 조회
fetch('/api/safety/settings')

// PATCH /api/safety/settings - 안전 설정 업데이트
fetch('/api/safety/settings', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    allow_adult_only_meetings: true,
    require_verified_users_only: false,
    safety_reminder_enabled: true,
  }),
})
```

### 사용자 인증 API

```typescript
// POST /api/safety/verification - 인증 요청
fetch('/api/safety/verification', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verification_type: 'phone',
    verification_data: { phone: '010-1234-5678' },
  }),
})

// GET /api/safety/verification - 내 인증 상태 조회
fetch('/api/safety/verification')

// PATCH /api/safety/verification - 인증 승인 (관리자 전용)
fetch('/api/safety/verification', {
  method: 'PATCH',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    verification_id: 'uuid',
    status: 'verified',
  }),
})
```

## 🎨 UI 컴포넌트 사용법

### 안전 피드백 모달

```tsx
import { SafetyFeedbackModal } from '@/components/safety/SafetyFeedbackModal'

<SafetyFeedbackModal
  roomId="room-uuid"
  hostId="host-uuid"
  roomTitle="강남 맥주 모임"
  onClose={() => setShowFeedback(false)}
/>
```

### 긴급 신고 버튼

```tsx
import { EmergencyReportButton } from '@/components/safety/EmergencyReportButton'

<EmergencyReportButton
  reportedUserId="user-uuid"
  roomId="room-uuid"
  className="mt-4"
/>
```

## 📊 관리자 대시보드

안전 통계 조회를 위한 SQL 뷰:

```sql
-- 사용자 안전 대시보드
SELECT * FROM user_safety_dashboard;

-- 안전 통계
SELECT * FROM safety_statistics;
```

## 🔐 보안 고려사항

1. **개인정보 보호**
   - 인증 데이터는 암호화하여 저장
   - 피드백은 익명 제출 옵션 제공
   - 민감한 정보는 로그에 기록하지 않음

2. **권한 관리**
   - 관리자만 긴급 신고 조회/처리 가능
   - 일반 사용자는 자신의 데이터만 접근
   - RLS 정책으로 데이터 격리

3. **알림 시스템**
   - 긴급 신고 시 관리자에게 즉시 알림
   - 안전 문제 발견 시 우선순위 자동 설정

## 🧪 테스트 방법

### 1. 피드백 제출 테스트

```bash
curl -X POST http://localhost:3001/api/safety/feedback \
  -H "Content-Type: application/json" \
  -d '{
    "room_id": "test-room-id",
    "host_id": "test-host-id",
    "safety_rating": 5,
    "experience_rating": 5
  }'
```

### 2. 긴급 신고 테스트

```bash
curl -X POST http://localhost:3001/api/safety/emergency \
  -H "Content-Type: application/json" \
  -d '{
    "reported_user_id": "test-user-id",
    "emergency_type": "safety_threat",
    "description": "테스트 신고"
  }'
```

## 📈 모니터링

### 주요 지표

- 안전 피드백 평균 점수
- 긴급 신고 건수 및 처리 시간
- 인증 완료율
- 안전 문제 재발률

### 로그 확인

```typescript
// 로그 검색 키워드
- "Safety concern reported"
- "Emergency report created"
- "Verification request created"
```

## 🚀 배포 체크리스트

- [ ] Supabase에 `user-safety-system.sql` 실행
- [ ] RLS 정책 활성화 확인
- [ ] API 엔드포인트 테스트
- [ ] UI 컴포넌트 통합 테스트
- [ ] 관리자 계정으로 긴급 신고 처리 테스트
- [ ] 프로덕션 환경 배포
- [ ] 모니터링 대시보드 설정

## 📞 문제 해결

### 일반적인 문제

1. **RLS 정책 에러**
   - 해결: Supabase에서 RLS 정책 활성화 확인

2. **관리자 권한 오류**
   - 해결: profiles 테이블에서 사용자 role을 'admin'으로 설정

3. **피드백 저장 실패**
   - 해결: room_id와 host_id가 유효한지 확인

## 🎯 향후 개선 사항

- [ ] AI 기반 안전 위험 자동 감지
- [ ] 실시간 안전 알림 시스템
- [ ] 커뮤니티 안전 등급 시스템
- [ ] 안전 교육 콘텐츠 제공
- [ ] 지역별 안전 통계 시각화

---

**버전**: 1.0.0
**최종 업데이트**: 2025년 10월
**작성자**: MeetPin 개발팀
