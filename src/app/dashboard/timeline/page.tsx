'use client'

import { useState, useEffect } from 'react'
import { useEntries } from '@/lib/hooks/useEntries'
import TimelineView from '@/components/timeline/TimelineView'
import type { EntryWithSocialData } from '@/lib/types'

const ITEMS_PER_PAGE = 20

export default function TimelinePage() {
  const [entries, setEntries] = useState<EntryWithSocialData[]>([])
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const { fetchPublicTimeline, loading } = useEntries()

  useEffect(() => {
    loadEntries()
  }, [])

  const loadEntries = async () => {
    const data = await fetchPublicTimeline(ITEMS_PER_PAGE, 0)
    setEntries(data)
    setOffset(ITEMS_PER_PAGE)
    setHasMore(data.length === ITEMS_PER_PAGE)
  }

  const loadMore = async () => {
    const data = await fetchPublicTimeline(ITEMS_PER_PAGE, offset)
    setEntries((prev) => [...prev, ...data])
    setOffset((prev) => prev + ITEMS_PER_PAGE)
    setHasMore(data.length === ITEMS_PER_PAGE)
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        パブリックタイムライン
      </h1>
      <p className="text-gray-600 mb-6">
        全ユーザーの公開エントリーを表示しています
      </p>

      <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6">
        <TimelineView
          entries={entries}
          hasMore={hasMore}
          onLoadMore={loadMore}
          loading={loading}
          showAuthor={true}
          showSocial={true}
        />
      </div>
    </main>
  )
}
