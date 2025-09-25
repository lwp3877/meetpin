/* src/app/api/admin/seed/route.ts */
import { createMethodRouter, apiUtils, requireAdmin } from '@/lib/api'
import { supabaseAdmin } from '@/lib/supabaseClient'

const BOT_USERS = [
  {
    email: 'mina_seoul@meetpin.bot',
    nickname: '미나💕',
    age_range: '20s_late',
    intro: '강남에서 일하는 직장인이에요! 맛있는 술집이나 카페 찾아다니는 걸 좋아합니다 ✨',
    avatar_seed: 'mina',
  },
  {
    email: 'jihoon_sports@meetpin.bot',
    nickname: '지훈💪',
    age_range: '30s_early',
    intro: '헬스 5년차! 운동 좋아하시는 분들과 함께 하고 싶어요. 러닝, 클라이밍도 좋아합니다!',
    avatar_seed: 'jihoon',
  },
  {
    email: 'soyoung_cafe@meetpin.bot',
    nickname: '소영☕',
    age_range: '20s_early',
    intro: '홍대 근처에서 디자인 일 해요~ 감성 카페나 전시회 같이 가실 분 구해요!',
    avatar_seed: 'soyoung',
  },
  {
    email: 'taehyun_drinks@meetpin.bot',
    nickname: '태현🍻',
    age_range: '30s_late',
    intro: '이태원에서 바텐더로 일하고 있어요. 좋은 칵테일바나 와인바 추천해드릴게요!',
    avatar_seed: 'taehyun',
  },
  {
    email: 'yuri_art@meetpin.bot',
    nickname: '유리🎨',
    age_range: '20s_late',
    intro: '예술 대학원생이에요. 갤러리 투어나 문화생활 함께 하실 분들 환영합니다!',
    avatar_seed: 'yuri',
  },
  {
    email: 'mingyu_tech@meetpin.bot',
    nickname: '민규💻',
    age_range: '30s_early',
    intro: '개발자입니다! 강남에서 근무하고 있어요. 맛집이나 술집 탐방 좋아해요 🍺',
    avatar_seed: 'mingyu',
  },
]

const SAMPLE_ROOMS = [
  {
    title: '🍻 강남 맛집 호핑 같이 해요!',
    category: 'drink',
    description: '강남역 근처 유명 맛집들 돌아다니면서 술도 한잔~ 분위기 좋은 곳들로 갑시다!',
    lat: 37.4981,
    lng: 127.0276,
    place_text: '강남역 2번 출구',
    max_people: 4,
    fee: 50000,
    bot_nickname: '미나💕',
  },
  {
    title: '💪 한강 러닝 모임 (초보 환영)',
    category: 'exercise',
    description: '반포 한강공원에서 가볍게 러닝해요! 초보자도 환영하고 페이스 맞춰서 뛸게요 ✨',
    lat: 37.5115,
    lng: 126.9882,
    place_text: '반포 한강공원 달빛광장',
    max_people: 6,
    fee: 0,
    bot_nickname: '지훈💪',
  },
  {
    title: '☕ 홍대 감성카페 투어',
    category: 'other',
    description: '홍대에 숨겨진 감성 카페들 탐방해요! 인스타 감성 사진도 찍고 수다도 떨어요 📸',
    lat: 37.5563,
    lng: 126.9236,
    place_text: '홍익대학교 정문',
    max_people: 3,
    fee: 20000,
    bot_nickname: '소영☕',
  },
  {
    title: '🍸 이태원 루프탑바 투어',
    category: 'drink',
    description: '이태원 최고의 루프탑바들 돌아다니면서 야경 감상하며 칵테일 한잔! 분위기 좋아요~',
    lat: 37.5347,
    lng: 126.9947,
    place_text: '이태원역 1번 출구',
    max_people: 4,
    fee: 80000,
    bot_nickname: '태현🍻',
  },
  {
    title: '🎨 성수동 갤러리 투어',
    category: 'other',
    description: '성수동 핫한 갤러리들 구경하고 분위기 좋은 카페에서 예술 이야기 나눠요!',
    lat: 37.5439,
    lng: 127.056,
    place_text: '성수역 4번 출구',
    max_people: 5,
    fee: 15000,
    bot_nickname: '유리🎨',
  },
  {
    title: '🍺 강남 직장인 번개 모임',
    category: 'drink',
    description: '퇴근 후 가볍게 맥주 한잔하면서 네트워킹해요! 직장인들 환영합니다 🍻',
    lat: 37.5012,
    lng: 127.0396,
    place_text: '선릉역 5번 출구',
    max_people: 6,
    fee: 40000,
    bot_nickname: '민규💻',
  },
]

