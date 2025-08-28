import { brandMessages, categoryBadges } from '@/lib/brand'
import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-accent/10">
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 text-center">
        <div className="space-y-6">
          {/* Logo & Title */}
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
              <span className="text-2xl">📍</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              {brandMessages.appName}
            </h1>
            <p className="text-xl md:text-2xl text-text-muted font-medium">
              {brandMessages.tagline}
            </p>
          </div>

          {/* Description */}
          <p className="text-lg text-text-muted max-w-2xl mx-auto leading-relaxed">
            지도에서 방을 만들어 근처 사람들과 만나고, 새로운 인연을 만들어보세요.
            <br />
            술, 운동, 취미 활동까지 다양한 모임을 즐길 수 있습니다.
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mt-8">
            <Link 
              href="/auth/signup"
              className="bg-primary hover:bg-primary-deep text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 shadow-lg"
            >
              지금 시작하기
            </Link>
            <Link 
              href="/auth/login"
              className="border border-primary text-primary hover:bg-primary hover:text-white px-8 py-3 rounded-lg font-semibold text-lg transition-all"
            >
              로그인
            </Link>
          </div>
          
          {/* Secondary Navigation */}
          <div className="flex flex-col sm:flex-row gap-2 justify-center items-center mt-4 text-sm">
            <Link 
              href="/map"
              className="text-gray-600 hover:text-primary underline"
            >
              방 둘러보기
            </Link>
            <span className="hidden sm:inline text-gray-400">|</span>
            <Link 
              href="/rooms"
              className="text-gray-600 hover:text-primary underline"
            >
              모든 모임 보기
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Categories */}
          {Object.entries(categoryBadges).map(([key, category]) => (
            <div key={key} className="bg-white rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-center space-y-4">
                <div 
                  className="w-16 h-16 rounded-full mx-auto flex items-center justify-center text-2xl"
                  style={{ backgroundColor: `${category.color}20` }}
                >
                  {category.emoji}
                </div>
                <h3 className="text-xl font-bold" style={{ color: category.color }}>
                  {category.label} 모임
                </h3>
                <p className="text-text-muted">
                  {key === 'drink' && '맛있는 술과 음식을 함께 즐겨요'}
                  {key === 'exercise' && '건강한 운동을 함께 해요'}
                  {key === 'other' && '다양한 취미와 관심사를 공유해요'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How it Works */}
      <section className="bg-bg-soft py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            이렇게 만나보세요
          </h2>
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { step: '1', title: '위치 설정', desc: '지도에서 만날 장소를 찾아보세요' },
              { step: '2', title: '방 생성', desc: '모임을 만들고 사람들을 초대하세요' },
              { step: '3', title: '참가 신청', desc: '관심있는 방에 참가 신청을 보내세요' },
              { step: '4', title: '만남 성사', desc: '수락되면 1:1 채팅으로 만나세요' },
            ].map((item) => (
              <div key={item.step} className="text-center space-y-4">
                <div className="w-12 h-12 bg-primary text-white rounded-full mx-auto flex items-center justify-center font-bold text-xl">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold">{item.title}</h3>
                <p className="text-text-muted text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8">
        <div className="container mx-auto px-4 text-center">
          <div className="space-y-4">
            <div className="flex justify-center space-x-6">
              <Link href="/legal/terms" className="text-text-muted hover:text-primary">
                이용약관
              </Link>
              <Link href="/legal/privacy" className="text-text-muted hover:text-primary">
                개인정보처리방침
              </Link>
              <Link href="/legal/location" className="text-text-muted hover:text-primary">
                위치정보이용약관
              </Link>
            </div>
            <p className="text-text-muted text-sm">
              © 2024 {brandMessages.appName}. Made with ❤️ by MeetPin Team
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
