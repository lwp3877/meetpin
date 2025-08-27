/* 파일경로: src/app/admin/page.tsx */
import { brandMessages } from '@/lib/brand'

export default function AdminPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white border-b px-4 py-3">
        <div className="container mx-auto">
          <h1 className="text-xl font-bold text-primary">
            ⚙️ 관리자 페이지
          </h1>
        </div>
      </header>

      {/* Access Control Notice */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto text-center">
          <div className="w-16 h-16 bg-yellow-100 rounded-full mx-auto mb-4 flex items-center justify-center">
            <span className="text-2xl">🔐</span>
          </div>
          
          <h2 className="text-xl font-bold text-text mb-4">
            권한이 필요합니다
          </h2>
          
          <p className="text-text-muted mb-6">
            관리자 페이지는 admin 권한을 가진 사용자만 접근할 수 있습니다.
          </p>

          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-red-800">
              🚧 <strong>권한 보호:</strong> requireAdmin() 미들웨어와 RLS 정책이 적용될 예정입니다.
            </p>
          </div>

          <div className="text-left space-y-3 text-sm text-text-muted">
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <div>
                <strong>신고 관리:</strong> 사용자/방 신고 처리
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <div>
                <strong>사용자 관리:</strong> 계정 상태, 제재 관리
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <div>
                <strong>통계 대시보드:</strong> 사용자/방/매칭 현황
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <span className="text-primary">•</span>
              <div>
                <strong>결제 관리:</strong> Stripe 거래 내역
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}