'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile, ProfileWithStats, Entry } from '@/lib/types'
import { uploadAvatar, deleteAvatar } from '@/lib/utils/avatarUtils'

export function useProfile() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // プロフィールを取得
  const fetchProfile = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { data, error: fetchError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (fetchError) throw fetchError

      return data as Profile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'プロフィールの取得に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // プロフィールを更新
  const updateProfile = useCallback(async (updates: { display_name?: string; avatar_url?: string }) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { data, error: updateError } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single()

      if (updateError) throw updateError

      return data as Profile
    } catch (err) {
      const message = err instanceof Error ? err.message : 'プロフィールの更新に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // アバターをアップロード
  const updateAvatar = useCallback(async (file: File) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // アバターをアップロード
      const { url } = await uploadAvatar(user.id, file)

      // プロフィールを更新
      const updated = await updateProfile({ avatar_url: url })

      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アバターのアップロードに失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, updateProfile])

  // アバターを削除
  const removeAvatar = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // Storageから削除
      await deleteAvatar(user.id)

      // プロフィールを更新
      const updated = await updateProfile({ avatar_url: '' })

      return updated
    } catch (err) {
      const message = err instanceof Error ? err.message : 'アバターの削除に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase, updateProfile])

  // 統計付き公開プロフィール取得
  const fetchPublicProfile = useCallback(async (userId: string): Promise<ProfileWithStats | null> => {
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
      const message = err instanceof Error ? err.message : '公開プロフィールの取得に失敗しました'
      setError(message)
      console.error('Failed to fetch public profile:', err)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // ユーザーのエントリー取得
  const fetchUserEntries = useCallback(async (userId: string, limit = 10): Promise<Entry[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', userId)
        .order('entry_date', { ascending: false })
        .limit(limit)

      if (fetchError) throw fetchError
      return data as Entry[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'ユーザーエントリーの取得に失敗しました'
      setError(message)
      console.error('Failed to fetch user entries:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    fetchProfile,
    fetchPublicProfile,
    fetchUserEntries,
    updateProfile,
    updateAvatar,
    removeAvatar,
  }
}