async function seedData() {
  try {
    console.log('🌱 시드 데이터 생성 시작...')

    // 1. 봇 사용자 생성
    const botUsers = []
    for (const botData of BOT_USERS) {
      try {
        // 이미 존재하는지 확인 - skip check for now, just create
        // const { data: existingUser } = await supabaseAdmin.auth.admin.getUserById(botData.email)
        // if (existingUser.user) {
        //   console.log(`🤖 봇 사용자 이미 존재: ${botData.nickname}`)
        //   botUsers.push(existingUser.user)
        //   continue
        // }

        // 새 봇 사용자 생성
        const { data: newUser, error: userError } = await supabaseAdmin.auth.admin.createUser({
          email: botData.email,
          password: process.env.BOT_DEFAULT_PASSWORD || 'meetpin-bot-2024!',
          email_confirm: true,
          user_metadata: {
            nickname: botData.nickname,
            age_range: botData.age_range,
            is_bot: true,
          },
        })

        if (userError) {
          console.error(`❌ 봇 사용자 생성 실패: ${botData.nickname}`, userError)
          continue
        }

        // 프로필 생성
        const { error: profileError } = await supabaseAdmin.from('profiles').insert({
          uid: newUser.user.id,
          nickname: botData.nickname,
          age_range: botData.age_range,
          intro: botData.intro,
          avatar_url: `https://api.dicebear.com/7.x/avataaars/svg?seed=${botData.avatar_seed}`,
          role: 'user',
        } as any)

        if (profileError) {
          console.error(`❌ 프로필 생성 실패: ${botData.nickname}`, profileError)
          continue
        }

        botUsers.push(newUser.user)
        console.log(`✅ 봇 사용자 생성 완료: ${botData.nickname}`)
      } catch (error) {
        console.error(`❌ 봇 사용자 생성 중 오류: ${botData.nickname}`, error)
      }
    }

    // 2. 샘플 방 생성
    let roomsCreated = 0
    for (const roomData of SAMPLE_ROOMS) {
      try {
        // 봇 사용자 찾기
        const botUser = botUsers.find(
          user => user.user_metadata?.nickname === roomData.bot_nickname
        )

        if (!botUser) {
          console.error(`❌ 봇 사용자를 찾을 수 없음: ${roomData.bot_nickname}`)
          continue
        }

        // 이미 존재하는 방인지 확인
        const { data: existingRoom } = await supabaseAdmin
          .from('rooms')
          .select('id')
          .eq('host_uid', botUser.id)
          .eq('title', roomData.title)
          .single()

        if (existingRoom) {
          console.log(`🏠 방 이미 존재: ${roomData.title}`)
          continue
        }

        // 시작 시간을 현재로부터 1-7일 후로 설정
        const startDate = new Date()
        startDate.setDate(startDate.getDate() + Math.floor(Math.random() * 7) + 1)
        startDate.setHours(18 + Math.floor(Math.random() * 4), 0, 0, 0) // 18-21시

        const { error: roomError } = await supabaseAdmin.from('rooms').insert({
          host_uid: botUser.id,
          title: roomData.title,
          description: roomData.description,
          category: roomData.category,
          lat: roomData.lat,
          lng: roomData.lng,
          place_text: roomData.place_text,
          start_at: startDate.toISOString(),
          max_people: roomData.max_people,
          fee: roomData.fee,
          visibility: 'public',
        } as any)

        if (roomError) {
          console.error(`❌ 방 생성 실패: ${roomData.title}`, roomError)
          continue
        }

        roomsCreated++
        console.log(`✅ 방 생성 완료: ${roomData.title}`)
      } catch (error) {
        console.error(`❌ 방 생성 중 오류: ${roomData.title}`, error)
      }
    }

    return {
      success: true,
      message: `🎉 시드 데이터 생성 완료! 봇 사용자: ${botUsers.length}명, 방: ${roomsCreated}개 생성됨`,
    }
  } catch (error) {
    console.error('❌ 시드 데이터 생성 실패:', error)
    return {
      success: false,
      message: `시드 데이터 생성 실패: ${error}`,
    }
  }
}

async function handleSeed() {
  await requireAdmin()
  const result = await seedData()

  if (result.success) {
    return apiUtils.success(result)
  } else {
    return apiUtils.error(result.message, 500)
  }
}

export const { POST } = createMethodRouter({
  POST: handleSeed,
})
