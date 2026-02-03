'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ProfileWithStats, UserSearchResult } from '@/lib/types'

export function useUsers() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // ユーザー検索
  const searchUsers = useCallback(async (query: string): Promise<UserSearchResult[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 表示名またはメールで検索
      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('id, display_name, email, avatar_url')
        .or(`display_name.ilike.%${query}%,email.ilike.%${query}%`)
        .neq('id', user.id) // 自分自身を除外
        .limit(20)

      if (fetchError) throw fetchError

      // 各ユーザーのフォロー状態を取得
      const usersWithFollowStatus = await Promise.all(
        (data || []).map(async (profile) => {
          const [isFollowing, isFollowedBy] = await Promise.all([
            // 自分がフォローしているか
            supabase
              .from('follows')
              .select('id')
              .eq('follower_id', user.id)
              .eq('following_id', profile.id)
              .maybeSingle()
              .then(({ data }) => !!data),
            // 相手がフォローしているか
            supabase
              .from('follows')
              .select('id')
              .eq('follower_id', profile.id)
              .eq('following_id', user.id)
              .maybeSingle()
              .then(({ data }) => !!data),
          ])

          return {
            ...profile,
            is_following: isFollowing,
            is_followed_by: isFollowedBy,
          } as UserSearchResult
        })
      )

      return usersWithFollowStatus
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ユーザー検索に失敗しました'
      setError(message)
      console.error('Failed to search users:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 公開プロフィール取得（統計付き）
  const fetchUserProfile = useCallback(async (userId: string): Promise<ProfileWithStats | null> => {
    setLoading(true)
    setError(null)

    try {
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single()

      if (profileError) throw profileError

      // 統計情報を並列取得
      const [followerCount, followingCount, entryCount] = await Promise.all([
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('following_id', userId)
          .then(({ count }) => count || 0),
        supabase
          .from('follows')
          .select('*', { count: 'exact', head: true })
          .eq('follower_id', userId)
          .then(({ count }) => count || 0),
        supabase
          .from('entries')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .then(({ count }) => count || 0),
      ])

      return {
        ...profile,
        follower_count: followerCount,
        following_count: followingCount,
        entry_count: entryCount,
      } as ProfileWithStats
    } catch (err) {
      const message = err instanceof Error ? err.message : 'プロフィールの取得に失敗しました'
      setError(message)
      console.error('Failed to fetch user profile:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // おすすめユーザー取得（簡易版：ランダムに取得）
  const fetchSuggestedUsers = useCallback(async (limit = 10): Promise<Profile[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // すでにフォローしているユーザーIDを取得
      const { data: followingData } = await supabase
        .from('follows')
        .select('following_id')
        .eq('follower_id', user.id)

      const followingIds = followingData?.map((f) => f.following_id) || []

      // フォローしていないユーザーを取得
      let query = supabase
        .from('profiles')
        .select('*')
        .neq('id', user.id)

      // フォロー中のユーザーを除外（配列が空でない場合のみ）
      if (followingIds.length > 0) {
        query = query.not('id', 'in', `(${followingIds.join(',')})`)
      }

      const { data, error: fetchError } = await query.limit(limit)

      if (fetchError) throw fetchError
      return data as Profile[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'おすすめユーザーの取得に失敗しました'
      setError(message)
      console.error('Failed to fetch suggested users:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    searchUsers,
    fetchUserProfile,
    fetchSuggestedUsers,
  }
}
