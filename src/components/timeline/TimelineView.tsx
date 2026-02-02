'use client'

import { useState } from 'react'
import TimelineItem from './TimelineItem'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import type { Entry } from '@/lib/types'

interface TimelineViewProps {
  entries: Entry[]
  onEdit?: (entry: Entry) => void
  onDelete?: (id: string) => void
  hasMore?: boolean
  onLoadMore?: () => void
  loading?: boolean
}

export default function TimelineView({
  entries,
  onEdit,
  onDelete,
  hasMore = false,
  onLoadMore,
  loading = false,
}: TimelineViewProps) {
  if (entries.length === 0 && !loading) {
    return (
      <EmptyState
        title="エントリーがありません"
        description="まだエントリーを作成していません。ダッシュボードから最初のエントリーを作成しましょう。"
      />
    )
  }

  return (
    <div className="space-y-0">
      {entries.map((entry, index) => (
        <div key={entry.id} className={index === entries.length - 1 ? 'last:pb-0' : ''}>
          <TimelineItem entry={entry} onEdit={onEdit} onDelete={onDelete} />
        </div>
      ))}

      {loading && (
        <div className="flex justify-center py-8">
          <LoadingSpinner />
        </div>
      )}

      {hasMore && !loading && onLoadMore && (
        <div className="flex justify-center pt-4">
          <Button variant="secondary" onClick={onLoadMore}>
            もっと見る
          </Button>
        </div>
      )}
    </div>
  )
}
