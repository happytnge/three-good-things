'use client'

import { useState } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import type { EntryFormData, Entry } from '@/lib/types'
import { validateEntry } from '@/lib/utils/validationUtils'
import { toLocalDateString } from '@/lib/utils/dateUtils'

interface EntryFormProps {
  initialData?: Entry
  initialDate?: string
  onSubmit: (data: EntryFormData) => Promise<void>
  onCancel?: () => void
  submitLabel?: string
}

export default function EntryForm({
  initialData,
  initialDate,
  onSubmit,
  onCancel,
  submitLabel = '保存',
}: EntryFormProps) {
  const [formData, setFormData] = useState<EntryFormData>({
    entry_date: initialData?.entry_date || initialDate || toLocalDateString(new Date()),
    thing_one: initialData?.thing_one || '',
    thing_two: initialData?.thing_two || '',
    thing_three: initialData?.thing_three || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    // バリデーション
    const validation = validateEntry(formData)
    if (!validation.valid) {
      setErrors(validation.errors)
      return
    }

    setLoading(true)
    try {
      await onSubmit(formData)
      // 成功時はフォームをリセット（新規作成の場合のみ）
      if (!initialData) {
        setFormData({
          entry_date: toLocalDateString(new Date()),
          thing_one: '',
          thing_two: '',
          thing_three: '',
        })
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        type="date"
        label="日付"
        value={formData.entry_date}
        onChange={(e) => setFormData({ ...formData, entry_date: e.target.value })}
        error={errors.entry_date}
        required
      />

      <Textarea
        label="1つ目の良いこと"
        placeholder="今日あった良いことを書いてください... (#タグ も使えます)"
        value={formData.thing_one}
        onChange={(e) => setFormData({ ...formData, thing_one: e.target.value })}
        error={errors.thing_one}
        rows={3}
        required
      />

      <Textarea
        label="2つ目の良いこと"
        placeholder="今日あった良いことを書いてください... (#タグ も使えます)"
        value={formData.thing_two}
        onChange={(e) => setFormData({ ...formData, thing_two: e.target.value })}
        error={errors.thing_two}
        rows={3}
        required
      />

      <Textarea
        label="3つ目の良いこと"
        placeholder="今日あった良いことを書いてください... (#タグ も使えます)"
        value={formData.thing_three}
        onChange={(e) => setFormData({ ...formData, thing_three: e.target.value })}
        error={errors.thing_three}
        rows={3}
        required
      />

      <div className="flex gap-3">
        <Button type="submit" disabled={loading} className="flex-1">
          {loading ? '保存中...' : submitLabel}
        </Button>
        {onCancel && (
          <Button type="button" variant="secondary" onClick={onCancel}>
            キャンセル
          </Button>
        )}
      </div>
    </form>
  )
}
