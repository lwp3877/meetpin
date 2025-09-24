import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { Metadata } from 'next'
import LegalFooter from '@/components/layout/LegalFooter'

const DOCUMENT_INFO = {
  title: '위치정보 이용약관',
  description: 'MeetPin의 위치기반서비스 이용에 관한 약관'
}

export const metadata: Metadata = {
  title: `${DOCUMENT_INFO.title} | MeetPin`,
  description: DOCUMENT_INFO.description,
  robots: 'index, follow'
}

// Force static generation at build time
export const dynamic = 'force-static'
export const dynamicParams = false

async function getLegalDocument(): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), 'docs', 'legal', 'ko', 'location-terms.md')
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error('Failed to read location-terms document:', error)
    return null
  }
}

// 간단한 마크다운 파서 (제목, 단락, 리스트만 지원)
function parseMarkdown(content: string): string {
  return content
    // 제목 처리 (H1-H6)
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4 text-gray-900">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-6 text-gray-900">$1</h1>')
    // 볼드 텍스트
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
    // 기울임체
    .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
    // 링크
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>')
    // 순서없는 리스트
    .replace(/^[\d]+\.\s+(.*)$/gim, '<li class="mb-2">$1</li>')
    .replace(/^-\s+(.*)$/gim, '<li class="mb-2">$1</li>')
    // 단락 처리
    .split('\n\n')
    .map(paragraph => {
      paragraph = paragraph.trim()
      if (!paragraph) return ''
      
      // 이미 HTML 태그가 있으면 그대로 반환
      if (paragraph.startsWith('<')) return paragraph
      
      // 리스트 항목들을 감싸기
      if (paragraph.includes('<li')) {
        return `<ul class="list-disc list-inside space-y-1 mb-4">${paragraph}</ul>`
      }
      
      // 일반 단락
      return `<p class="mb-4 text-gray-700 leading-relaxed">${paragraph}</p>`
    })
    .join('\n')
}

export default async function LocationTermsPage() {
  const content = await getLegalDocument()
  
  if (!content) {
    notFound()
  }
  
  const htmlContent = parseMarkdown(content)
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* 헤더 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {DOCUMENT_INFO.title}
          </h1>
          <p className="text-gray-600">
            {DOCUMENT_INFO.description}
          </p>
          <div className="mt-4 text-sm text-gray-500">
            최종 업데이트: 2024년 1월 1일
          </div>
        </div>
        
        {/* 법무 문서 내용 */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8">
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>
        
        {/* 푸터 액션 */}
        <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">
                ⚖️ 법률 검토 필요
              </h3>
              <p className="mt-1 text-sm text-yellow-700">
                이 문서는 샘플 임시 버전입니다. 실제 서비스 운영 전 반드시 전문 법무팀의 검토를 받아야 합니다.
              </p>
            </div>
          </div>
        </div>

        {/* Legal Footer for cross-navigation */}
        <LegalFooter variant="minimal" className="mt-12" />
      </div>
    </div>
  )
}