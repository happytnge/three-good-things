'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { useProfile } from '@/lib/hooks/useProfile'
import { cn } from '@/lib/utils/cn'
import { User } from 'lucide-react'

const navigation = [
  { name: 'ダッシュボード', href: '/dashboard' },
  { name: 'カレンダー', href: '/dashboard/calendar' },
  { name: 'タイムライン', href: '/dashboard/timeline' },
  { name: '検索', href: '/dashboard/search' },
  { name: 'エクスポート', href: '/dashboard/export' },
]

export default function Header() {
  const pathname = usePathname()
  const { fetchProfile } = useProfile()
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null)

  useEffect(() => {
    loadAvatar()
  }, [pathname]) // パスが変わったらアバターを再読み込み

  const loadAvatar = async () => {
    const profile = await fetchProfile()
    if (profile) {
      setAvatarUrl(profile.avatar_url)
    }
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
              Three Good Things
            </Link>

            <nav className="hidden md:flex gap-2">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    'px-4 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
                    pathname === item.href
                      ? 'bg-blue-700 text-white shadow-sm'
                      : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-inset'
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard/profile"
              className={cn(
                'flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-150',
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
              <span className="hidden sm:inline">プロフィール</span>
            </Link>
          </div>
        </div>

        {/* モバイルナビゲーション */}
        <nav className="md:hidden flex gap-2 pb-4 overflow-x-auto">
          {navigation.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'px-3 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all duration-150',
                pathname === item.href
                  ? 'bg-blue-700 text-white shadow-sm'
                  : 'text-gray-700 hover:bg-blue-50 hover:text-blue-700'
              )}
            >
              {item.name}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  )
}
