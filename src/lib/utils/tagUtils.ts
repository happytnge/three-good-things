import type { Entry } from '@/lib/types'

/**
 * テキストから#ハッシュタグを抽出
 */
export function extractTags(text: string): string[] {
  const hashtagRegex = /#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FFF]+/g
  const matches = text.match(hashtagRegex)
  return matches ? Array.from(new Set(matches)) : []
}

/**
 * 複数のテキストからタグを抽出
 */
export function extractTagsFromTexts(...texts: string[]): string[] {
  const allTags = texts.flatMap(text => extractTags(text))
  return Array.from(new Set(allTags))
}

/**
 * エントリーの配列からユニークなタグを取得
 */
export function getUniqueTags(entries: Entry[]): string[] {
  const allTags = entries.flatMap(entry => entry.tags)
  return Array.from(new Set(allTags)).sort()
}

/**
 * タグでエントリーをフィルター
 */
export function filterByTags(entries: Entry[], tags: string[]): Entry[] {
  if (tags.length === 0) return entries
  return entries.filter(entry =>
    tags.some(tag => entry.tags.includes(tag))
  )
}
