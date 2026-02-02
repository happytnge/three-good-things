'use client'

import { useState, useEffect } from 'react'
import { useEntries } from '@/lib/hooks/useEntries'
import TimelineView from '@/components/timeline/TimelineView'
import Modal from '@/components/ui/Modal'
import EntryForm from '@/components/entries/EntryForm'
import type { Entry, EntryFormData } from '@/lib/types'
import { formatDate } from '@/lib/utils/dateUtils'

const ITEMS_PER_PAGE = 20

export default function TimelinePage() {
  const [entries, setEntries] = useState<Entry[]>([])
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { fetchEntries, updateEntry, deleteEntry, loading } = useEntries()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const data = await fetchEntries()
    setEntries(data.slice(0, ITEMS_PER_PAGE))
    setHasMore(data.length > ITEMS_PER_PAGE)
  }

  const loadMore = async () => {
    const data = await fetchEntries()
    const nextPage = page + 1
    const newEntries = data.slice(0, nextPage * ITEMS_PER_PAGE)
    setEntries(newEntries)
    setPage(nextPage)
    setHasMore(data.length > nextPage * ITEMS_PER_PAGE)
  }

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id)
    if (success) {
      await loadEntries()
      setPage(1)
    }
  }

  const handleSubmit = async (data: EntryFormData) => {
    if (editingEntry) {
      const updated = await updateEntry(editingEntry.id, data)
      if (updated) {
        await loadEntries()
        setPage(1)
        setIsModalOpen(false)
        setEditingEntry(null)
      }
    }
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setEditingEntry(null)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">
          タイムライン
        </h1>

        <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6">
          <TimelineView
            entries={entries}
            onEdit={handleEdit}
            onDelete={handleDelete}
            hasMore={hasMore}
            onLoadMore={loadMore}
            loading={loading}
          />
        </div>

      {/* 編集モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={editingEntry ? formatDate(editingEntry.entry_date, 'yyyy年MM月dd日 (E)') : ''}
        size="lg"
      >
        {editingEntry && (
          <EntryForm
            initialData={editingEntry}
            onSubmit={handleSubmit}
            onCancel={handleCloseModal}
            submitLabel="更新"
          />
        )}
      </Modal>
    </main>
  )
}
