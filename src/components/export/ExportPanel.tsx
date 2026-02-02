'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import Card from '@/components/ui/Card'
import { getTodayString } from '@/lib/utils/dateUtils'
import type { ExportOptions } from '@/lib/types'

interface ExportPanelProps {
  onExport: (options: ExportOptions) => Promise<void>
}

export default function ExportPanel({ onExport }: ExportPanelProps) {
  const [format, setFormat] = useState<'json' | 'csv'>('json')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      await onExport({
        format,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">
        データをエクスポート
      </h2>

      <div className="space-y-6">
        {/* フォーマット選択 */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            フォーマット
          </label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                value="json"
                checked={format === 'json'}
                onChange={(e) => setFormat(e.target.value as 'json')}
                className="mr-2"
              />
              <span className="text-gray-700">JSON</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                value="csv"
                checked={format === 'csv'}
                onChange={(e) => setFormat(e.target.value as 'csv')}
                className="mr-2"
              />
              <span className="text-gray-700">CSV</span>
            </label>
          </div>
        </div>

        {/* 日付範囲選択 */}
        <div className="space-y-4">
          <label className="block text-sm font-semibold text-gray-700">
            日付範囲（オプション）
          </label>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              type="date"
              label="開始日"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || getTodayString()}
            />
            <Input
              type="date"
              label="終了日"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom}
              max={getTodayString()}
            />
          </div>
          <p className="text-sm text-gray-700">
            日付を指定しない場合、すべてのエントリーがエクスポートされます
          </p>
        </div>

        {/* エクスポートボタン */}
        <div className="pt-4">
          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full"
          >
            {loading ? 'エクスポート中...' : `${format.toUpperCase()}でダウンロード`}
          </Button>
        </div>

        {/* 説明 */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="text-sm font-semibold text-blue-900 mb-2">
            エクスポート形式について
          </h3>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• <strong>JSON:</strong> プログラムで処理しやすい形式</li>
            <li>• <strong>CSV:</strong> ExcelやGoogleスプレッドシートで開ける形式</li>
          </ul>
        </div>
      </div>
    </Card>
  )
}
