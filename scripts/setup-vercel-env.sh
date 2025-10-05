#!/bin/bash

# Vercel 환경 변수 자동 설정 스크립트
# 사용법: vercel login 후 실행
# bash scripts/setup-vercel-env.sh

echo "🚀 Vercel 환경 변수 설정 시작..."
echo ""

# Supabase 변수
echo "1/5 Setting NEXT_PUBLIC_SUPABASE_URL..."
vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development <<EOF
https://xnrqfkecpabucnoxxtwa.supabase.co
EOF

echo "2/5 Setting NEXT_PUBLIC_SUPABASE_ANON_KEY..."
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzUyNjYsImV4cCI6MjA3MTg1MTI2Nn0.YkIzsHezbQwLKc7hTM9akTZEh6kT2m9MLzmaIwpXEks
EOF

echo "3/5 Setting SUPABASE_SERVICE_ROLE_KEY..."
vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development <<EOF
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc
EOF

# Kakao Maps 변수
echo "4/5 Setting NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY..."
vercel env add NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY production preview development <<EOF
11764377687ae8ad3d8decc7ac0078d5
EOF

# Site URL 변수
echo "5/5 Setting SITE_URL..."
vercel env add SITE_URL production <<EOF
https://meetpin-weld.vercel.app
EOF

echo ""
echo "✅ 모든 환경 변수 설정 완료!"
echo ""
echo "📊 설정된 변수:"
echo "  - NEXT_PUBLIC_SUPABASE_URL"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
echo "  - SUPABASE_SERVICE_ROLE_KEY"
echo "  - NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY"
echo "  - SITE_URL"
echo ""
echo "🔄 다음 단계:"
echo "  1. Vercel에서 자동 재배포 (2-3분)"
echo "  2. Health Check: curl https://meetpin-weld.vercel.app/api/health"
echo "  3. 'database: connected' 확인"
echo ""
