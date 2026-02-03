'use client'

import { useState } from 'react'
import { useEntries } from '@/lib/hooks/useEntries'
import ExportPanel from '@/components/export/ExportPanel'
import { convertToJSON, convertToCSV, downloadFile } from '@/lib/utils/exportUtils'
import { toLocalDateString } from '@/lib/utils/dateUtils'
import type { ExportOptions } from '@/lib/types'

export default function ExportPage() {
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const { fetchEntries } = useEntries()

  const handleExport = async (options: ExportOptions) => {
    setMessage(null)

    try {
      // エントリーを取得
      const entries = await fetchEntries(options.dateFrom, options.dateTo)

      if (entries.length === 0) {
        setMessage({ type: 'error', text: 'エクスポートするデータがありません' })
        return
      }

      // フォーマットに応じて変換
      let data: string
      let filename: string
      let mimeType: string

      if (options.format === 'json') {
        data = convertToJSON(entries)
        filename = `three-good-things-${toLocalDateString(new Date())}.json`
        mimeType = 'application/json'
      } else {
        data = convertToCSV(entries)
        filename = `three-good-things-${toLocalDateString(new Date())}.csv`
        mimeType = 'text/csv'
      }

      // ダウンロード
      downloadFile(data, filename, mimeType)

      setMessage({
        type: 'success',
        text: `${entries.length}件のエントリーをエクスポートしました`
      })
    } catch (error) {
      console.error('Export error:', error)
      setMessage({
        type: 'error',
        text: 'エクスポートに失敗しました'
      })
    }
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        データエクスポート
      </h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <ExportPanel onExport={handleExport} />
    </main>
  )
}
