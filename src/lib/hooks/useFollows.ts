'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Follow, Profile } from '@/lib/types'

export function useFollows() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // フォロワー一覧を取得
  const fetchFollowers = useCallback(async (userId: string): Promise<Profile[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('follower_id, profiles!follows_follower_id_fkey(*)')
        .eq('following_id', userId)

      if (fetchError) throw fetchError
      return data?.map((item: any) => item.profiles) || []
    } catch (err) {
      console.error('Failed to fetch followers:', err)
      return []
    }
  }, [supabase])

  // フォロー中一覧を取得
  const fetchFollowing = useCallback(async (userId: string): Promise<Profile[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('following_id, profiles!follows_following_id_fkey(*)')
        .eq('follower_id', userId)

      if (fetchError) throw fetchError
      return data?.map((item: any) => item.profiles) || []
    } catch (err) {
      console.error('Failed to fetch following:', err)
      return []
    }
  }, [supabase])

  // フォロワー数を取得
  const fetchFollowerCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const { count, error: fetchError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', userId)

      if (fetchError) throw fetchError
      return count || 0
    } catch (err) {
      console.error('Failed to fetch follower count:', err)
      return 0
    }
  }, [supabase])

  // フォロー中数を取得
  const fetchFollowingCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const { count, error: fetchError } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', userId)

      if (fetchError) throw fetchError
      return count || 0
    } catch (err) {
      console.error('Failed to fetch following count:', err)
      return 0
    }
  }, [supabase])

  // フォロー中かチェック
  const checkIsFollowing = useCallback(async (targetUserId: string): Promise<boolean> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return false

      const { data, error: fetchError } = await supabase
        .from('follows')
        .select('id')
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)
        .single()

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError
      return !!data
    } catch (err) {
      console.error('Failed to check is following:', err)
      return false
    }
  }, [supabase])

  // ユーザーをフォロー
  const followUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      if (user.id === targetUserId) {
        throw new Error('自分自身をフォローできません')
      }

      const { error: insertError } = await supabase
        .from('follows')
        .insert({
          follower_id: user.id,
          following_id: targetUserId,
        })

      if (insertError) throw insertError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'フォローに失敗しました'
      setError(message)
      console.error('Failed to follow user:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // フォロー解除
  const unfollowUser = useCallback(async (targetUserId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: deleteError } = await supabase
        .from('follows')
        .delete()
        .eq('follower_id', user.id)
        .eq('following_id', targetUserId)

      if (deleteError) throw deleteError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'フォロー解除に失敗しました'
      setError(message)
      console.error('Failed to unfollow user:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // フォローをトグル
  const toggleFollow = useCallback(async (targetUserId: string, currentlyFollowing: boolean): Promise<{
    success: boolean
    newFollowingState: boolean
  }> => {
    if (currentlyFollowing) {
      const success = await unfollowUser(targetUserId)
      return { success, newFollowingState: !success }
    } else {
      const success = await followUser(targetUserId)
      return { success, newFollowingState: success }
    }
  }, [followUser, unfollowUser])

  return {
    loading,
    error,
    fetchFollowers,
    fetchFollowing,
    fetchFollowerCount,
    fetchFollowingCount,
    checkIsFollowing,
    followUser,
    unfollowUser,
    toggleFollow,
  }
}
