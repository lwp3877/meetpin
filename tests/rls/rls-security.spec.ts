/* tests/rls/rls-security.spec.ts */
// 🔒 Row Level Security 정책 테스트 스위트
// 무단 접근 및 권한 상승 공격 방어 테스트

import { createClient } from '@supabase/supabase-js'
import { describe, test, expect, beforeAll, afterAll } from '@jest/globals'

// 테스트 환경 설정
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 관리자 클라이언트 (RLS 우회)
const adminClient = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

// 일반 사용자 클라이언트들
const createUserClient = () => createClient(SUPABASE_URL, SUPABASE_ANON_KEY)

// 테스트 데이터
const testUsers = {
  alice: {
    email: 'alice.test@example.com',
    password: 'test123456',
    nickname: 'Alice',
    uid: null as string | null,
  },
  bob: {
    email: 'bob.test@example.com',
    password: 'test123456',
    nickname: 'Bob',
    uid: null as string | null,
  },
  charlie: {
    email: 'charlie.test@example.com',
    password: 'test123456',
    nickname: 'Charlie',
    uid: null as string | null,
  },
}

let testRoom: any = null
let testRequest: any = null

describe('🔒 RLS Security Test Suite', () => {
  beforeAll(async () => {
    // 테스트 사용자 생성
    for (const user of Object.values(testUsers)) {
      const { data: authData } = await adminClient.auth.admin.createUser({
        email: user.email,
        password: user.password,
        email_confirm: true,
      })

      if (authData.user) {
        user.uid = authData.user.id

        // 프로필 생성
        await adminClient.from('profiles').insert({
          uid: authData.user.id,
          email: user.email,
          nickname: user.nickname,
          age_range: '20s_late',
          role: 'user',
        })
      }
    }

    // 테스트 방 생성 (Alice가 호스트)
    const { data: roomData } = await adminClient
      .from('rooms')
      .insert({
        title: 'RLS Test Room',
        description: 'Test room for RLS policies',
        host_uid: testUsers.alice.uid,
        location: 'Seoul',
        latitude: 37.5665,
        longitude: 126.978,
        meeting_time: new Date(Date.now() + 86400000).toISOString(),
        max_participants: 4,
        category: 'test',
        visibility: 'public',
        status: 'active',
      })
      .select()
      .single()

    testRoom = roomData
  })

  afterAll(async () => {
    // 테스트 데이터 정리
    if (testRoom) {
      await adminClient.from('rooms').delete().eq('id', testRoom.id)
    }

    for (const user of Object.values(testUsers)) {
      if (user.uid) {
        await adminClient.auth.admin.deleteUser(user.uid)
        await adminClient.from('profiles').delete().eq('uid', user.uid)
      }
    }
  })

  describe('👤 Profile RLS Tests', () => {
    test('사용자는 자신의 프로필만 조회 가능', async () => {
      const aliceClient = createUserClient()

      // Alice 로그인
      await aliceClient.auth.signInWithPassword({
        email: testUsers.alice.email,
        password: testUsers.alice.password,
      })

      // 자신의 프로필 조회 (성공)
      const { data: ownProfile, error: ownError } = await aliceClient
        .from('profiles')
        .select('*')
        .eq('uid', testUsers.alice.uid)
        .single()

      expect(ownError).toBeNull()
      expect(ownProfile).toBeTruthy()
      expect(ownProfile.nickname).toBe('Alice')

      // 다른 사용자 프로필 직접 조회 시도 (실패해야 함)
      const { data: otherProfile, error: otherError } = await aliceClient
        .from('profiles')
        .select('*')
        .eq('uid', testUsers.bob.uid)
        .single()

      // RLS에 의해 차단되어야 함
      expect(otherProfile).toBeNull()
    })

    test('사용자는 자신의 프로필만 수정 가능', async () => {
      const bobClient = createUserClient()

      // Bob 로그인
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // 자신의 프로필 수정 (성공)
      const { error: updateOwnError } = await bobClient
        .from('profiles')
        .update({ nickname: 'Bob Updated' })
        .eq('uid', testUsers.bob.uid)

      expect(updateOwnError).toBeNull()

      // 다른 사용자 프로필 수정 시도 (실패)
      const { error: updateOtherError } = await bobClient
        .from('profiles')
        .update({ nickname: 'Hacked Alice' })
        .eq('uid', testUsers.alice.uid)

      expect(updateOtherError).toBeTruthy()
    })
  })

  describe('🏠 Room RLS Tests', () => {
    test('공개 방은 모든 사용자가 조회 가능', async () => {
      const charlieClient = createUserClient()

      // Charlie 로그인
      await charlieClient.auth.signInWithPassword({
        email: testUsers.charlie.email,
        password: testUsers.charlie.password,
      })

      // 공개 방 조회 (성공)
      const { data: rooms, error } = await charlieClient
        .from('rooms')
        .select('*')
        .eq('id', testRoom.id)

      expect(error).toBeNull()
      expect(rooms).toHaveLength(1)
      expect(rooms![0].title).toBe('RLS Test Room')
    })

    test('방 호스트만 방 수정 가능', async () => {
      const aliceClient = createUserClient()
      const bobClient = createUserClient()

      // Alice (호스트) 로그인
      await aliceClient.auth.signInWithPassword({
        email: testUsers.alice.email,
        password: testUsers.alice.password,
      })

      // Bob (비호스트) 로그인
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // 호스트의 방 수정 (성공)
      const { error: hostUpdateError } = await aliceClient
        .from('rooms')
        .update({ title: 'Updated by Host' })
        .eq('id', testRoom.id)

      expect(hostUpdateError).toBeNull()

      // 비호스트의 방 수정 시도 (실패)
      const { error: nonHostUpdateError } = await bobClient
        .from('rooms')
        .update({ title: 'Hacked by Bob' })
        .eq('id', testRoom.id)

      expect(nonHostUpdateError).toBeTruthy()
    })

    test('방 생성 시 host_uid는 현재 사용자와 일치해야 함', async () => {
      const bobClient = createUserClient()

      // Bob 로그인
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // 올바른 host_uid로 방 생성 (성공)
      const { error: validCreateError } = await bobClient.from('rooms').insert({
        title: 'Bob Room',
        description: 'Room by Bob',
        host_uid: testUsers.bob.uid,
        location: 'Seoul',
        latitude: 37.5665,
        longitude: 126.978,
        meeting_time: new Date(Date.now() + 86400000).toISOString(),
        max_participants: 3,
        category: 'test',
        visibility: 'public',
        status: 'active',
      })

      expect(validCreateError).toBeNull()

      // 다른 사용자 ID로 방 생성 시도 (실패)
      const { error: invalidCreateError } = await bobClient.from('rooms').insert({
        title: 'Fake Alice Room',
        description: 'Impersonating Alice',
        host_uid: testUsers.alice.uid, // 잘못된 host_uid
        location: 'Seoul',
        latitude: 37.5665,
        longitude: 126.978,
        meeting_time: new Date(Date.now() + 86400000).toISOString(),
        max_participants: 3,
        category: 'test',
        visibility: 'public',
        status: 'active',
      })

      expect(invalidCreateError).toBeTruthy()
    })
  })

  describe('📋 Request RLS Tests', () => {
    test('사용자는 자신의 방에 참가 신청할 수 없음', async () => {
      const aliceClient = createUserClient()

      // Alice (방 호스트) 로그인
      await aliceClient.auth.signInWithPassword({
        email: testUsers.alice.email,
        password: testUsers.alice.password,
      })

      // 자신의 방에 참가 신청 시도 (실패해야 함)
      const { error } = await aliceClient.from('requests').insert({
        room_id: testRoom.id,
        user_id: testUsers.alice.uid,
        status: 'pending',
        message: 'Self join attempt',
      })

      expect(error).toBeTruthy()
    })

    test('방 호스트만 참가 신청을 수락/거절 가능', async () => {
      const aliceClient = createUserClient()
      const bobClient = createUserClient()
      const charlieClient = createUserClient()

      // 각자 로그인
      await aliceClient.auth.signInWithPassword({
        email: testUsers.alice.email,
        password: testUsers.alice.password,
      })

      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      await charlieClient.auth.signInWithPassword({
        email: testUsers.charlie.email,
        password: testUsers.charlie.password,
      })

      // Bob이 참가 신청
      const { data: requestData, error: requestError } = await bobClient
        .from('requests')
        .insert({
          room_id: testRoom.id,
          user_id: testUsers.bob.uid,
          status: 'pending',
          message: 'Please accept me',
        })
        .select()
        .single()

      expect(requestError).toBeNull()
      testRequest = requestData

      // Alice (호스트)가 신청 수락 (성공)
      const { error: hostUpdateError } = await aliceClient
        .from('requests')
        .update({ status: 'accepted' })
        .eq('id', requestData.id)

      expect(hostUpdateError).toBeNull()

      // Charlie가 Bob의 신청 상태 변경 시도 (실패)
      const { error: nonHostUpdateError } = await charlieClient
        .from('requests')
        .update({ status: 'rejected' })
        .eq('id', requestData.id)

      expect(nonHostUpdateError).toBeTruthy()
    })
  })

  describe('💬 Message RLS Tests', () => {
    test('매칭되지 않은 사용자는 메시지를 볼 수 없음', async () => {
      // 먼저 테스트용 매치 생성
      const { data: matchData } = await adminClient
        .from('matches')
        .insert({
          room_id: testRoom.id,
          user1_id: testUsers.alice.uid,
          user2_id: testUsers.bob.uid,
          status: 'active',
        })
        .select()
        .single()

      // Alice와 Bob 간의 메시지 생성
      await adminClient.from('messages').insert({
        match_id: matchData.id,
        sender_id: testUsers.alice.uid,
        content: 'Secret message from Alice',
        message_type: 'text',
      })

      const charlieClient = createUserClient()

      // Charlie 로그인
      await charlieClient.auth.signInWithPassword({
        email: testUsers.charlie.email,
        password: testUsers.charlie.password,
      })

      // Charlie가 Alice-Bob 간의 메시지 조회 시도 (실패)
      const { data: messages, error } = await charlieClient
        .from('messages')
        .select('*')
        .eq('match_id', matchData.id)

      expect(messages).toEqual([]) // 빈 배열이어야 함
    })
  })

  describe('🚫 Blocked Users RLS Tests', () => {
    test('차단된 사용자는 서로의 프로필을 볼 수 없음', async () => {
      const aliceClient = createUserClient()
      const bobClient = createUserClient()

      // Alice 로그인 후 Bob 차단
      await aliceClient.auth.signInWithPassword({
        email: testUsers.alice.email,
        password: testUsers.alice.password,
      })

      await aliceClient.from('blocked_users').insert({
        blocker_id: testUsers.alice.uid,
        blocked_id: testUsers.bob.uid,
      })

      // Bob 로그인
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // Bob이 Alice 프로필 조회 시도 (실패)
      const { data: aliceProfile } = await bobClient
        .from('profiles')
        .select('*')
        .eq('uid', testUsers.alice.uid)

      expect(aliceProfile).toEqual([])

      // Alice가 Bob 프로필 조회 시도 (실패)
      const { data: bobProfile } = await aliceClient
        .from('profiles')
        .select('*')
        .eq('uid', testUsers.bob.uid)

      expect(bobProfile).toEqual([])
    })
  })

  describe('🛡️ Admin RLS Tests', () => {
    test('일반 사용자는 관리자 권한 획득 불가', async () => {
      const bobClient = createUserClient()

      // Bob 로그인
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // Bob이 자신을 관리자로 승격 시도 (실패)
      const { error } = await bobClient
        .from('profiles')
        .update({ role: 'admin' })
        .eq('uid', testUsers.bob.uid)

      expect(error).toBeTruthy()
    })

    test('관리자 권한 없이는 모든 데이터 조회 불가', async () => {
      const bobClient = createUserClient()

      // Bob 로그인 (일반 사용자)
      await bobClient.auth.signInWithPassword({
        email: testUsers.bob.email,
        password: testUsers.bob.password,
      })

      // 모든 신고 내역 조회 시도 (실패)
      const { data: allReports } = await bobClient.from('reports').select('*')

      // 자신이 작성한 신고만 볼 수 있어야 함
      expect(allReports?.length || 0).toBeLessThanOrEqual(1)
    })
  })
})

// 성능 테스트
describe('📊 RLS Performance Tests', () => {
  test('대량 데이터에서 RLS 성능 확인', async () => {
    const aliceClient = createUserClient()

    await aliceClient.auth.signInWithPassword({
      email: testUsers.alice.email,
      password: testUsers.alice.password,
    })

    const startTime = Date.now()

    // 1000개 방 조회 (RLS 필터링 포함)
    const { data: rooms, error } = await aliceClient.from('rooms').select('*').limit(1000)

    const endTime = Date.now()
    const queryTime = endTime - startTime

    expect(error).toBeNull()
    expect(queryTime).toBeLessThan(1000) // 1초 이내

    console.log(`RLS 필터링 쿼리 성능: ${queryTime}ms for ${rooms?.length || 0} rooms`)
  })
})
