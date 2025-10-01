/**
 * 안전한 텍스트 처리 유틸리티
 */

/**
 * 안전한 첫 글자 추출 (유니코드 대응)
 * @param s 문자열
 * @returns 첫 글자 또는 기본값 "?"
 */
export const firstGrapheme = (s?: string) => {
  if (!s) return "?"
  // 유니코드 안전: 스프레드로 첫 문자 단위
  const ch = [...s.trim()][0]
  return ch || "?"
}

/**
 * 안전한 첫 글자 추출 (대문자 변환)
 * @param s 문자열
 * @returns 첫 글자 대문자 또는 기본값 "?"
 */
export const firstGraphemeUpper = (s?: string) => {
  return firstGrapheme(s).toUpperCase()
}