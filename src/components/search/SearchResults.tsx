'use client'

import EntryCard from '@/components/entries/EntryCard'
import EmptyState from '@/components/ui/EmptyState'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Entry } from '@/lib/types'

interface SearchResultsProps {
  results: Entry[]
  loading: boolean
  onEdit?: (entry: Entry) => void
  onDelete?: (id: string) => void
}

export default function SearchResults({ results, loading, onEdit, onDelete }: SearchResultsProps) {
  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <EmptyState
        title="検索結果がありません"
        description="検索条件を変更してお試しください"
      />
    )
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-700">
        {results.length}件の結果
      </p>
      {results.map((entry) => (
        <EntryCard
          key={entry.id}
          entry={entry}
          onEdit={onEdit}
          onDelete={onDelete}
        />
      ))}
    </div>
  )
}
