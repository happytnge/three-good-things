'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Profile } from '@/lib/types'
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

  return {
    loading,
    error,
    fetchProfile,
    updateProfile,
    updateAvatar,
    removeAvatar,
  }
}
