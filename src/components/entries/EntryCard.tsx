'use client'

import { useState } from 'react'
import Link from 'next/link'
import { User } from 'lucide-react'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import LikeButton from '@/components/social/LikeButton'
import type { Entry, EntryWithSocialData } from '@/lib/types'
import { formatDate } from '@/lib/utils/dateUtils'

interface EntryCardProps {
  entry: EntryWithSocialData
  onEdit?: (entry: Entry) => void
  onDelete?: (id: string) => void
  showActions?: boolean
  showAuthor?: boolean
  showSocial?: boolean
}

export default function EntryCard({
  entry,
  onEdit,
  onDelete,
  showActions = true,
  showAuthor = false,
  showSocial = false,
}: EntryCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = () => {
    if (onDelete) {
      onDelete(entry.id)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <Card>
      {/* 著者情報 */}
      {showAuthor && entry.profile && (
        <div className="flex items-center gap-3 mb-4 pb-4 border-b border-gray-200">
          <Link
            href={`/dashboard/users/${entry.user_id}`}
            className="flex items-center gap-3 hover:opacity-80 transition-opacity"
          >
            {entry.profile.avatar_url ? (
              <img
                src={entry.profile.avatar_url}
                alt={entry.profile.display_name || entry.profile.email}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                <User size={20} className="text-gray-500" />
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {entry.profile.display_name || entry.profile.email}
              </p>
              {entry.profile.display_name && (
                <p className="text-sm text-gray-500">{entry.profile.email}</p>
              )}
            </div>
          </Link>
        </div>
      )}

      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            {formatDate(entry.entry_date, 'yyyy年MM月dd日 (E)')}
          </h3>
          {entry.tags.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {entry.tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 text-xs font-semibold bg-white text-blue-700 border border-blue-700 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
        {showActions && (
          <div className="flex gap-2">
            {onEdit && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => onEdit(entry)}
              >
                編集
              </Button>
            )}
            {onDelete && !showDeleteConfirm && (
              <Button
                size="sm"
                variant="danger"
                onClick={() => setShowDeleteConfirm(true)}
              >
                削除
              </Button>
            )}
          </div>
        )}
      </div>

      {showDeleteConfirm && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-600 mb-3">
            このエントリーを削除しますか？
          </p>
          <div className="flex gap-2">
            <Button size="sm" variant="danger" onClick={handleDelete}>
              削除する
            </Button>
            <Button
              size="sm"
              variant="secondary"
              onClick={() => setShowDeleteConfirm(false)}
            >
              キャンセル
            </Button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              1
            </span>
            <p className="text-gray-700 flex-1">
              {entry.thing_one}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              2
            </span>
            <p className="text-gray-700 flex-1">
              {entry.thing_two}
            </p>
          </div>
        </div>

        <div>
          <div className="flex items-start gap-3">
            <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
              3
            </span>
            <p className="text-gray-700 flex-1">
              {entry.thing_three}
            </p>
          </div>
        </div>

        {/* 感謝 (+1) */}
        {entry.gratitude && (
          <div className="pt-4 mt-4 border-t border-gray-200">
            <div className="flex items-start gap-3">
              <span className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-green-100 text-green-700 rounded-full text-sm font-semibold">
                +1
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-gray-900 mb-1">今日の感謝</p>
                <p className="text-gray-700">
                  {entry.gratitude}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 画像表示 */}
      {entry.image_url && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <img
            src={entry.image_url}
            alt="今日のイメージ"
            className="max-w-full rounded-lg border border-gray-300"
          />
        </div>
      )}

      {/* ソーシャル機能 */}
      {showSocial && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <LikeButton
            entryId={entry.id}
            initialLiked={entry.liked_by_user}
            initialCount={entry.like_count}
            size="md"
            showCount={true}
          />
        </div>
      )}
    </Card>
  )
}
