# 밋핀(MeetPin) Supabase 설정 가이드

이 가이드는 밋핀 애플리케이션을 위한 완전한 Supabase 데이터베이스 및 스토리지 설정 방법을 안내합니다.

## 🚀 1단계: 데이터베이스 스키마 설정

### Supabase SQL Editor에서 실행:

1. Supabase 대시보드 → SQL Editor 이동
2. `scripts/complete-setup.sql` 파일의 내용을 복사
3. SQL Editor에서 실행 (Run 버튼 클릭)

이 스크립트는 다음을 생성합니다:
- ✅ 모든 테이블 (profiles, rooms, requests, matches, messages, host_messages, reports, blocked_users)
- ✅ 인덱스 (성능 최적화)
- ✅ 트리거 (자동화)
- ✅ RLS 정책 (보안)
- ✅ Realtime 설정
- ✅ 관리자 통계 뷰

## 📁 2단계: 스토리지 버킷 생성 (필수!)

### Storage 버킷 생성:

1. **Supabase 대시보드 → Storage 섹션으로 이동**

2. **"Create a new bucket" 클릭**

3. **버킷 설정:**
   ```
   Bucket name: images
   Public bucket: ✅ 체크 (중요!)
   File size limit: 50MB
   Allowed MIME types: image/jpeg, image/png, image/webp, image/gif
   ```

4. **RLS 정책 추가:**
   - 버킷 생성 후 "Policies" 탭으로 이동
   - "Add policy" → "For full customization" 선택
   - 다음 정책들을 추가:

   **SELECT (읽기) 정책:**
   ```sql
   CREATE POLICY "이미지 읽기 허용" ON storage.objects
   FOR SELECT USING (bucket_id = 'images');
   ```

   **INSERT (업로드) 정책:**
   ```sql
   CREATE POLICY "인증된 사용자 이미지 업로드" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **UPDATE (수정) 정책:**
   ```sql
   CREATE POLICY "소유자만 이미지 수정 가능" ON storage.objects
   FOR UPDATE USING (
     bucket_id = 'images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

   **DELETE (삭제) 정책:**
   ```sql
   CREATE POLICY "소유자만 이미지 삭제 가능" ON storage.objects
   FOR DELETE USING (
     bucket_id = 'images' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

### 폴더 구조:
스토리지 버킷 내부 구조는 다음과 같습니다:
```
images/
├── {user_id}/           # 사용자별 폴더
│   ├── profile/         # 프로필 이미지
│   └── rooms/          # 방 이미지
└── avatars/            # 기본 아바타 (선택사항)
```

## 🔑 3단계: 환경 변수 설정

### `.env.local` 파일에 다음 환경 변수들을 설정:

```env
# Supabase 설정 (필수)
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Kakao Maps (필수)
NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY=your-kakao-key

# Stripe 결제 (선택 - 부스트 기능용)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Stripe Price IDs (선택 - 고정 상품 사용 시)
STRIPE_PRICE_1D_ID=price_...
STRIPE_PRICE_3D_ID=price_...
STRIPE_PRICE_7D_ID=price_...

# 애플리케이션 URL
SITE_URL=http://localhost:3000

# Feature Flags (선택)
NEXT_PUBLIC_ENABLE_STRIPE_CHECKOUT=true
NEXT_PUBLIC_ENABLE_REALTIME_NOTIFICATIONS=true
NEXT_PUBLIC_ENABLE_FILE_UPLOAD=true
```

## 🧪 4단계: 샘플 데이터 추가 (개발용)

개발 환경에서 테스트를 위해 샘플 데이터를 추가:

```sql
-- scripts/seed.sql 내용을 Supabase SQL Editor에서 실행
```

## 🔧 5단계: Authentication 설정

### Supabase Auth 설정:

1. **Authentication → Settings**에서 다음 설정:
   ```
   Site URL: http://localhost:3000 (개발) / https://yourdomain.com (프로덕션)
   Redirect URLs: 
     - http://localhost:3000/auth/callback
     - https://yourdomain.com/auth/callback
   ```

2. **Email Auth 설정:**
   - Email confirmation: 비활성화 (개발 편의용) 또는 활성화 (프로덕션)
   - Email templates 한국어로 커스터마이즈

3. **Providers (선택사항):**
   - Kakao OAuth 설정 (KAKAO_CLIENT_ID, KAKAO_CLIENT_SECRET)

## ✅ 6단계: 설정 검증

### 설정이 올바른지 확인:

1. **데이터베이스 테이블 확인:**
   ```sql
   SELECT table_name FROM information_schema.tables 
   WHERE table_schema = 'public';
   ```

2. **스토리지 버킷 확인:**
   ```sql
   SELECT * FROM storage.buckets WHERE name = 'images';
   ```

3. **RLS 정책 확인:**
   ```sql
   SELECT schemaname, tablename, policyname 
   FROM pg_policies 
   WHERE schemaname = 'public';
   ```

4. **애플리케이션 실행 테스트:**
   ```bash
   pnpm dev
   ```

## 🚨 문제 해결

### 자주 발생하는 오류들:

**1. "relation does not exist" 오류:**
- `scripts/complete-setup.sql`을 다시 실행
- 모든 테이블이 `public` 스키마에 생성되었는지 확인

**2. "bucket does not exist" 오류:**
- Storage → Buckets에서 `images` 버킷 생성 확인
- 버킷이 Public으로 설정되었는지 확인

**3. "insufficient_privilege" 오류:**
- RLS 정책이 올바르게 설정되었는지 확인
- 사용자가 인증되었는지 확인

**4. 이미지 업로드 실패:**
- Storage 버킷의 RLS 정책 확인
- 파일 크기 제한 (50MB) 확인
- MIME 타입 허용 설정 확인

### 추가 도움말:

- **Supabase 공식 문서:** https://supabase.com/docs
- **밋핀 프로젝트 Issue:** https://github.com/your-repo/issues
- **개발 모드:** Mock 데이터를 사용하여 Supabase 없이도 개발 가능

---

## 🎯 완료 체크리스트:

- [ ] `scripts/complete-setup.sql` 실행 완료
- [ ] `images` 스토리지 버킷 생성 및 Public 설정
- [ ] RLS 정책 4개 모두 추가
- [ ] 환경 변수 `.env.local` 설정
- [ ] Authentication 설정 완료
- [ ] `pnpm dev` 실행 성공
- [ ] 로그인/회원가입 테스트 완료
- [ ] 이미지 업로드 테스트 완료

모든 항목이 체크되면 밋핀 애플리케이션이 완전히 설정된 상태입니다! 🎉