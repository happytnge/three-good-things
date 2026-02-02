'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'next/navigation'
import { useSearch } from '@/lib/hooks/useSearch'
import { useEntries } from '@/lib/hooks/useEntries'
import SearchBar from '@/components/search/SearchBar'
import FilterPanel from '@/components/search/FilterPanel'
import SearchResults from '@/components/search/SearchResults'
import Modal from '@/components/ui/Modal'
import EntryForm from '@/components/entries/EntryForm'
import type { Entry, EntryFormData, SearchFilters } from '@/lib/types'
import { formatDate } from '@/lib/utils/dateUtils'
import { getUniqueTags } from '@/lib/utils/tagUtils'

export default function SearchPage() {
  const searchParams = useSearchParams()
  const [filters, setFilters] = useState<SearchFilters>({
    query: searchParams.get('q') || '',
  })
  const [allTags, setAllTags] = useState<string[]>([])
  const [editingEntry, setEditingEntry] = useState<Entry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const { results, loading, searchEntries } = useSearch()
  const { fetchEntries, updateEntry, deleteEntry } = useEntries()

  useEffect(() => {
    loadAllTags()
  }, [])

  useEffect(() => {
    performSearch()
  }, [filters])

  const loadAllTags = async () => {
    const entries = await fetchEntries()
    const tags = getUniqueTags(entries)
    setAllTags(tags)
  }

  const performSearch = useCallback(async () => {
    await searchEntries(filters)
  }, [filters, searchEntries])

  const handleSearchChange = useCallback((query: string) => {
    setFilters(prev => ({ ...prev, query }))
  }, [])

  const handleFilterChange = useCallback((newFilters: { dateFrom?: string; dateTo?: string; tags?: string[] }) => {
    setFilters(prev => ({
      ...prev,
      ...newFilters,
    }))
  }, [])

  const handleEdit = (entry: Entry) => {
    setEditingEntry(entry)
    setIsModalOpen(true)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id)
    if (success) {
      await performSearch()
      await loadAllTags()
    }
  }

  const handleSubmit = async (data: EntryFormData) => {
    if (editingEntry) {
      const updated = await updateEntry(editingEntry.id, data)
      if (updated) {
        await performSearch()
        await loadAllTags()
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
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        検索
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* サイドバー: フィルター */}
        <div className="lg:col-span-1">
          <FilterPanel
            availableTags={allTags}
            onFilterChange={handleFilterChange}
          />
        </div>

        {/* メインコンテンツ: 検索バーと結果 */}
        <div className="lg:col-span-3 space-y-6">
          <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-4">
            <SearchBar
              onSearch={handleSearchChange}
              placeholder="エントリーを検索..."
            />
          </div>

          <SearchResults
            results={results}
            loading={loading}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </div>
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
