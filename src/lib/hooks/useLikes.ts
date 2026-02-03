'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Like } from '@/lib/types'

export function useLikes() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // いいね数を取得
  const fetchLikeCount = useCallback(async (entryId: string): Promise<number> => {
    try {
      const { count, error: fetchError } = await supabase
        .from('likes')
        .select('*', { count: 'exact', head: true })
        .eq('entry_id', entryId)

      if (fetchError) throw fetchError
      return count || 0
    } catch (err) {
      console.error('Failed to fetch like count:', err)
      return 0
    }
  }, [supabase])

  // ユーザーがいいね済みかチェック
  const checkUserLiked = useCallback(async (entryId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error: fetchError } = await supabase
        .from('likes')
        .select('id')
        .eq('entry_id', entryId)
        .eq('user_id', user.id)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return !!data
    } catch (err) {
      console.error('Failed to check user liked:', err)
      return false
    }
  }, [supabase])

  // エントリーにいいねする
  const likeEntry = useCallback(async (entryId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: insertError } = await supabase
        .from('likes')
        .insert({
          user_id: user.id,
          entry_id: entryId,
        })

      if (insertError) throw insertError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'いいねに失敗しました'
      setError(message)
      console.error('Failed to like entry:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // いいねを解除
  const unlikeEntry = useCallback(async (entryId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: deleteError } = await supabase
        .from('likes')
        .delete()
        .eq('user_id', user.id)
        .eq('entry_id', entryId)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'いいね解除に失敗しました'
      setError(message)
      console.error('Failed to unlike entry:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // いいねをトグル
  const toggleLike = useCallback(async (entryId: string, currentlyLiked: boolean): Promise<{
    success: boolean
    newLikedState: boolean
    newCount: number
  }> => {
    if (currentlyLiked) {
      const success = await unlikeEntry(entryId)
      const newCount = await fetchLikeCount(entryId)
      return { success, newLikedState: !success, newCount }
    } else {
      const success = await likeEntry(entryId)
      const newCount = await fetchLikeCount(entryId)
      return { success, newLikedState: success, newCount }
    }
  }, [likeEntry, unlikeEntry, fetchLikeCount])

  return {
    loading,
    error,
    fetchLikeCount,
    checkUserLiked,
    likeEntry,
    unlikeEntry,
    toggleLike,
  }
}
