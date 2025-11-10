#!/usr/bin/env node
/**
 * 프로덕션 데이터베이스에 샘플 데이터 추가
 * 실제 스키마에 맞춰 수정됨
 */

import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = 'https://xnrqfkecpabucnoxxtwa.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhucnFma2VjcGFidWNub3h4dHdhIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NjI3NTI2NiwiZXhwIjoyMDcxODUxMjY2fQ.YxKU1hb8F9hTrjGP5UgoeCClaihaZDH7nZf3u0UQLWc'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

console.log('🚀 프로덕션 샘플 데이터 생성 시작...\n')

async function createTestUser() {
  console.log('1️⃣ 테스트 계정 생성 중...')

  const email = 'test@meetpin.com'
  const password = 'Test1234!'

  const { data: existingUsers } = await supabase.auth.admin.listUsers()
  const existingUser = existingUsers?.users?.find(u => u.email === email)

  if (existingUser) {
    console.log(`   ✅ 기존 계정 발견: ${email} (ID: ${existingUser.id})`)
    return existingUser.id
  }

  const { data: newUser, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      nickname: '밋핀테스터'
    }
  })

  if (error) {
    console.error('   ❌ 사용자 생성 실패:', error.message)
    throw error
  }

  console.log(`   ✅ 계정 생성 완료: ${email} (ID: ${newUser.user.id})`)

  // 프로필 생성 (uid 컬럼 사용)
  const { error: profileError } = await supabase
    .from('profiles')
    .insert({
      uid: newUser.user.id,
      nickname: '밋핀테스터',
      age_range: '20s_early'
    })

  if (profileError) {
    console.error('   ⚠️ 프로필 생성 실패:', profileError.message)
  } else {
    console.log('   ✅ 프로필 생성 완료')
  }

  return newUser.user.id
}

async function createSampleRooms(userId) {
  console.log('\n2️⃣ 샘플 방 10개 생성 중...')

  const now = new Date()
  const today7pm = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 19, 0, 0)
  const tomorrow2pm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 14, 0, 0)
  const tomorrow8pm = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 20, 0, 0)

  // 실제 스키마: host_uid, title, category, lat, lng, place_text, start_at, max_people, fee, visibility
  const rooms = [
    {
      host_uid: userId,
      title: '강남에서 치맥 한잔 🍗🍺',
      category: 'drink',
      lat: 37.4979,
      lng: 127.0276,
      place_text: '강남역 교보타워',
      start_at: today7pm.toISOString(),
      max_people: 5,
      fee: 15000
    },
    {
      host_uid: userId,
      title: '홍대 농구 같이하실 분 🏀',
      category: 'exercise',
      lat: 37.5566,
      lng: 126.9238,
      place_text: '홍대 농구장',
      start_at: new Date(now.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      max_people: 8,
      fee: 0
    },
    {
      host_uid: userId,
      title: '잠실 롯데월드 같이 가요 🎢',
      category: 'other',
      lat: 37.5133,
      lng: 127.1000,
      place_text: '롯데월드',
      start_at: tomorrow2pm.toISOString(),
      max_people: 6,
      fee: 50000
    },
    {
      host_uid: userId,
      title: '이태원 와인바 투어 🍷',
      category: 'drink',
      lat: 37.5345,
      lng: 126.9946,
      place_text: '이태원 경리단길',
      start_at: tomorrow8pm.toISOString(),
      max_people: 4,
      fee: 30000
    },
    {
      host_uid: userId,
      title: '신촌 보드게임카페 ♟️',
      category: 'other',
      lat: 37.5559,
      lng: 126.9364,
      place_text: '신촌 보드게임카페',
      start_at: new Date(now.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      max_people: 5,
      fee: 10000
    },
    {
      host_uid: userId,
      title: '여의도 한강 자전거 🚴',
      category: 'exercise',
      lat: 37.5219,
      lng: 126.9245,
      place_text: '여의도 한강공원',
      start_at: new Date(tomorrow2pm.getTime() - 4 * 60 * 60 * 1000).toISOString(),
      max_people: 6,
      fee: 5000
    },
    {
      host_uid: userId,
      title: '건대 포차 투어 🍢',
      category: 'drink',
      lat: 37.5402,
      lng: 127.0695,
      place_text: '건대 로데오거리',
      start_at: new Date(today7pm.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      max_people: 6,
      fee: 20000
    },
    {
      host_uid: userId,
      title: '명동 쇼핑 같이 해요 🛍️',
      category: 'other',
      lat: 37.5616,
      lng: 126.9844,
      place_text: '명동 메인거리',
      start_at: new Date(tomorrow2pm.getTime() + 1 * 60 * 60 * 1000).toISOString(),
      max_people: 4,
      fee: 0
    },
    {
      host_uid: userId,
      title: '압구정 테니스 치실 분 🎾',
      category: 'exercise',
      lat: 37.5273,
      lng: 127.0276,
      place_text: '압구정 테니스장',
      start_at: new Date(tomorrow2pm.getTime() - 5 * 60 * 60 * 1000).toISOString(),
      max_people: 4,
      fee: 15000
    },
    {
      host_uid: userId,
      title: '성수 카페거리 투어 ☕',
      category: 'drink',
      lat: 37.5446,
      lng: 127.0557,
      place_text: '성수 카페거리',
      start_at: new Date(tomorrow2pm.getTime() + 2 * 60 * 60 * 1000).toISOString(),
      max_people: 5,
      fee: 15000
    }
  ]

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < rooms.length; i++) {
    const room = rooms[i]
    const { data, error } = await supabase
      .from('rooms')
      .insert(room)
      .select()

    if (error) {
      console.error(`   ❌ 방 ${i + 1} 생성 실패:`, error.message)
      failCount++
    } else {
      console.log(`   ✅ 방 ${i + 1} 생성: ${room.title}`)
      successCount++
    }
  }

  console.log(`\n   📊 결과: ${successCount}개 성공, ${failCount}개 실패`)
  return successCount
}

async function verifyData() {
  console.log('\n3️⃣ 데이터 검증 중...')

  const { data: rooms, error } = await supabase
    .from('rooms')
    .select('id, title, category, lat, lng')
    .order('created_at', { ascending: false })
    .limit(10)

  if (error) {
    console.error('   ❌ 검증 실패:', error.message)
    return
  }

  console.log(`   ✅ 총 방 개수: ${rooms.length}개`)

  if (rooms.length > 0) {
    console.log('\n   최근 생성된 방:')
    rooms.forEach((room, i) => {
      console.log(`   ${i + 1}. ${room.title} (${room.category})`)
    })
  }
}

async function main() {
  try {
    const userId = await createTestUser()
    await createSampleRooms(userId)
    await verifyData()

    console.log('\n✅ 모든 작업 완료!')
    console.log('\n🌐 확인하기:')
    console.log('   - 프로덕션: https://meetpin-weld.vercel.app/map')
    console.log('   - 로컬: http://localhost:3001/map')
    console.log('\n🔑 테스트 계정:')
    console.log('   - 이메일: test@meetpin.com')
    console.log('   - 비밀번호: Test1234!')

  } catch (error) {
    console.error('\n❌ 오류 발생:', error)
    process.exit(1)
  }
}

main()
