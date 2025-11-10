#!/usr/bin/env node
/**
 * 과거 시간 방들을 미래 시간으로 업데이트
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xnrqfkecpabucnoxxtwa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc'

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
