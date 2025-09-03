// 한국인 프로필 이미지 URL 모음
export const koreanAvatars = {
  // 한국인 남성 프로필들
  male: [
    'https://images.unsplash.com/photo-1568822617270-2c1579f8dfe2?w=150&h=150&fit=crop&crop=face', // 젊은 한국 남성
    'https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=150&h=150&fit=crop&crop=face', // 한국 남성 프로필
    'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face', // 미소짓는 남성
    'https://images.unsplash.com/photo-1600486913747-55e5470d6f40?w=150&h=150&fit=crop&crop=face', // 안경 쓴 남성
    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&h=150&fit=crop&crop=face', // 캐주얼한 남성
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face', // 정장 남성
    'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face', // 웃는 남성
  ],
  
  // 한국인 여성 프로필들
  female: [
    'https://images.unsplash.com/photo-1601233749202-95d04d5b3c00?w=150&h=150&fit=crop&crop=face', // 한국 여성 프로필
    'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=150&h=150&fit=crop&crop=face', // 긴 머리 여성
    'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face', // 미소짓는 여성
    'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face', // 단발 여성
    'https://images.unsplash.com/photo-1494790108755-2616b9ee3cde?w=150&h=150&fit=crop&crop=face', // 자연스러운 여성
    'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face', // 프로페셔널 여성
  ]
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