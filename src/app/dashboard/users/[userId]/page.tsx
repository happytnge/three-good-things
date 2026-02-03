'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { User, Calendar, Heart } from 'lucide-react'
import { useProfile } from '@/lib/hooks/useProfile'
import { useFollows } from '@/lib/hooks/useFollows'
import { useAuth } from '@/lib/hooks/useAuth'
import FollowButton from '@/components/social/FollowButton'
import EntryCard from '@/components/entries/EntryCard'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { ProfileWithStats, Entry } from '@/lib/types'

export default function UserProfilePage() {
  const params = useParams()
  const router = useRouter()
  const userId = params.userId as string

  const [profile, setProfile] = useState<ProfileWithStats | null>(null)
  const [entries, setEntries] = useState<Entry[]>([])
  const [isFollowing, setIsFollowing] = useState(false)
  const [followerCount, setFollowerCount] = useState(0)

  const { fetchPublicProfile, fetchUserEntries, loading: profileLoading } = useProfile()
  const { checkIsFollowing, fetchFollowerCount } = useFollows()
  const { user } = useAuth()

  const isOwnProfile = user?.id === userId

  useEffect(() => {
    loadProfileData()
  }, [userId])

  const loadProfileData = async () => {
    // プロフィールとエントリーを取得
    const [profileData, entriesData] = await Promise.all([
      fetchPublicProfile(userId),
      fetchUserEntries(userId, 10),
    ])

    if (profileData) {
      setProfile(profileData)
      setFollowerCount(profileData.follower_count || 0)
    }

    setEntries(entriesData)

    // 自分以外のプロフィールの場合、フォロー状態を取得
    if (!isOwnProfile) {
      const following = await checkIsFollowing(userId)
      setIsFollowing(following)
    }
  }

  const handleFollowChange = async (following: boolean) => {
    setIsFollowing(following)
    // フォロワー数を更新
    const count = await fetchFollowerCount(userId)
    setFollowerCount(count)
  }

  if (profileLoading && !profile) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner />
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            ユーザーが見つかりません
          </h2>
          <p className="text-gray-600">
            指定されたユーザーは存在しないか、削除されました
          </p>
        </div>
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* プロフィールヘッダー */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-8 mb-8">
        <div className="flex items-start gap-6">
          {/* アバター */}
          {profile.avatar_url ? (
            <img
              src={profile.avatar_url}
              alt={profile.display_name || profile.email}
              className="w-24 h-24 rounded-full object-cover border-4 border-gray-200"
            />
          ) : (
            <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center border-4 border-gray-200">
              <User size={48} className="text-gray-400" />
            </div>
          )}

          {/* プロフィール情報 */}
          <div className="flex-1">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {profile.display_name || profile.email}
                </h1>
                {profile.display_name && (
                  <p className="text-gray-600">{profile.email}</p>
                )}
              </div>

              {/* フォローボタン */}
              {!isOwnProfile && (
                <FollowButton
                  userId={userId}
                  initialFollowing={isFollowing}
                  size="md"
                  onFollowChange={handleFollowChange}
                />
              )}

              {/* 自分のプロフィールの場合は編集リンク */}
              {isOwnProfile && (
                <button
                  onClick={() => router.push('/dashboard/profile')}
                  className="px-4 py-2 text-sm font-semibold text-blue-700 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                >
                  プロフィールを編集
                </button>
              )}
            </div>

            {/* 統計 */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2 text-gray-600">
                <Calendar size={18} />
                <span className="text-sm">
                  <strong className="text-gray-900">{profile.entry_count || 0}</strong> エントリー
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <User size={18} />
                <span className="text-sm">
                  <strong className="text-gray-900">{followerCount}</strong> フォロワー
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <Heart size={18} />
                <span className="text-sm">
                  <strong className="text-gray-900">{profile.following_count || 0}</strong> フォロー中
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 最近のエントリー */}
      <div>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          最近のエントリー
        </h2>

        {entries.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-8 text-center text-gray-500">
            まだエントリーがありません
          </div>
        ) : (
          <div className="space-y-4">
            {entries.map((entry) => (
              <EntryCard
                key={entry.id}
                entry={entry}
                showActions={isOwnProfile}
                showAuthor={false}
                showSocial={false}
              />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
