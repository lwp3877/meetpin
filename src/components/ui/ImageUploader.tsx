/* src/components/ui/ImageUploader.tsx */
'use client'

import { useState, useRef, useCallback } from 'react'
import Image from 'next/image'
import { Upload, X, Loader2, Camera, Image as ImageIcon } from 'lucide-react'
import {
  uploadImage,
  deleteImage,
  createImagePreview,
  handleImageDrop,
  type ImageUploadOptions,
  type ImageUploadResult,
} from '@/lib/services/imageUpload'
import { useAuth } from '@/lib/useAuth'
import toast from 'react-hot-toast'

interface ImageUploaderProps {
  currentImageUrl?: string
  onImageUploaded: (result: ImageUploadResult) => void
  onImageDeleted?: () => void
  folder: 'avatars' | 'rooms' | 'general'
  options?: ImageUploadOptions
  placeholder?: string
  className?: string
  size?: 'small' | 'medium' | 'large'
  shape?: 'square' | 'circle' | 'rectangle'
  showDeleteButton?: boolean
  dragAndDrop?: boolean
  multiple?: boolean
}

export function ImageUploader({
  currentImageUrl,
  onImageUploaded,
  onImageDeleted,
  folder,
  options = {},
  placeholder = '이미지를 업로드하세요',
  className = '',
  size = 'medium',
  shape = 'square',
  showDeleteButton = true,
  dragAndDrop = true,
  multiple = false,
}: ImageUploaderProps) {
  const { user } = useAuth()
  const [uploading, setUploading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // 크기별 스타일
  const sizeStyles = {
    small: 'w-20 h-20',
    medium: 'w-32 h-32',
    large: 'w-48 h-48',
  }

  // 모양별 스타일
  const shapeStyles = {
    square: 'rounded-xl',
    circle: 'rounded-full',
    rectangle: 'rounded-xl aspect-video',
  }

  const handleFileSelect = useCallback(
    async (files: FileList) => {
      if (!user) {
        toast.error('로그인이 필요합니다')
        return
      }

      if (files.length === 0) return

      const file = files[0] // 단일 파일만 처리
      if (!file.type.startsWith('image/')) {
        toast.error('이미지 파일만 업로드 가능합니다')
        return
      }

      try {
        setUploading(true)

        // 미리보기 생성
        const previewUrl = await createImagePreview(file)
        setPreview(previewUrl)

        // 이미지 업로드
        const result = await uploadImage(file, folder, user.id, {
          maxSizeMB: 5,
          maxWidth: folder === 'avatars' ? 400 : 1200,
          maxHeight: folder === 'avatars' ? 400 : 800,
          quality: 0.85,
          format: 'webp',
          ...options,
        })

        if (result.success) {
          toast.success('이미지가 성공적으로 업로드되었습니다!')
          onImageUploaded(result)
          setPreview(null) // 성공시 미리보기 제거
        } else {
          toast.error(result.error || '이미지 업로드에 실패했습니다')
          setPreview(null)
        }
      } catch (error: any) {
        console.error('Image upload error:', error)
        toast.error('이미지 업로드 중 오류가 발생했습니다')
        setPreview(null)
      } finally {
        setUploading(false)
      }
    },
    [user, folder, options, onImageUploaded]
  )

  const handleDelete = async () => {
    if (!currentImageUrl || deleting) return

    try {
      setDeleting(true)

      // Supabase Storage 파일 경로 추출
      const url = new URL(currentImageUrl)
      const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/images\/(.+)/)

      if (pathMatch) {
        const filePath = pathMatch[1]
        const success = await deleteImage(filePath)

        if (success) {
          toast.success('이미지가 삭제되었습니다')
          onImageDeleted?.()
        } else {
          toast.error('이미지 삭제에 실패했습니다')
        }
      } else {
        // 외부 URL인 경우 바로 삭제 콜백 호출
        onImageDeleted?.()
        toast.success('이미지가 제거되었습니다')
      }
    } catch (error) {
      console.error('Image delete error:', error)
      toast.error('이미지 삭제 중 오류가 발생했습니다')
    } finally {
      setDeleting(false)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    if (!dragAndDrop) return
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    if (!dragAndDrop) return
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    if (!dragAndDrop) return
    e.preventDefault()
    setDragOver(false)

    handleImageDrop(e.nativeEvent, handleFileSelect)
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  const currentImage = preview || currentImageUrl
  const isLoading = uploading || deleting

  return (
    <div className={`relative ${className}`}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={e => e.target.files && handleFileSelect(e.target.files)}
        className="hidden"
        multiple={multiple}
      />

      <div
        onClick={handleClick}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={` ${sizeStyles[size]} ${shapeStyles[shape]} hover:border-primary group cursor-pointer overflow-hidden border-2 border-dashed border-gray-300 transition-all duration-200 ${dragOver ? 'border-primary bg-primary/5 scale-105' : ''} ${isLoading ? 'cursor-wait' : 'hover:shadow-lg'} `}
      >
        {currentImage ? (
          <div className="relative h-full w-full">
            <Image
              src={currentImage}
              alt="업로드된 이미지"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
            />

            {/* 로딩 오버레이 */}
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                <Loader2 className="h-8 w-8 animate-spin text-white" />
              </div>
            )}

            {/* 호버 오버레이 */}
            {!isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/0 transition-all duration-200 group-hover:bg-black/30">
                <div className="opacity-0 transition-opacity group-hover:opacity-100">
                  <Camera className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="group-hover:text-primary flex h-full w-full flex-col items-center justify-center text-gray-400 transition-colors">
            {isLoading ? (
              <>
                <Loader2 className="mb-2 h-8 w-8 animate-spin" />
                <span className="text-sm">업로드 중...</span>
              </>
            ) : (
              <>
                {dragAndDrop ? (
                  <Upload className="mb-2 h-8 w-8" />
                ) : (
                  <ImageIcon className="mb-2 h-8 w-8" />
                )}
                <span className="px-2 text-center text-sm">{placeholder}</span>
                {dragAndDrop && (
                  <span className="mt-1 text-xs text-gray-400">드래그하거나 클릭</span>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* 삭제 버튼 */}
      {showDeleteButton && currentImage && !isLoading && (
        <button
          onClick={e => {
            e.stopPropagation()
            handleDelete()
          }}
          className="absolute -top-2 -right-2 z-10 flex h-7 w-7 items-center justify-center rounded-full bg-red-500 text-white shadow-lg transition-colors hover:bg-red-600"
        >
          <X className="h-4 w-4" />
        </button>
      )}

      {/* 업로드 진행률 (필요시 추가) */}
      {uploading && (
        <div className="absolute right-0 bottom-0 left-0 h-1 overflow-hidden rounded-b-xl bg-gray-200">
          <div className="bg-primary h-full animate-pulse"></div>
        </div>
      )}
    </div>
  )
}
