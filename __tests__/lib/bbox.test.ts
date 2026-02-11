/* 파일경로: __tests__/lib/bbox.test.ts */
import {
  parseBBoxParam,
} from '@/lib/utils/bbox'

describe('BBox utilities', () => {
  describe('parseBBoxParam', () => {
    it('should parse valid bbox string', () => {
      const result = parseBBoxParam('33.0,124.0,43.0,132.0')
      expect(result).toEqual({
        south: 33.0,
        west: 124.0,
        north: 43.0,
        east: 132.0,
      })
    })

    it('should return null for invalid bbox string', () => {
      expect(parseBBoxParam('invalid')).toBeNull()
      expect(parseBBoxParam('1,2,3')).toBeNull()
      expect(parseBBoxParam('1,2,3,4,5')).toBeNull()
      expect(parseBBoxParam('')).toBeNull()
      expect(parseBBoxParam(null)).toBeNull()
    })

    it('should return null for invalid coordinates', () => {
      // Invalid latitude (> 90)
      expect(parseBBoxParam('33.0,124.0,91.0,132.0')).toBeNull()
      // Invalid longitude (> 180)
      expect(parseBBoxParam('33.0,181.0,43.0,132.0')).toBeNull()
      // South > North
      expect(parseBBoxParam('43.0,124.0,33.0,132.0')).toBeNull()
      // West > East
      expect(parseBBoxParam('33.0,132.0,43.0,124.0')).toBeNull()
    })
  })
})
