import { createClient } from '@/lib/supabase/client'

const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']

/**
 * アバター画像のバリデーション
 */
export function validateAvatar(file: File): { valid: boolean; error?: string } {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: '対応している画像形式: JPG, PNG, GIF, WEBP',
    }
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: '画像サイズは2MB以下にしてください',
    }
  }

  return { valid: true }
}

/**
 * アバター画像をリサイズ（正方形、300x300px）
 */
export async function resizeAvatar(file: File, size: number = 300): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = (e) => {
      const img = new Image()
      img.onload = () => {
        const canvas = document.createElement('canvas')
        canvas.width = size
        canvas.height = size

        const ctx = canvas.getContext('2d')
        if (!ctx) {
          reject(new Error('Canvas context を取得できませんでした'))
          return
        }

        // 正方形にクロップして描画
        const minDimension = Math.min(img.width, img.height)
        const sx = (img.width - minDimension) / 2
        const sy = (img.height - minDimension) / 2

        ctx.drawImage(img, sx, sy, minDimension, minDimension, 0, 0, size, size)

        canvas.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob)
            } else {
              reject(new Error('画像の変換に失敗しました'))
            }
          },
          'image/jpeg',
          0.9
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
 * Supabase Storageにアバターをアップロード
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string }> {
  const supabase = createClient()

  // 古いアバターを削除（存在する場合）
  const { data: existingFiles } = await supabase.storage
    .from('avatars')
    .list(userId)

  if (existingFiles && existingFiles.length > 0) {
    const filesToDelete = existingFiles.map((file) => `${userId}/${file.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }

  // ファイル名を生成
  const fileExt = file.name.split('.').pop()
  const fileName = `avatar.${fileExt}`
  const filePath = `${userId}/${fileName}`

  // 画像をリサイズ
  const resizedBlob = await resizeAvatar(file)

  // アップロード
  const { error } = await supabase.storage
    .from('avatars')
    .upload(filePath, resizedBlob, {
      contentType: 'image/jpeg',
      upsert: true,
    })

  if (error) {
    throw new Error(`アバターのアップロードに失敗しました: ${error.message}`)
  }

  // 公開URLを取得
  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(filePath)

  return {
    url: urlData.publicUrl,
  }
}

/**
 * アバター削除
 */
export async function deleteAvatar(userId: string): Promise<void> {
  const supabase = createClient()

  const { data: files } = await supabase.storage.from('avatars').list(userId)

  if (files && files.length > 0) {
    const filesToDelete = files.map((file) => `${userId}/${file.name}`)
    await supabase.storage.from('avatars').remove(filesToDelete)
  }
}
