'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry, EntryFormData, EntryWithSocialData } from '@/lib/types'
import { extractTagsFromTexts } from '@/lib/utils/tagUtils'
import { uploadImage, deleteImage } from '@/lib/utils/imageUtils'

export function useEntries() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // エントリー一覧を取得（自分のエントリーのみ）
  const fetchEntries = useCallback(async (dateFrom?: string, dateTo?: string) => {
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
        .eq('user_id', user.id) // 自分のエントリーのみフィルタリング
        .order('entry_date', { ascending: false })

      if (dateFrom) {
        query = query.gte('entry_date', dateFrom)
      }
      if (dateTo) {
        query = query.lte('entry_date', dateTo)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      return data as Entry[]
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エントリーの取得に失敗しました'
      setError(message)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 特定の日付のエントリーを取得（自分のエントリーのみ）
  const fetchEntryByDate = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { data, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .eq('user_id', user.id) // 自分のエントリーのみフィルタリング
        .eq('entry_date', date)
        .single()

      if (fetchError) {
        if (fetchError.code === 'PGRST116') {
          // エントリーが存在しない場合
          return null
        }
        throw fetchError
      }

      return data as Entry
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エントリーの取得に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // エントリーを作成
  const createEntry = useCallback(async (formData: EntryFormData) => {
    setLoading(true)
    setError(null)

    try {
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 画像をアップロード（存在する場合）
      let imageUrl: string | null = null
      let imagePath: string | null = null

      if (formData.image) {
        const uploadResult = await uploadImage(user.id, formData.image)
        imageUrl = uploadResult.url
        imagePath = uploadResult.path
      }

      // タグを抽出
      const tags = extractTagsFromTexts(
        formData.thing_one,
        formData.thing_two,
        formData.thing_three,
        formData.gratitude
      )

      console.log('Creating entry with data:', { ...formData, tags, user_id: user.id, image_url: imageUrl })

      const { data, error: createError } = await supabase
        .from('entries')
        .insert({
          user_id: user.id,
          entry_date: formData.entry_date,
          thing_one: formData.thing_one,
          thing_two: formData.thing_two,
          thing_three: formData.thing_three,
          gratitude: formData.gratitude,
          tags,
          image_url: imageUrl,
          image_path: imagePath,
        })
        .select()
        .single()

      if (createError) {
        console.error('Create entry error:', createError)
        // エントリー作成に失敗した場合、アップロードした画像を削除
        if (imagePath) {
          await deleteImage(imagePath)
        }
        throw createError
      }

      console.log('Entry created successfully:', data)
      return data as Entry
    } catch (err) {
      console.error('Exception in createEntry:', err)
      const message = err instanceof Error ? err.message : 'エントリーの作成に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // エントリーを更新
  const updateEntry = useCallback(async (id: string, formData: EntryFormData) => {
    setLoading(true)
    setError(null)

    try {
      // 現在のユーザーを取得
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 新しい画像がアップロードされた場合
      let imageUrl = formData.existing_image_url
      let imagePath = formData.existing_image_path

      if (formData.image) {
        // 古い画像を削除
        if (formData.existing_image_path) {
          await deleteImage(formData.existing_image_path)
        }
        // 新しい画像をアップロード
        const uploadResult = await uploadImage(user.id, formData.image)
        imageUrl = uploadResult.url
        imagePath = uploadResult.path
      }

      // タグを抽出
      const tags = extractTagsFromTexts(
        formData.thing_one,
        formData.thing_two,
        formData.thing_three,
        formData.gratitude
      )

      const { data, error: updateError } = await supabase
        .from('entries')
        .update({
          entry_date: formData.entry_date,
          thing_one: formData.thing_one,
          thing_two: formData.thing_two,
          thing_three: formData.thing_three,
          gratitude: formData.gratitude,
          tags,
          image_url: imageUrl,
          image_path: imagePath,
        })
        .eq('id', id)
        .select()
        .single()

      if (updateError) throw updateError

      return data as Entry
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エントリーの更新に失敗しました'
      setError(message)
      return null
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // エントリーを削除
  const deleteEntry = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)

    try {
      // エントリーを取得して画像パスを確認
      const { data: entry } = await supabase
        .from('entries')
        .select('image_path')
        .eq('id', id)
        .single()

      // エントリーを削除
      const { error: deleteError } = await supabase
        .from('entries')
        .delete()
        .eq('id', id)

      if (deleteError) throw deleteError

      // 画像が存在する場合は削除
      if (entry?.image_path) {
        await deleteImage(entry.image_path)
      }

      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : 'エントリーの削除に失敗しました'
      setError(message)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // パブリックタイムライン取得（全ユーザーのエントリー）
  const fetchPublicTimeline = useCallback(async (limit = 20, offset = 0): Promise<EntryWithSocialData[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 全ユーザーのエントリーを取得
      const { data: entries, error: fetchError } = await supabase
        .from('entries')
        .select('*')
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) throw fetchError
      if (!entries || entries.length === 0) return []

      // ユニークなuser_idを取得
      const userIds = [...new Set(entries.map(e => e.user_id))]

      // プロフィール情報を一括取得
      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .in('id', userIds)

      if (profileError) {
        console.error('Failed to fetch profiles:', profileError)
      }

      // プロフィールをマップに変換
      const profileMap = new Map(profiles?.map(p => [p.id, p]) || [])

      // 各エントリーにプロフィール情報といいね情報を追加
      const entriesWithSocialData = await Promise.all(
        entries.map(async (entry: any) => {
          const [likeCount, userLiked] = await Promise.all([
            // いいね数
            supabase
              .from('likes')
              .select('*', { count: 'exact', head: true })
              .eq('entry_id', entry.id)
              .then(({ count }) => count || 0),
            // ユーザーがいいね済みか
            supabase
              .from('likes')
              .select('id')
              .eq('entry_id', entry.id)
              .eq('user_id', user.id)
              .single()
              .then(({ data }) => !!data)
              .catch(() => false),
          ])

          return {
            ...entry,
            profile: profileMap.get(entry.user_id),
            like_count: likeCount,
            liked_by_user: userLiked,
          } as EntryWithSocialData
        })
      )

      return entriesWithSocialData
    } catch (err) {
      const message = err instanceof Error ? err.message : 'タイムラインの取得に失敗しました'
      setError(message)
      console.error('Failed to fetch public timeline:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    fetchEntries,
    fetchEntryByDate,
    fetchPublicTimeline,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
