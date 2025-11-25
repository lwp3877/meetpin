#!/usr/bin/env node
/**
 * 과거 시간 방들을 미래 시간으로 업데이트
 *
 * 사용법:
 * SUPABASE_URL=your_url SUPABASE_SERVICE_KEY=your_key node scripts/fix-room-times-SAFE.mjs
 */

import { createClient } from '@supabase/supabase-js'

// 환경변수에서 가져오기 (절대 하드코딩하지 마세요!)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다!')
  console.error('다음 변수가 필요합니다:')
  console.error('  - SUPABASE_URL (또는 NEXT_PUBLIC_SUPABASE_URL)')
  console.error('  - SUPABASE_SERVICE_KEY (또는 SUPABASE_SERVICE_ROLE_KEY)')
  console.error('\n사용 예시:')
  console.error('  SUPABASE_URL=https://xxx.supabase.co SUPABASE_SERVICE_KEY=xxx node scripts/fix-room-times-SAFE.mjs')
  process.exit(1)
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('🕐 방 시작 시간을 미래로 업데이트 중...\n')

async function fixRoomTimes() {
  // 모든 방 가져오기
  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, title, start_at')
    .order('created_at')

  if (error) {
    console.error('❌ 에러:', error.message)
    return
  }

  console.log(`📊 총 ${rooms.length}개 방 발견\n`)

  const now = new Date()
  const nowKST = new Date(now.getTime() + 9 * 60 * 60 * 1000) // KST = UTC+9

  let updated = 0

  for (const room of rooms) {
    const startAt = new Date(room.start_at)

    // 과거 시간이면 미래로 업데이트
    if (startAt < now) {
      // 내일 같은 시간으로 변경
      const tomorrow = new Date(nowKST)
      tomorrow.setDate(tomorrow.getDate() + 1)
      tomorrow.setHours(startAt.getUTCHours() + 9) // UTC -> KST 변환
      tomorrow.setMinutes(startAt.getUTCMinutes())
      tomorrow.setSeconds(0)
      tomorrow.setMilliseconds(0)

      // UTC로 다시 변환
      const tomorrowUTC = new Date(tomorrow.getTime() - 9 * 60 * 60 * 1000)

      const { error: updateError } = await supabase
        .from('rooms')
        .update({ start_at: tomorrowUTC.toISOString() })
        .eq('id', room.id)

      if (updateError) {
        console.error(`❌ ${room.title} 업데이트 실패:`, updateError.message)
      } else {
        console.log(`✅ ${room.title}`)
        console.log(`   ${startAt.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})} → ${tomorrow.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})}`)
        updated++
      }
    } else {
      console.log(`⏭️  ${room.title} - 이미 미래 시간 (${startAt.toLocaleString('ko-KR', {timeZone: 'Asia/Seoul'})})`)
    }
  }

  console.log(`\n📊 ${updated}개 방 업데이트 완료!`)
}

fixRoomTimes()
