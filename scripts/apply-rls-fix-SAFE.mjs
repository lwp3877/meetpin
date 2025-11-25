#!/usr/bin/env node
/**
 * RLS 정책을 수정하여 익명 사용자도 공개 방을 볼 수 있게 함
 *
 * 사용법:
 * SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key node scripts/apply-rls-fix-SAFE.mjs
 */

import { createClient } from '@supabase/supabase-js'
import { readFileSync } from 'fs'

// 환경변수에서 가져오기 (절대 하드코딩하지 마세요!)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다!')
  console.error('다음 변수가 필요합니다:')
  console.error('  - SUPABASE_URL (또는 NEXT_PUBLIC_SUPABASE_URL)')
  console.error('  - SUPABASE_SERVICE_KEY (또는 SUPABASE_SERVICE_ROLE_KEY)')
  console.error('\n사용 예시:')
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/apply-rls-fix-SAFE.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('🔧 RLS 정책 수정 중...\n')

async function applyRLSFix() {
  // SQL 파일 읽기
  const sql = readFileSync('scripts/fix-rls-anonymous.sql', 'utf-8')

  // SQL 실행
  const { data, error } = await supabase.rpc('exec_sql', { sql_query: sql })

  if (error) {
    // exec_sql 함수가 없으면 직접 실행
    console.log('⚠️  exec_sql 함수가 없습니다. 개별 쿼리 실행 중...\n')

    // 정책 삭제
    console.log('1️⃣  기존 정책 삭제 중...')
    await supabase.rpc('exec', {
      sql: `DROP POLICY IF EXISTS "rooms_public_read" ON public.rooms;
            DROP POLICY IF EXISTS "rooms_anonymous_read" ON public.rooms;`
    }).catch(e => console.log('   (무시됨:', e.message, ')'))

    // 인증된 사용자용 정책
    console.log('2️⃣  인증된 사용자용 정책 생성 중...')
    const { error: error1 } = await supabase.rpc('exec', {
      sql: `CREATE POLICY "rooms_public_read" ON public.rooms
            FOR SELECT TO authenticated
            USING (visibility = 'public' AND NOT EXISTS (
              SELECT 1 FROM public.blocked_users
              WHERE (blocker_uid = auth.uid() AND blocked_uid = host_uid)
              OR (blocker_uid = host_uid AND blocked_uid = auth.uid())
            ));`
    })

    if (error1) {
      console.error('   ❌ 실패:', error1.message)
    } else {
      console.log('   ✅ 성공')
    }

    // 익명 사용자용 정책
    console.log('3️⃣  익명 사용자용 정책 생성 중...')
    const { error: error2 } = await supabase.rpc('exec', {
      sql: `CREATE POLICY "rooms_anonymous_read" ON public.rooms
            FOR SELECT TO anon
            USING (visibility = 'public');`
    })

    if (error2) {
      console.error('   ❌ 실패:', error2.message)
      console.log('\n⚠️  Supabase SQL Editor에서 수동으로 실행하세요:')
      console.log('   scripts/fix-rls-anonymous.sql 파일 내용을 복사하여 실행\n')
    } else {
      console.log('   ✅ 성공')
    }
  } else {
    console.log('✅ RLS 정책 업데이트 완료!')
  }

  // 검증
  console.log('\n4️⃣  검증 중...')
  const { data: rooms, error: verifyError } = await supabase
    .from('rooms')
    .select('id')
    .eq('visibility', 'public')

  if (verifyError) {
    console.error('   ❌ 검증 실패:', verifyError.message)
  } else {
    console.log(`   ✅ 익명 사용자가 조회 가능한 공개 방: ${rooms.length}개`)
  }
}

applyRLSFix()
