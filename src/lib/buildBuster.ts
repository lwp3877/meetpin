// Build cache buster - 빌드 캐시 강제 초기화
// 이 파일은 빌드 해시를 변경하기 위한 임시 파일입니다
export const BUILD_VERSION = '1.0.1-emergency-fix'
export const BUILD_TIMESTAMP = Date.now()
export const CACHE_BUSTER = Math.random().toString(36)

console.log('🚀 새로운 빌드 버전:', BUILD_VERSION, CACHE_BUSTER)