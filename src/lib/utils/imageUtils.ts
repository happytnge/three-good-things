import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * 画像ファイルのバリデーション
 */
export function validateImage(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '対応している画像形式: JPG, PNG, GIF, WEBP',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '画像サイズは5MB以下にしてください',
    }
  }

  return { valid: true }
}

/**
 * 画像をリサイズ（最大幅/高さ: 1200px）
 */
export async function resizeImage(file: File, maxSize: number = 1200): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        let width = img.width
        let height = img.height

        // アスペクト比を保持してリサイズ
        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width
            width = maxSize
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height
            height = maxSize
          }
        }

        canvas.width = width
        canvas.height = height

        const ctx = canvas.getContext('2d')
        ctx?.drawImage(img, 0, 0, width, height)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('画像の変換に失敗しました'))
            }
          },
          file.type,
          0.9 // 品質90%
        )
      }
      img.onerror = () => reject(new Error('画像の読み込みに失敗しました'))
      img.src = e.target?.result as string
    }
    reader.onerror = () => reject(new Error('ファイルの読み込みに失敗しました'))
    reader.readAsDataURL(file)
  })
}

/**
 * Supabase Storageに画像をアップロード
 */
export async function uploadImage(
  userId: string,
  file: File
): Promise<{ path: string; url: string }> {
  const supabase = createClient()

  // ファイル名を生成（ユーザーID/タイムスタンプ_ランダム.拡張子）
  const fileExt = file.name.split('.').pop()
  const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // 画像をリサイズ
  const resizedBlob = await resizeImage(file)

  // アップロード
  const { data, error } = await supabase.storage
    .from('entry-images')
    .upload(filePath, resizedBlob, {
      contentType: file.type,
      upsert: false,
    })

  if (error) {
    throw new Error(`画像のアップロードに失敗しました: ${error.message}`)
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('entry-images')
    .getPublicUrl(filePath)

  return {
    path: data.path,
    url: urlData.publicUrl,
  }
}

/**
 * Supabase Storageから画像を削除
 */
export async function deleteImage(imagePath: string): Promise<void> {
  const supabase = createClient()

  const { error } = await supabase.storage.from('entry-images').remove([imagePath])

  if (error) {
    console.error('画像の削除に失敗しました:', error)
    // エラーは無視（ファイルが存在しない場合など）
  }
}

/**
 * サムネイルURL生成（Supabase Transformations使用）
 */
export function getThumbnailUrl(imageUrl: string, width: number = 200): string {
  if (!imageUrl) return ''

  // Supabase Storageの画像変換機能を使用
  const url = new URL(imageUrl)
  url.searchParams.set('width', width.toString())
  url.searchParams.set('quality', '80')

  return url.toString()
}
