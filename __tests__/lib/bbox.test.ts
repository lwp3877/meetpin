/* 파일경로: __tests__/lib/bbox.test.ts */
import { parseBBoxParam, calculateDistance, isValidBBox, KOREA_BBOX, SEOUL_BBOX } from '@/lib/utils/bbox'

describe('BBox utilities', () => {
  describe('parseBBoxParam', () => {
    it('should parse valid bbox string', () => {
      const result = parseBBoxParam('33.0,124.0,43.0,132.0')
      expect(result).toEqual({
        south: 33.0,
        west: 124.0,
        north: 43.0,
        east: 132.0
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

  describe('calculateDistance', () => {
    it('should calculate distance between Seoul and Busan', () => {
      const seoul = { lat: 37.5665, lng: 126.9780 }
      const busan = { lat: 35.1796, lng: 129.0756 }
      
      const distance = calculateDistance(seoul, busan)
      
      // Seoul to Busan is approximately 325km
      expect(distance).toBeGreaterThan(320)
      expect(distance).toBeLessThan(330)
    })

    it('should return 0 for same coordinates', () => {
      const point = { lat: 37.5665, lng: 126.9780 }
      const distance = calculateDistance(point, point)
      expect(distance).toBe(0)
    })

    it('should calculate short distances accurately', () => {
      const gangnam = { lat: 37.4979, lng: 127.0276 }
      const hongdae = { lat: 37.5563, lng: 126.9229 }
      
      const distance = calculateDistance(gangnam, hongdae)
      
      // Gangnam to Hongdae is approximately 15km
      expect(distance).toBeGreaterThan(10)
      expect(distance).toBeLessThan(20)
    })
  })

  describe('isValidBBox', () => {
    it('should validate correct bbox', () => {
      const validBBox = { south: 33.0, west: 124.0, north: 43.0, east: 132.0 }
      expect(isValidBBox(validBBox)).toBe(true)
    })

    it('should reject bbox with south > north', () => {
      const invalidBBox = { south: 43.0, west: 124.0, north: 33.0, east: 132.0 }
      expect(isValidBBox(invalidBBox)).toBe(false)
    })

    it('should reject bbox with west > east', () => {
      const invalidBBox = { south: 33.0, west: 132.0, north: 43.0, east: 124.0 }
      expect(isValidBBox(invalidBBox)).toBe(false)
    })

    it('should reject bbox with invalid coordinates', () => {
      const invalidBBox = { south: -91, west: 124.0, north: 43.0, east: 132.0 }
      expect(isValidBBox(invalidBBox)).toBe(false)
    })
  })

  describe('Predefined bboxes', () => {
    it('should have valid Korea bbox', () => {
      expect(isValidBBox(KOREA_BBOX)).toBe(true)
      expect(KOREA_BBOX.south).toBeGreaterThanOrEqual(33)
      expect(KOREA_BBOX.north).toBeLessThanOrEqual(39)
      expect(KOREA_BBOX.west).toBeGreaterThanOrEqual(124)
      expect(KOREA_BBOX.east).toBeLessThanOrEqual(132)
    })

    it('should have valid Seoul bbox', () => {
      expect(isValidBBox(SEOUL_BBOX)).toBe(true)
      expect(SEOUL_BBOX.south).toBeGreaterThanOrEqual(37.4)
      expect(SEOUL_BBOX.north).toBeLessThanOrEqual(37.7)
      expect(SEOUL_BBOX.west).toBeGreaterThanOrEqual(126.7)
      expect(SEOUL_BBOX.east).toBeLessThanOrEqual(127.3)
    })

    it('should have Seoul bbox within Korea bbox', () => {
      expect(SEOUL_BBOX.south).toBeGreaterThanOrEqual(KOREA_BBOX.south)
      expect(SEOUL_BBOX.north).toBeLessThanOrEqual(KOREA_BBOX.north)
      expect(SEOUL_BBOX.west).toBeGreaterThanOrEqual(KOREA_BBOX.west)
      expect(SEOUL_BBOX.east).toBeLessThanOrEqual(KOREA_BBOX.east)
    })
  })
})