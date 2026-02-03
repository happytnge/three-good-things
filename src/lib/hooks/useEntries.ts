'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Entry, EntryFormData } from '@/lib/types'
import { extractTagsFromTexts } from '@/lib/utils/tagUtils'
import { uploadImage, deleteImage } from '@/lib/utils/imageUtils'

export function useEntries() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // エントリー一覧を取得
  const fetchEntries = useCallback(async (dateFrom?: string, dateTo?: string) => {
    setLoading(true)
    setError(null)

    try {
      let query = supabase
        .from('entries')
        .select('*')
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

  // 特定の日付のエントリーを取得
  const fetchEntryByDate = useCallback(async (date: string) => {
    setLoading(true)
    setError(null)

    try {
      const { data, error: fetchError } = await supabase
        .from('entries')
        .select('*')
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
        formData.thing_three
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
        formData.thing_three
      )

      const { data, error: updateError } = await supabase
        .from('entries')
        .update({
          entry_date: formData.entry_date,
          thing_one: formData.thing_one,
          thing_two: formData.thing_two,
          thing_three: formData.thing_three,
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

  return {
    loading,
    error,
    fetchEntries,
    fetchEntryByDate,
    createEntry,
    updateEntry,
    deleteEntry,
  }
}
