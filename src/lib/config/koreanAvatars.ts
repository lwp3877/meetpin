// 한국인 프로필 이미지 URL 모음 (Dicebear 아바타 사용)
export const koreanAvatars = {
  // 한국인 남성 프로필들
  male: [
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m1&backgroundColor=b6e3f4,c0aede,d1d4f9', // 젊은 한국 남성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m2&backgroundColor=ffd5dc,ffdfba,c7ceea', // 한국 남성 프로필
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m3&backgroundColor=b6e3f4,c0aede,d1d4f9', // 미소짓는 남성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m4&backgroundColor=ffd5dc,ffdfba,c7ceea', // 안경 쓴 남성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m5&backgroundColor=b6e3f4,c0aede,d1d4f9', // 캐주얼한 남성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m6&backgroundColor=ffd5dc,ffdfba,c7ceea', // 정장 남성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=m7&backgroundColor=b6e3f4,c0aede,d1d4f9', // 웃는 남성
  ],

  // 한국인 여성 프로필들
  female: [
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f1&backgroundColor=ffd5dc,ffdfba,c7ceea', // 한국 여성 프로필
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f2&backgroundColor=b6e3f4,c0aede,d1d4f9', // 긴 머리 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f3&backgroundColor=ffd5dc,ffdfba,c7ceea', // 미소짓는 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f4&backgroundColor=b6e3f4,c0aede,d1d4f9', // 단발 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f5&backgroundColor=ffd5dc,ffdfba,c7ceea', // 자연스러운 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f6&backgroundColor=b6e3f4,c0aede,d1d4f9', // 프로페셔널 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f7&backgroundColor=ffd5dc,ffdfba,c7ceea', // 웃는 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f8&backgroundColor=b6e3f4,c0aede,d1d4f9', // 캐주얼한 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f9&backgroundColor=ffd5dc,ffdfba,c7ceea', // 친근한 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f10&backgroundColor=b6e3f4,c0aede,d1d4f9', // 세련된 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f11&backgroundColor=ffd5dc,ffdfba,c7ceea', // 활발한 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f12&backgroundColor=b6e3f4,c0aede,d1d4f9', // 밝은 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f13&backgroundColor=ffd5dc,ffdfba,c7ceea', // 지적인 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f14&backgroundColor=b6e3f4,c0aede,d1d4f9', // 우아한 여성
    'https://api.dicebear.com/8.x/adventurer/svg?seed=f15&backgroundColor=ffd5dc,ffdfba,c7ceea', // 모던한 여성
  ],
}

// 랜덤하게 한국인 프로필 이미지 선택
export const getRandomKoreanAvatar = (gender?: 'male' | 'female') => {
  if (gender === 'male') {
    return koreanAvatars.male[Math.floor(Math.random() * koreanAvatars.male.length)]
  }
  if (gender === 'female') {
    return koreanAvatars.female[Math.floor(Math.random() * koreanAvatars.female.length)]
  }

  // 성별 미지정시 모든 프로필에서 랜덤 선택
  const allAvatars = [...koreanAvatars.male, ...koreanAvatars.female]
  return allAvatars[Math.floor(Math.random() * allAvatars.length)]
}
