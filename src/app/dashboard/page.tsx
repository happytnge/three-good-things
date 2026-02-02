'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/hooks/useAuth'
import { useEntries } from '@/lib/hooks/useEntries'
import { useRouter } from 'next/navigation'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import EntryForm from '@/components/entries/EntryForm'
import EntryCard from '@/components/entries/EntryCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import type { Entry, EntryFormData } from '@/lib/types'
import { getTodayString } from '@/lib/utils/dateUtils'

export default function DashboardPage() {
  const { user, signOut } = useAuth()
  const { fetchEntryByDate, createEntry, updateEntry, deleteEntry, loading } = useEntries()
  const router = useRouter()
  const [todayEntry, setTodayEntry] = useState<Entry | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadTodayEntry()
  }, [])

  const loadTodayEntry = async () => {
    const today = getTodayString()
    const entry = await fetchEntryByDate(today)
    setTodayEntry(entry)
    setShowForm(!entry) // エントリーがなければフォームを表示
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  const handleSubmit = async (data: EntryFormData) => {
    setMessage(null)

    if (isEditing && todayEntry) {
      // 更新
      const updated = await updateEntry(todayEntry.id, data)
      if (updated) {
        setTodayEntry(updated)
        setIsEditing(false)
        setShowForm(false)
        setMessage({ type: 'success', text: 'エントリーを更新しました' })
      } else {
        setMessage({ type: 'error', text: 'エントリーの更新に失敗しました' })
      }
    } else {
      // 新規作成
      const created = await createEntry(data)
      if (created) {
        setTodayEntry(created)
        setShowForm(false)
        setMessage({ type: 'success', text: 'エントリーを作成しました' })
      } else {
        setMessage({ type: 'error', text: 'エントリーの作成に失敗しました' })
      }
    }
  }

  const handleEdit = (entry: Entry) => {
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id)
    if (success) {
      setTodayEntry(null)
      setShowForm(true)
      setMessage({ type: 'success', text: 'エントリーを削除しました' })
    } else {
      setMessage({ type: 'error', text: 'エントリーの削除に失敗しました' })
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
    setShowForm(!todayEntry)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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

        <div className="mb-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            今日のエントリー
          </h2>

          {loading ? (
            <Card>
              <div className="flex justify-center py-8">
                <LoadingSpinner />
              </div>
            </Card>
          ) : showForm ? (
            <Card>
              <EntryForm
                initialData={isEditing ? todayEntry || undefined : undefined}
                initialDate={getTodayString()}
                onSubmit={handleSubmit}
                onCancel={todayEntry ? handleCancel : undefined}
                submitLabel={isEditing ? '更新' : '作成'}
              />
            </Card>
          ) : todayEntry ? (
            <EntryCard
              entry={todayEntry}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <Card>
              <EmptyState
                title="今日のエントリーがありません"
                description="今日あった3つの良いことを記録しましょう"
                action={
                  <Button onClick={() => setShowForm(true)}>
                    エントリーを作成
                  </Button>
                }
              />
            </Card>
          )}
        </div>

        {!showForm && todayEntry && (
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              素晴らしい！今日のエントリーが完了しています。
            </p>
          </div>
        )}
    </main>
  )
}
