'use client'

import { useState, useEffect } from 'react'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import { getTodayString } from '@/lib/utils/dateUtils'

interface FilterPanelProps {
  availableTags: string[]
  onFilterChange: (filters: { dateFrom?: string; dateTo?: string; tags?: string[] }) => void
}

export default function FilterPanel({ availableTags, onFilterChange }: FilterPanelProps) {
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])

  useEffect(() => {
    onFilterChange({
      dateFrom: dateFrom || undefined,
      dateTo: dateTo || undefined,
      tags: selectedTags.length > 0 ? selectedTags : undefined,
    })
  }, [dateFrom, dateTo, selectedTags, onFilterChange])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  const clearFilters = () => {
    setDateFrom('')
    setDateTo('')
    setSelectedTags([])
  }

  const hasFilters = dateFrom || dateTo || selectedTags.length > 0

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">
          フィルター
        </h3>
        {hasFilters && (
          <Button variant="secondary" size="sm" onClick={clearFilters}>
            クリア
          </Button>
        )}
      </div>

      {/* 日付範囲フィルター */}
      <div className="space-y-4">
        <h4 className="text-sm font-semibold text-gray-700">
          日付範囲
        </h4>
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
      </div>

      {/* タグフィルター */}
      {availableTags.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-semibold text-gray-700">
            タグ
          </h4>
          <div className="flex flex-wrap gap-2">
            {availableTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`px-3 py-1 text-sm font-semibold rounded-full transition-all ${
                  selectedTags.includes(tag)
                    ? 'bg-blue-600 text-white shadow-md hover:shadow-lg'
                    : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 hover:shadow-sm'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
