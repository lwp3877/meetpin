import { notFound } from 'next/navigation'
import { readFile } from 'fs/promises'
import { join } from 'path'
import { Metadata } from 'next'
import LegalFooter from '@/components/layout/LegalFooter'

// 지원되는 법무 문서 슬러그
const LEGAL_DOCUMENTS = {
  privacy: {
    title: '개인정보처리방침',
    description: 'MeetPin의 개인정보 수집, 이용, 보관 및 보호에 관한 정책',
  },
  terms: {
    title: '서비스 이용약관',
    description: 'MeetPin 서비스 이용에 관한 약관 및 규정',
  },
  'location-terms': {
    title: '위치정보 이용약관',
    description: 'MeetPin의 위치기반서비스 이용에 관한 약관',
  },
  'cookie-policy': {
    title: '쿠키 및 트래킹 정책',
    description: 'MeetPin의 쿠키 사용 및 개인정보보호 정책',
  },
} as const

type LegalSlug = keyof typeof LEGAL_DOCUMENTS

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const resolvedParams = await params
  const slug = resolvedParams.slug as LegalSlug
  const doc = LEGAL_DOCUMENTS[slug]

  if (!doc) {
    return {
      title: '페이지를 찾을 수 없습니다',
      description: '요청하신 법무 문서를 찾을 수 없습니다.',
    }
  }

  return {
    title: `${doc.title} | MeetPin`,
    description: doc.description,
    robots: 'index, follow',
  }
}

export async function generateStaticParams() {
  // Force static generation of all legal document pages
  return [
    { slug: 'privacy' },
    { slug: 'terms' },
    { slug: 'location-terms' },
    { slug: 'cookie-policy' },
  ]
}

// Allow dynamic params beyond static ones
export const dynamicParams = true

// Force static generation at build time
export const dynamic = 'force-static'

async function getLegalDocument(slug: string): Promise<string | null> {
  try {
    const filePath = join(process.cwd(), 'docs', 'legal', 'ko', `${slug}.md`)
    const content = await readFile(filePath, 'utf-8')
    return content
  } catch (error) {
    console.error(`Failed to read legal document: ${slug}`, error)
    return null
  }
}

// 간단한 마크다운 파서 (제목, 단락, 리스트만 지원)
function parseMarkdown(content: string): string {
  return (
    content
      // 제목 처리 (H1-H6)
      .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mt-6 mb-3 text-gray-900">$1</h3>')
      .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mt-8 mb-4 text-gray-900">$1</h2>')
      .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mt-10 mb-6 text-gray-900">$1</h1>')
      // 볼드 텍스트
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // 기울임체
      .replace(/\*(.*?)\*/g, '<em class="italic">$1</em>')
      // 링크
      .replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline" target="_blank" rel="noopener noreferrer">$1</a>'
      )
      // 테이블 처리 (간단한 형태)
      .replace(/\|(.+)\|/g, (match, content) => {
        const cells = content
          .split('|')
          .map((cell: string) => cell.trim())
          .filter((cell: string) => cell.length > 0)
        if (cells.some((cell: string) => cell.includes('---'))) {
          return '' // 테이블 구분선 제거
        }
        const cellsHtml = cells
          .map((cell: string) => `<td class="px-4 py-2 border border-gray-200">${cell}</td>`)
          .join('')
        return `<tr>${cellsHtml}</tr>`
      })
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

        // 테이블 행들을 감싸기
        if (paragraph.includes('<tr>')) {
          return `<table class="w-full border-collapse border border-gray-200 mb-4">${paragraph}</table>`
        }

        // 일반 단락
        return `<p class="mb-4 text-gray-700 leading-relaxed">${paragraph}</p>`
      })
      .join('\n')
  )
}

export default async function LegalDocumentPage({ params }: Props) {
  const resolvedParams = await params
  const slug = resolvedParams.slug as LegalSlug

  // 지원되는 문서인지 확인
  if (!LEGAL_DOCUMENTS[slug]) {
    notFound()
  }

  const content = await getLegalDocument(slug)

  if (!content) {
    notFound()
  }

  const doc = LEGAL_DOCUMENTS[slug]
  const htmlContent = parseMarkdown(content)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-4xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h1 className="mb-2 text-3xl font-bold text-gray-900">{doc.title}</h1>
          <p className="text-gray-600">{doc.description}</p>
          <div className="mt-4 text-sm text-gray-500">최종 업데이트: 2024년 1월 1일</div>
        </div>

        {/* 법무 문서 내용 */}
        <div className="rounded-lg border border-gray-200 bg-white p-8 shadow-sm">
          <div
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: htmlContent }}
          />
        </div>

        {/* 푸터 액션 */}
        <div className="mt-8 rounded-lg border border-yellow-200 bg-yellow-50 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                <path
                  fillRule="evenodd"
                  d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-yellow-800">⚖️ 법률 검토 필요</h3>
              <p className="mt-1 text-sm text-yellow-700">
                이 문서는 샘플 임시 버전입니다. 실제 서비스 운영 전 반드시 전문 법무팀의 검토를
                받아야 합니다.
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
