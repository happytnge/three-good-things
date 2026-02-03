'use client'

import { useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Notification } from '@/lib/types'

export function useNotifications() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // 通知一覧を取得
  const fetchNotifications = useCallback(async (limit = 20, offset = 0): Promise<Notification[]> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      // 通知を取得
      const { data: notifications, error: fetchError } = await supabase
        .from('notifications')
        .select('*')
        .eq('recipient_id', user.id)
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1)

      if (fetchError) throw fetchError
      if (!notifications || notifications.length === 0) return []

      // ユニークなactor_idとentry_idを取得
      const actorIds = [...new Set(notifications.map(n => n.actor_id))]
      const entryIds = [...new Set(notifications.filter(n => n.entry_id).map(n => n.entry_id!))]

      // プロフィールとエントリーを一括取得
      const [profilesResult, entriesResult] = await Promise.all([
        supabase.from('profiles').select('*').in('id', actorIds),
        entryIds.length > 0
          ? supabase.from('entries').select('*').in('id', entryIds)
          : Promise.resolve({ data: [] })
      ])

      // マップに変換
      const profileMap = new Map(profilesResult.data?.map(p => [p.id, p]) || [])
      const entryMap = new Map(entriesResult.data?.map(e => [e.id, e]) || [])

      // 通知にプロフィールとエントリー情報を追加
      const notificationsWithData = notifications.map(notification => ({
        ...notification,
        actor: profileMap.get(notification.actor_id),
        entry: notification.entry_id ? entryMap.get(notification.entry_id) : undefined,
      })) as Notification[]

      return notificationsWithData
    } catch (err) {
      const message = err instanceof Error ? err.message : '通知の取得に失敗しました'
      setError(message)
      console.error('Failed to fetch notifications:', err)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // 未読通知数を取得
  const fetchUnreadCount = useCallback(async (): Promise<number> => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return 0

      const { count, error: fetchError } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      if (fetchError) throw fetchError
      return count || 0
    } catch (err) {
      console.error('Failed to fetch unread count:', err)
      return 0
    }
  }, [supabase])

  // 通知を既読にする
  const markAsRead = useCallback(async (notificationId: string): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)
        .eq('recipient_id', user.id)

      if (updateError) throw updateError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : '既読化に失敗しました'
      setError(message)
      console.error('Failed to mark as read:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // すべての通知を既読にする
  const markAllAsRead = useCallback(async (): Promise<boolean> => {
    setLoading(true)
    setError(null)

    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('ユーザーが認証されていません')
      }

      const { error: updateError } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('recipient_id', user.id)
        .eq('read', false)

      if (updateError) throw updateError
      return true
    } catch (err) {
      const message = err instanceof Error ? err.message : '全既読化に失敗しました'
      setError(message)
      console.error('Failed to mark all as read:', err)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  return {
    loading,
    error,
    fetchNotifications,
    fetchUnreadCount,
    markAsRead,
    markAllAsRead,
  }
}
