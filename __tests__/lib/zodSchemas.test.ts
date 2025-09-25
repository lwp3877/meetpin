/* 파일경로: __tests__/lib/zodSchemas.test.ts */
import {
  createRoomSchema,
  createRequestSchema,
  createMessageSchema,
  createReportSchema,
  profileSchema,
} from '@/lib/utils/zodSchemas'

describe('Zod Schemas', () => {
  describe('createRoomSchema', () => {
    const validRoomData = {
      title: '강남에서 치킨 먹을 사람',
      category: 'drink' as const,
      place_text: '강남역 근처 치킨집',
      lat: 37.5665,
      lng: 126.978,
      start_at: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2시간 후
      max_people: 4,
      fee: 0,
      visibility: 'public' as const,
    }

    it('should validate correct room data', () => {
      const result = createRoomSchema.safeParse(validRoomData)
      expect(result.success).toBe(true)
    })

    it('should reject empty title', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        title: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too long title', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        title: 'a'.repeat(101),
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid category', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        category: 'invalid',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid coordinates', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        lat: 91,
      })
      expect(result.success).toBe(false)
    })

    it('should reject too many people', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        max_people: 21,
      })
      expect(result.success).toBe(false)
      expect(result.error?.issues[0].message).toContain('20명')
    })

    it('should reject too high fee', () => {
      const result = createRoomSchema.safeParse({
        ...validRoomData,
        fee: 1000001,
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createRequestSchema', () => {
    it('should validate correct request data', () => {
      const validData = {
        room_id: '123e4567-e89b-12d3-a456-426614174000',
        message: '안녕하세요! 함께하고 싶어요',
      }

      const result = createRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should make message optional', () => {
      const validData = {
        room_id: '123e4567-e89b-12d3-a456-426614174000',
      }

      const result = createRequestSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject too long message', () => {
      const result = createRequestSchema.safeParse({
        room_id: '123e4567-e89b-12d3-a456-426614174000',
        message: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createMessageSchema', () => {
    it('should validate correct message data', () => {
      const validData = {
        text: '안녕하세요!',
      }

      const result = createMessageSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject empty text', () => {
      const result = createMessageSchema.safeParse({
        text: '',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too long text', () => {
      const result = createMessageSchema.safeParse({
        text: 'a'.repeat(1001),
      })
      expect(result.success).toBe(false)
    })
  })

  describe('createReportSchema', () => {
    const validReportData = {
      target_uid: '123e4567-e89b-12d3-a456-426614174000',
      reason: '부적절한 행동을 했습니다',
    }

    it('should validate correct report data', () => {
      const result = createReportSchema.safeParse(validReportData)
      expect(result.success).toBe(true)
    })

    it('should make room_id optional', () => {
      const result = createReportSchema.safeParse({
        ...validReportData,
        room_id: '123e4567-e89b-12d3-a456-426614174001',
      })
      expect(result.success).toBe(true)
    })

    it('should reject empty reason', () => {
      const result = createReportSchema.safeParse({
        ...validReportData,
        reason: '',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid report data', () => {
      const result = createReportSchema.safeParse(validReportData)
      expect(result.success).toBe(true)
    })
  })

  describe('profileSchema', () => {
    it('should validate correct profile data', () => {
      const validData = {
        nickname: '테스트유저',
        age_range: '20s_early' as const,
        intro: '안녕하세요! 새로운 친구들과 만나고 싶어요',
      }

      const result = profileSchema.safeParse(validData)
      expect(result.success).toBe(true)
    })

    it('should reject too short nickname', () => {
      const result = profileSchema.safeParse({
        nickname: 'a',
        age_range: '20s_early',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too long nickname', () => {
      const result = profileSchema.safeParse({
        nickname: 'a'.repeat(21),
        age_range: '20s_early',
      })
      expect(result.success).toBe(false)
    })

    it('should accept valid nickname patterns', () => {
      const result = profileSchema.safeParse({
        nickname: '테스트유저123',
        age_range: '20s_early',
      })
      expect(result.success).toBe(true)
    })

    it('should make bio optional', () => {
      const result = profileSchema.safeParse({
        nickname: '테스트유저',
        age_range: '20s_early',
      })
      expect(result.success).toBe(true)
    })

    it('should reject too long bio', () => {
      const result = profileSchema.safeParse({
        nickname: '테스트유저',
        age_range: '20s_early',
        intro: 'a'.repeat(501),
      })
      expect(result.success).toBe(false)
    })
  })
})
