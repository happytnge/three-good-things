'use client'

import { useState, useEffect } from 'react'
import { Heart, UserPlus } from 'lucide-react'
import Link from 'next/link'
import { useNotifications } from '@/lib/hooks/useNotifications'
import type { Notification } from '@/lib/types'
import { cn } from '@/lib/utils/cn'

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { fetchNotifications, markAsRead, markAllAsRead, loading } = useNotifications()

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    const data = await fetchNotifications(50, 0)
    setNotifications(data)
  }

  const handleMarkAsRead = async (notificationId: string) => {
    const success = await markAsRead(notificationId)
    if (success) {
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
    }
  }

  const handleMarkAllAsRead = async () => {
    const success = await markAllAsRead()
    if (success) {
      setNotifications((prev) =>
        prev.map((n) => ({ ...n, read: true }))
      )
    }
  }

  const formatRelativeTime = (dateString: string): string => {
    const now = new Date()
    const date = new Date(dateString)
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (diffInSeconds < 60) return `${diffInSeconds}秒前`
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}分前`
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}時間前`
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}日前`
    return date.toLocaleDateString('ja-JP')
  }

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading && notifications.length === 0) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-700"></div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* ヘッダー */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">
          通知
          {unreadCount > 0 && (
            <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-red-100 text-red-800 rounded-full">
              {unreadCount}
            </span>
          )}
        </h2>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllAsRead}
            className="text-sm text-blue-700 hover:text-blue-800 font-medium"
          >
            すべて既読にする
          </button>
        )}
      </div>

      {/* 通知一覧 */}
      {notifications.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          通知はありません
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              onClick={() => !notification.read && handleMarkAsRead(notification.id)}
              className={cn(
                'flex items-start gap-3 p-4 rounded-lg transition-all cursor-pointer',
                notification.read
                  ? 'bg-white hover:bg-gray-50'
                  : 'bg-blue-50 hover:bg-blue-100'
              )}
            >
              {/* アイコン */}
              <div
                className={cn(
                  'flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center',
                  notification.type === 'like'
                    ? 'bg-red-100 text-red-600'
                    : 'bg-blue-100 text-blue-600'
                )}
              >
                {notification.type === 'like' ? (
                  <Heart className="w-5 h-5 fill-current" />
                ) : (
                  <UserPlus className="w-5 h-5" />
                )}
              </div>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  {notification.actor?.avatar_url ? (
                    <img
                      src={notification.actor.avatar_url}
                      alt={notification.actor.display_name || 'ユーザー'}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-gray-200" />
                  )}
                  <Link
                    href={`/dashboard/users/${notification.actor_id}`}
                    className="font-semibold text-gray-900 hover:text-blue-700"
                  >
                    {notification.actor?.display_name || 'ユーザー'}
                  </Link>
                </div>

                <p className="text-sm text-gray-600 mt-1">
                  {notification.type === 'like'
                    ? 'があなたのエントリーにいいねしました'
                    : 'があなたをフォローしました'}
                </p>

                {notification.entry && notification.type === 'like' && (
                  <Link
                    href={`/dashboard?date=${notification.entry.entry_date}`}
                    className="text-xs text-gray-500 hover:text-blue-700 mt-1 block truncate"
                  >
                    {notification.entry.thing_one}
                  </Link>
                )}

                <p className="text-xs text-gray-400 mt-1">
                  {formatRelativeTime(notification.created_at)}
                </p>
              </div>

              {/* 未読マーク */}
              {!notification.read && (
                <div className="flex-shrink-0 w-2 h-2 bg-blue-600 rounded-full"></div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
