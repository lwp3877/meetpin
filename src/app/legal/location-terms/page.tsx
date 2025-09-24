export const dynamic = 'force-static'

export default function LocationTermsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            위치정보 이용약관
          </h1>
          <p className="text-gray-600">
            MeetPin의 위치기반서비스 이용에 관한 약관
          </p>
          <div className="mt-4 text-sm text-gray-500">
            최종 업데이트: 2024년 1월 1일
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div className="prose prose-gray max-w-none">
            <h2>1. 목적 및 근거</h2>
            <p>본 약관은 위치정보의 보호 및 이용 등에 관한 법률에 따라 MeetPin이 제공하는 위치기반서비스에 대한 권리, 의무 및 책임사항을 정합니다.</p>
            
            <h2>2. 용어의 정의</h2>
            <ul>
              <li><strong>위치정보:</strong> 특정한 시간에 존재하는 장소에 관한 정보</li>
              <li><strong>위치기반서비스:</strong> 위치정보를 수집, 이용하는 서비스</li>
              <li><strong>개인위치정보:</strong> 특정 개인의 위치정보</li>
            </ul>
            
            <h2>3. 개인위치정보의 수집·이용·제공</h2>
            <p>GPS 기반의 정확한 위치정보와 네트워크 기반의 대략적인 위치정보를 수집하여 모임 장소 설정 및 추천, 근거리 사용자 매칭 서비스에 이용합니다.</p>
            
            <h2>4. 위치정보 관리책임자</h2>
            <p>연락처: privacy@meetpin.com</p>
          </div>
        </div>
      </div>
    </div>
  )
}