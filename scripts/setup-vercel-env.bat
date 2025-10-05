@echo off
REM Vercel 환경 변수 자동 설정 스크립트 (Windows)
REM 사용법: vercel login 후 실행
REM scripts\setup-vercel-env.bat

echo 🚀 Vercel 환경 변수 설정 시작...
echo.

echo 1/5 Setting NEXT_PUBLIC_SUPABASE_URL...
echo https://xnrqfkecpabucnoxxtwa.supabase.co | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development

echo 2/5 Setting NEXT_PUBLIC_SUPABASE_ANON_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYyNzUyNjYsImV4cCI6MjA3MTg1MTI2Nn0.YkIzsHezbQwLKc7hTM9akTZEh6kT2m9MLzmaIwpXEks | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development

echo 3/5 Setting SUPABASE_SERVICE_ROLE_KEY...
echo eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development

echo 4/5 Setting NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY...
echo 11764377687ae8ad3d8decc7ac0078d5 | vercel env add NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY production preview development

echo 5/5 Setting SITE_URL...
echo https://meetpin-weld.vercel.app | vercel env add SITE_URL production

echo.
echo ✅ 모든 환경 변수 설정 완료!
echo.
echo 📊 설정된 변수:
echo   - NEXT_PUBLIC_SUPABASE_URL
echo   - NEXT_PUBLIC_SUPABASE_ANON_KEY
echo   - SUPABASE_SERVICE_ROLE_KEY
echo   - NEXT_PUBLIC_KAKAO_JAVASCRIPT_KEY
echo   - SITE_URL
echo.
echo 🔄 다음 단계:
echo   1. Vercel에서 자동 재배포 (2-3분)
echo   2. Health Check: curl https://meetpin-weld.vercel.app/api/health
echo   3. 'database: connected' 확인
echo.
pause
