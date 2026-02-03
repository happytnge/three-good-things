'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/lib/hooks/useAuth'
import { useProfile } from '@/lib/hooks/useProfile'
import { useEntries } from '@/lib/hooks/useEntries'
import Card from '@/components/ui/Card'
import Input from '@/components/ui/Input'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { formatDate } from '@/lib/utils/dateUtils'
import { User, Mail, Calendar, FileText } from 'lucide-react'

export default function ProfilePage() {
  const { user, signOut } = useAuth()
  const { fetchProfile, updateProfile, loading: profileLoading } = useProfile()
  const { fetchEntries } = useEntries()
  const router = useRouter()

  const [displayName, setDisplayName] = useState('')
  const [email, setEmail] = useState('')
  const [createdAt, setCreatedAt] = useState('')
  const [totalEntries, setTotalEntries] = useState(0)
  const [isEditing, setIsEditing] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  useEffect(() => {
    loadProfile()
    loadStats()
  }, [])

  const loadProfile = async () => {
    const profile = await fetchProfile()
    if (profile) {
      setDisplayName(profile.display_name || '')
      setEmail(profile.email)
      setCreatedAt(profile.created_at)
    }
  }

  const loadStats = async () => {
    const entries = await fetchEntries()
    setTotalEntries(entries.length)
  }

  const handleSave = async () => {
    setMessage(null)

    if (!displayName.trim()) {
      setMessage({ type: 'error', text: '表示名を入力してください' })
      return
    }

    const updated = await updateProfile({ display_name: displayName })

    if (updated) {
      setMessage({ type: 'success', text: 'プロフィールを更新しました' })
      setIsEditing(false)
    } else {
      setMessage({ type: 'error', text: 'プロフィールの更新に失敗しました' })
    }
  }

  const handleSignOut = async () => {
    await signOut()
    router.push('/')
  }

  if (!user) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">プロフィール</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-700'
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* プロフィール情報 */}
        <div className="lg:col-span-2">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">基本情報</h2>

            <div className="space-y-6">
              {/* 表示名 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <User size={16} />
                  表示名
                </label>
                {isEditing ? (
                  <Input
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                    placeholder="表示名を入力"
                  />
                ) : (
                  <p className="text-gray-900 text-lg">{displayName || '未設定'}</p>
                )}
              </div>

              {/* メールアドレス */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Mail size={16} />
                  メールアドレス
                </label>
                <p className="text-gray-700">{email}</p>
              </div>

              {/* 登録日 */}
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <Calendar size={16} />
                  登録日
                </label>
                <p className="text-gray-700">
                  {createdAt ? formatDate(createdAt, 'yyyy年MM月dd日') : '読み込み中...'}
                </p>
              </div>

              {/* アクションボタン */}
              <div className="flex gap-3 pt-4">
                {isEditing ? (
                  <>
                    <Button onClick={handleSave} disabled={profileLoading}>
                      {profileLoading ? '保存中...' : '保存'}
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={() => {
                        setIsEditing(false)
                        loadProfile() // 変更をリセット
                      }}
                    >
                      キャンセル
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>編集</Button>
                )}
              </div>
            </div>
          </Card>
        </div>

        {/* 統計情報 */}
        <div className="space-y-6">
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-6">統計</h2>

            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <FileText className="text-blue-600" size={24} />
                </div>
                <div>
                  <p className="text-sm text-gray-700">総エントリー数</p>
                  <p className="text-2xl font-bold text-gray-900">{totalEntries}</p>
                </div>
              </div>
            </div>
          </Card>

          {/* ログアウト */}
          <Card>
            <h2 className="text-xl font-semibold text-gray-900 mb-4">アカウント</h2>
            <Button variant="danger" onClick={handleSignOut} className="w-full">
              ログアウト
            </Button>
          </Card>
        </div>
      </div>
    </main>
  )
}
