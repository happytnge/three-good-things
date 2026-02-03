'use client'

import { useState, useRef } from 'react'
import Input from '@/components/ui/Input'
import Textarea from '@/components/ui/Textarea'
import Button from '@/components/ui/Button'
import type { EntryFormData, Entry } from '@/lib/types'
import { validateEntry } from '@/lib/utils/validationUtils'
import { validateImage } from '@/lib/utils/imageUtils'
import { toLocalDateString } from '@/lib/utils/dateUtils'
import { Image as ImageIcon, X } from 'lucide-react'

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
    existing_image_url: initialData?.image_url || null,
    existing_image_path: initialData?.image_path || null,
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.image_url || null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // 画像のバリデーション
    const validation = validateImage(file)
    if (!validation.valid) {
      setErrors({ ...errors, image: validation.error || '' })
      return
    }

    // プレビュー作成
    const reader = new FileReader()
    reader.onloadend = () => {
      setImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)

    setFormData({ ...formData, image: file })
    setErrors({ ...errors, image: '' })
  }

  const handleImageRemove = () => {
    setFormData({
      ...formData,
      image: null,
      existing_image_url: null,
      existing_image_path: null,
    })
    setImagePreview(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

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
          existing_image_url: null,
          existing_image_path: null,
        })
        setImagePreview(null)
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
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

      {/* 画像アップロード */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          今日のイメージ（任意）
        </label>

        {imagePreview ? (
          <div className="relative inline-block">
            <img
              src={imagePreview}
              alt="プレビュー"
              className="max-w-full max-h-64 rounded-lg border border-gray-300"
            />
            <button
              type="button"
              onClick={handleImageRemove}
              className="absolute top-2 right-2 p-1.5 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md"
              title="画像を削除"
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label
              htmlFor="image-upload"
              className="inline-flex items-center gap-2 px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            >
              <ImageIcon size={20} />
              <span>画像を選択</span>
            </label>
            <p className="mt-1 text-xs text-gray-700">
              JPG, PNG, GIF, WEBP (最大5MB)
            </p>
          </div>
        )}

        {errors.image && (
          <p className="mt-1 text-sm text-red-600">{errors.image}</p>
        )}
      </div>

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
