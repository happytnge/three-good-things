'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import { useUsers } from '@/lib/hooks/useUsers'
import { useFollows } from '@/lib/hooks/useFollows'
import UserSearchBar from '@/components/social/UserSearchBar'
import FollowButton from '@/components/social/FollowButton'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Profile } from '@/lib/types'

export default function DiscoverPage() {
  const [suggestedUsers, setSuggestedUsers] = useState<Profile[]>([])
  const [followingStates, setFollowingStates] = useState<Record<string, boolean>>({})

  const { fetchSuggestedUsers, loading } = useUsers()
  const { checkIsFollowing } = useFollows()

  useEffect(() => {
    loadSuggestedUsers()
  }, [])

  const loadSuggestedUsers = async () => {
    const users = await fetchSuggestedUsers(20)
    setSuggestedUsers(users)

    // 各ユーザーのフォロー状態を取得
    const states: Record<string, boolean> = {}
    await Promise.all(
      users.map(async (user) => {
        states[user.id] = await checkIsFollowing(user.id)
      })
    )
    setFollowingStates(states)
  }

  const handleFollowChange = (userId: string, following: boolean) => {
    setFollowingStates((prev) => ({
      ...prev,
      [userId]: following,
    }))
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">
        ユーザーを発見
      </h1>

      {/* ユーザー検索バー */}
      <div className="mb-8">
        <UserSearchBar />
      </div>

      {/* おすすめユーザー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          おすすめのユーザー
        </h2>

        {loading && suggestedUsers.length === 0 ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner />
          </div>
        ) : suggestedUsers.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-8 text-center text-gray-500">
            おすすめのユーザーがいません
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {suggestedUsers.map((user) => (
              <div
                key={user.id}
                className="bg-white rounded-lg shadow-md border border-gray-300 p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start gap-4">
                  {/* アバター */}
                  <Link
                    href={`/dashboard/users/${user.id}`}
                    className="flex-shrink-0 hover:opacity-80 transition-opacity"
                  >
                    {user.avatar_url ? (
                      <img
                        src={user.avatar_url}
                        alt={user.display_name || user.email}
                        className="w-16 h-16 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center">
                        <User size={32} className="text-gray-400" />
                      </div>
                    )}
                  </Link>

                  {/* ユーザー情報 */}
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/dashboard/users/${user.id}`}
                      className="block hover:text-blue-700 transition-colors"
                    >
                      <h3 className="font-bold text-gray-900 truncate">
                        {user.display_name || user.email}
                      </h3>
                      {user.display_name && (
                        <p className="text-sm text-gray-500 truncate">
                          {user.email}
                        </p>
                      )}
                    </Link>

                    {/* フォローボタン */}
                    <div className="mt-3">
                      <FollowButton
                        userId={user.id}
                        initialFollowing={followingStates[user.id] || false}
                        size="sm"
                        onFollowChange={(following) =>
                          handleFollowChange(user.id, following)
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
