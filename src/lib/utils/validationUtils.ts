import type { EntryFormData } from '@/lib/types'

/**
 * メールアドレスのバリデーション
 */
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * パスワードのバリデーション
 * 最低8文字
 */
export function validatePassword(password: string): { valid: boolean; message?: string } {
  if (password.length < 8) {
    return { valid: false, message: 'パスワードは8文字以上である必要があります' }
  }
  return { valid: true }
}

/**
 * エントリーデータのバリデーション
 */
export function validateEntry(data: EntryFormData): { valid: boolean; errors: Record<string, string> } {
  const errors: Record<string, string> = {}

  if (!data.entry_date) {
    errors.entry_date = '日付は必須です'
  }

  if (!data.thing_one || data.thing_one.trim().length === 0) {
    errors.thing_one = '1つ目の良いことを入力してください'
  }

  if (!data.thing_two || data.thing_two.trim().length === 0) {
    errors.thing_two = '2つ目の良いことを入力してください'
  }

  if (!data.thing_three || data.thing_three.trim().length === 0) {
    errors.thing_three = '3つ目の良いことを入力してください'
  }

  if (!data.gratitude || data.gratitude.trim().length === 0) {
    errors.gratitude = '今日の感謝を入力してください'
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  }
}
