#!/usr/bin/env node
/**
 * 프로덕션 데이터베이스 직접 확인
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xnrqfkecpabucnoxxtwa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

console.log('🔍 프로덕션 데이터베이스 확인 중...\n')

async function checkRooms() {
  const { data, error, count } = await supabase
    .from('rooms')
    .select('*', { count: 'exact' })
    .gte('lat', 37.4)
    .lte('lat', 37.7)
    .gte('lng', 126.8)
    .lte('lng', 127.2)

  if (error) {
    console.error('❌ 에러:', error)
    return
  }

  console.log(`✅ 총 방 개수: ${count}개`)
  console.log(`✅ 조회된 방: ${data.length}개\n`)

  if (data.length > 0) {
    console.log('최근 10개 방:')
    data.slice(0, 10).forEach((room, i) => {
      console.log(`${i + 1}. ${room.title}`)
      console.log(`   - 위치: ${room.place_text} (${room.lat}, ${room.lng})`)
      console.log(`   - 카테고리: ${room.category}`)
      console.log(`   - 시작: ${new Date(room.start_at).toLocaleString('ko-KR')}`)
      console.log('')
    })
  }
}

checkRooms()
