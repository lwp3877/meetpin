/* src/lib/imageUpload.ts */
import { createBrowserSupabaseClient } from '@/lib/supabaseClient'

export interface ImageUploadOptions {
  maxSizeMB?: number
  maxWidth?: number
  maxHeight?: number
  quality?: number
  format?: 'webp' | 'jpeg' | 'png'
}

export interface ImageUploadResult {
  success: boolean
  url?: string
  error?: string
  fileName?: string
}

// 이미지 압축 및 리사이징 함수
export async function compressImage(file: File, options: ImageUploadOptions = {}): Promise<Blob> {
  const { maxWidth = 800, maxHeight = 800, quality = 0.8, format = 'webp' } = options

  return new Promise(resolve => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')!
    const img = new Image()

    img.onload = () => {
      // 비율 유지하면서 리사이징
      const ratio = Math.min(maxWidth / img.width, maxHeight / img.height)
      const newWidth = img.width * ratio
      const newHeight = img.height * ratio

      canvas.width = newWidth
      canvas.height = newHeight

      // 이미지 그리기
      ctx.drawImage(img, 0, 0, newWidth, newHeight)

      // Blob으로 변환
      canvas.toBlob(
        blob => {
          resolve(blob!)
        },
        `image/${format}`,
        quality
      )
    }

    img.src = URL.createObjectURL(file)
  })
}

// 파일 업로드 유틸리티
export async function uploadImage(
  file: File,
  folder: 'avatars' | 'rooms' | 'general',
  userId: string,
  options: ImageUploadOptions = {}
): Promise<ImageUploadResult> {
  try {
    const { maxSizeMB = 5 } = options

    // 파일 크기 검증
    if (file.size > maxSizeMB * 1024 * 1024) {
      return { success: false, error: `파일 크기는 ${maxSizeMB}MB 이하여야 합니다` }
    }

    // 파일 형식 검증
    if (!file.type.startsWith('image/')) {
      return { success: false, error: '이미지 파일만 업로드 가능합니다' }
    }

    // 지원하는 형식 검증
    const supportedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!supportedTypes.includes(file.type)) {
      return { success: false, error: '지원하지 않는 이미지 형식입니다' }
    }

    // 이미지 압축
    const compressedBlob = await compressImage(file, options)

    // 파일명 생성 (타임스탬프 + 랜덤 문자열)
    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)
    const extension = options.format || 'webp'
    const fileName = `${folder}/${userId}/${timestamp}-${randomStr}.${extension}`

    const supabase = createBrowserSupabaseClient()

    // Supabase Storage에 업로드
    const { data, error } = await supabase.storage.from('images').upload(fileName, compressedBlob, {
      contentType: `image/${extension}`,
      upsert: false,
    })

    if (error) {
      console.error('Upload error:', error)
      return { success: false, error: '이미지 업로드에 실패했습니다' }
    }

    // 공개 URL 생성
    const {
      data: { publicUrl },
    } = supabase.storage.from('images').getPublicUrl(data.path)

    return {
      success: true,
      url: publicUrl,
      fileName: data.path,
    }
  } catch (error: any) {
    console.error('Image upload error:', error)
    return { success: false, error: '이미지 업로드 중 오류가 발생했습니다' }
  }
}

// 이미지 삭제 유틸리티
export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const supabase = createBrowserSupabaseClient()

    const { error } = await supabase.storage.from('images').remove([filePath])

    if (error) {
      console.error('Delete error:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Image delete error:', error)
    return false
  }
}

// 이미지 URL 최적화 (크기별 URL 생성)
export function getOptimizedImageUrl(
  originalUrl: string,
  size: 'thumbnail' | 'medium' | 'large' = 'medium'
): string {
  if (!originalUrl) return originalUrl

  // Supabase Storage URL인 경우 transform 파라미터 추가
  if (originalUrl.includes('supabase')) {
    const url = new URL(originalUrl)

    const sizeMap = {
      thumbnail: { width: 150, height: 150 },
      medium: { width: 400, height: 400 },
      large: { width: 800, height: 800 },
    }

    const { width, height } = sizeMap[size]
    url.searchParams.set('width', width.toString())
    url.searchParams.set('height', height.toString())
    url.searchParams.set('resize', 'cover')
    url.searchParams.set('quality', '80')

    return url.toString()
  }

  return originalUrl
}

// 이미지 미리보기 URL 생성
export function createImagePreview(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = e => resolve(e.target?.result as string)
    reader.onerror = reject
    reader.readAsDataURL(file)
  })
}

// 드래그 앤 드롭 이미지 처리
export function handleImageDrop(e: DragEvent, callback: (files: FileList) => void): void {
  e.preventDefault()

  const files = e.dataTransfer?.files
  if (files) {
    // 이미지 파일만 필터링
    const imageFiles = Array.from(files).filter(file => file.type.startsWith('image/'))

    if (imageFiles.length > 0) {
      const fileList = new DataTransfer()
      imageFiles.forEach(file => fileList.items.add(file))
      callback(fileList.files)
    }
  }
}
