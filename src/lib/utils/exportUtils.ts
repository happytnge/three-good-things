import type { Entry } from '@/lib/types'

/**
 * エントリーをJSON形式に変換
 */
export function convertToJSON(entries: Entry[]): string {
  const formatted = entries.map(entry => ({
    date: entry.entry_date,
    things: [entry.thing_one, entry.thing_two, entry.thing_three],
    tags: entry.tags,
  }))
  return JSON.stringify(formatted, null, 2)
}

/**
 * エントリーをCSV形式に変換
 */
export function convertToCSV(entries: Entry[]): string {
  const headers = ['Date', 'Thing 1', 'Thing 2', 'Thing 3', 'Tags']
  const rows = entries.map(entry => [
    entry.entry_date,
    escapeCSV(entry.thing_one),
    escapeCSV(entry.thing_two),
    escapeCSV(entry.thing_three),
    entry.tags.join(','),
  ])

  // UTF-8 BOMを追加して日本語の文字化けを防ぐ
  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.join(',')),
  ].join('\n')

  return '\uFEFF' + csvContent
}

/**
 * CSV用に文字列をエスケープ
 */
function escapeCSV(text: string): string {
  if (text.includes(',') || text.includes('"') || text.includes('\n')) {
    return `"${text.replace(/"/g, '""')}"`
  }
  return text
}

/**
 * データをファイルとしてダウンロード
 */
export function downloadFile(data: string, filename: string, type: string): void {
  const blob = new Blob([data], { type: `${type};charset=utf-8` })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
