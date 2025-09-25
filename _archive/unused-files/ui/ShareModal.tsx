'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'react-hot-toast'
import { QRCodeSVG } from 'qrcode.react'
import { trackEvent } from '@/lib/services/analytics'

interface ShareModalProps {
  isOpen: boolean
  onClose: () => void
  room: {
    id: string
    title: string
    category: string
    place_text: string
    start_at: string
    max_people: number
    current_people: number
  }
}

export function ShareModal({ isOpen, onClose, room }: ShareModalProps) {
  const [copied, setCopied] = useState(false)

  const shareUrl = `https://meetpin.com/room/${room.id}`
  const shareText = `🎪 ${room.title}\n📍 ${room.place_text}\n⏰ ${new Date(room.start_at).toLocaleString('ko-KR')}\n👥 ${room.current_people}/${room.max_people}명\n\n밋핀에서 함께해요!`

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl)
      setCopied(true)
      toast.success('링크가 복사되었습니다!')
      trackEvent('share', 'room', 'copy_link')
      setTimeout(() => setCopied(false), 2000)
    } catch (_error) {
      toast.error('복사에 실패했습니다')
    }
  }

  const shareToKakaoTalk = () => {
    if (typeof window !== 'undefined' && window.Kakao) {
      window.Kakao.Share.sendDefault({
        objectType: 'feed',
        content: {
          title: room.title,
          description: `📍 ${room.place_text} | ⏰ ${new Date(room.start_at).toLocaleString('ko-KR')} | 👥 ${room.current_people}/${room.max_people}명`,
          imageUrl: 'https://meetpin.com/images/og-default.jpg',
          link: {
            mobileWebUrl: shareUrl,
            webUrl: shareUrl,
          },
        },
        buttons: [
          {
            title: '참여하기',
            link: {
              mobileWebUrl: shareUrl,
              webUrl: shareUrl,
            },
          },
        ],
      })
      trackEvent('share', 'room', 'kakao_talk')
    } else {
      toast.error('카카오톡 공유를 사용할 수 없습니다')
    }
  }

  const shareToInstagram = () => {
    const instagramUrl = `https://www.instagram.com/stories/camera/?text=${encodeURIComponent(shareText + '\n' + shareUrl)}`
    window.open(instagramUrl, '_blank')
    trackEvent('share', 'room', 'instagram')
  }

  const shareToTwitter = () => {
    const twitterUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    window.open(twitterUrl, '_blank')
    trackEvent('share', 'room', 'twitter')
  }

  const downloadQR = () => {
    const svg = document.querySelector('#qr-code-svg') as SVGElement
    if (svg) {
      const svgData = new XMLSerializer().serializeToString(svg)
      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()

      img.onload = () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx?.drawImage(img, 0, 0)

        const link = document.createElement('a')
        link.download = `meetpin-room-${room.id}-qr.png`
        link.href = canvas.toDataURL()
        link.click()
      }

      img.src = 'data:image/svg+xml;base64,' + btoa(svgData)
    }
    trackEvent('share', 'room', 'qr_download')
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center">친구들을 초대해보세요! 🎉</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* 링크 복사 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">링크 공유</label>
            <div className="flex gap-2">
              <Input value={shareUrl} readOnly className="flex-1" />
              <Button onClick={copyToClipboard} className="px-6">
                {copied ? '복사됨!' : '복사'}
              </Button>
            </div>
          </div>

          {/* 소셜 공유 버튼들 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">소셜 미디어 공유</label>
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={shareToKakaoTalk}
                className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500"
              >
                📱 카카오톡
              </Button>
              <Button
                onClick={shareToInstagram}
                className="bg-gradient-to-r from-purple-500 to-pink-500 text-white hover:from-purple-600 hover:to-pink-600"
              >
                📸 인스타그램
              </Button>
              <Button onClick={shareToTwitter} className="bg-blue-500 text-white hover:bg-blue-600">
                🐦 트위터
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: room.title,
                      text: shareText,
                      url: shareUrl,
                    })
                    trackEvent('share', 'room', 'native_share')
                  } else {
                    toast.error('이 기기에서는 지원되지 않습니다')
                  }
                }}
                className="bg-gray-600 text-white hover:bg-gray-700"
              >
                📤 더보기
              </Button>
            </div>
          </div>

          {/* QR 코드 */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">QR 코드</label>
            <div className="flex flex-col items-center space-y-3">
              <div className="rounded-lg border bg-white p-4">
                <QRCodeSVG
                  id="qr-code-svg"
                  value={shareUrl}
                  size={120}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <Button onClick={downloadQR} variant="outline" size="sm">
                QR 코드 다운로드
              </Button>
            </div>
          </div>

          {/* 공유 인센티브 안내 */}
          <div className="rounded-lg border border-green-200 bg-green-50 p-4">
            <div className="flex items-start space-x-2">
              <span className="text-lg text-green-600">🎁</span>
              <div className="flex-1">
                <h4 className="font-medium text-green-800">공유 혜택</h4>
                <p className="text-sm text-green-700">
                  3명 이상 모이면 방이 상위 노출됩니다!
                  <br />첫 공유시 7일 무료 부스트 제공
                </p>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// 글로벌 카카오 SDK 타입 정의
declare global {
  interface Window {
    Kakao: {
      Share: {
        sendDefault: (options: any) => void
      }
    }
  }
}
