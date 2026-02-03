'use client'

import { useState, useCallback, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry, SearchFilters } from '@/lib/types'

export function useSearch() {
  const [results, setResults] = useState<Entry[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const searchEntries = useCallback(async (filters: SearchFilters) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      let query = supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id) // 自分のエントリーのみ検索
        .order('entry_date', { ascending: false })

      // 日付範囲フィルター
      if (filters.dateFrom) {
        query = query.gte('entry_date', filters.dateFrom)
      }
      if (filters.dateTo) {
        query = query.lte('entry_date', filters.dateTo)
      }

      // タグフィルター
      if (filters.tags && filters.tags.length > 0) {
        query = query.overlaps('tags', filters.tags)
      }

      const { data, error: searchError } = await query

      if (searchError) throw searchError

      let filteredData = data as Entry[]

      // テキスト検索（クライアント側）
      if (filters.query && filters.query.trim()) {
        const searchTerm = filters.query.toLowerCase()
        filteredData = filteredData.filter(entry =>
          entry.thing_one.toLowerCase().includes(searchTerm) ||
          entry.thing_two.toLowerCase().includes(searchTerm) ||
          entry.thing_three.toLowerCase().includes(searchTerm)
        )
      }

      setResults(filteredData)
      return filteredData
    } catch (err) {
      const message = err instanceof Error ? err.message : '検索に失敗しました'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    results,
    loading,
    error,
    searchEntries,
  }
}
