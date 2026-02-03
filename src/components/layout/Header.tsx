'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProfile } from '@/lib/hooks/useProfile'
import { useNotifications } from '@/lib/hooks/useNotifications'
import { cn } from '@/lib/utils/cn'
import { User, LayoutDashboard, Calendar, Clock, Search, Download, Users, Bell } from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard', icon: LayoutDashboard },
  { name: 'カレンダー', href: '/dashboard/calendar', icon: Calendar },
  { name: 'タイムライン', href: '/dashboard/timeline', icon: Clock },
  { name: 'ユーザー発見', href: '/dashboard/discover', icon: Users },
  { name: '検索', href: '/dashboard/search', icon: Search },
  { name: 'エクスポート', href: '/dashboard/export', icon: Download },
]

export default function Header() {
  const pathname = usePathname()
  const { fetchProfile } = useProfile()
  const { fetchUnreadCount } = useNotifications()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    loadAvatar()
    loadNotificationCount()

    // 30秒ごとに通知数を更新
    const interval = setInterval(loadNotificationCount, 30000)
    return () => clearInterval(interval)
  }, [pathname]) // パスが変わったらアバターを再読み込み

  const loadAvatar = async () => {
    const profile = await fetchProfile()
    if (profile) {
      setAvatarUrl(profile.avatar_url)
    }
  }

  const loadNotificationCount = async () => {
    const count = await fetchUnreadCount()
    setUnreadCount(count)
  }

  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-8">
            <Link
              href="/dashboard"
              className="text-2xl font-bold text-gray-900 hover:text-blue-700 transition-colors duration-150"
            >
              Three Good Things +1
            </Link>

            <nav className="hidden md:flex gap-2">
              {navigation.map((item) => {
                const Icon = item.icon
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    title={item.name}
                    className={cn(
                      'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                      pathname === item.href
                        ? 'bg-blue-700 text-white shadow-sm'
                        : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                    )}
                  >
                    <Icon size={20} />
                    <span>{item.name}</span>
                  </Link>
                )
              })}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* 通知ベル */}
            <Link
              href="/dashboard/notifications"
              title="通知"
              className={cn(
                'relative p-2 rounded-lg transition-all duration-150',
                pathname === '/dashboard/notifications'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-inset'
              )}
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 min-w-5 h-5 flex items-center justify-center px-1 text-xs font-bold bg-red-600 text-white rounded-full">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </Link>

            {/* プロフィール */}
            <Link
              href="/dashboard/profile"
              title="プロフィール"
              className={cn(
                'p-2 rounded-lg transition-all duration-150',
                pathname === '/dashboard/profile'
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-inset'
              )}
            >
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt="プロフィール"
                  className="w-8 h-8 rounded-full object-cover border-2 border-current"
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center border-2 border-current">
                  <User size={16} />
                </div>
              )}
            </Link>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        <nav className="md:hidden flex gap-2 pb-4 overflow-x-auto">
          {navigation.map((item) => {
            const Icon = item.icon
            return (
              <Link
                key={item.name}
                href={item.href}
                title={item.name}
                className={cn(
                  'p-2.5 rounded-lg transition-all duration-150',
                  pathname === item.href
                    ? 'bg-blue-700 text-white shadow-sm'
                    : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
                )}
              >
                <Icon size={20} />
              </Link>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
