'use client'

import { useState, useEffect } from 'react'
import { UserPlus, UserMinus } from 'lucide-react'
import { useFollows } from '@/lib/hooks/useFollows'
import { cn } from '@/lib/utils/cn'

interface FollowButtonProps {
  userId: string
  initialFollowing?: boolean
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  onFollowChange?: (following: boolean) => void
}

export default function FollowButton({
  userId,
  initialFollowing = false,
  size = 'md',
  showIcon = true,
  onFollowChange,
}: FollowButtonProps) {
  const [following, setFollowing] = useState(initialFollowing)
  const { toggleFollow, loading } = useFollows()

  useEffect(() => {
    setFollowing(initialFollowing)
  }, [initialFollowing])

  const handleClick = async () => {
    if (loading) return

    // 楽観的UI更新
    const newFollowing = !following
    setFollowing(newFollowing)

    // サーバーに反映
    const result = await toggleFollow(userId, following)

    if (!result.success) {
      // 失敗時はロールバック
      setFollowing(following)
    } else {
      // 成功時はコールバック呼び出し
      setFollowing(result.newFollowingState)
      onFollowChange?.(result.newFollowingState)
    }
  }

  const sizeClasses = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  }

  const iconSizeClasses = {
    sm: 'w-3.5 h-3.5',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const Icon = following ? UserMinus : UserPlus

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center gap-2 font-semibold rounded-lg transition-all duration-150',
        sizeClasses[size],
        following
          ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          : 'bg-blue-700 text-white hover:bg-blue-800',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        'focus:ring-2 focus:ring-blue-500 focus:ring-offset-2'
      )}
    >
      {showIcon && <Icon className={iconSizeClasses[size]} />}
      <span>{following ? 'フォロー中' : 'フォロー'}</span>
    </button>
  )
}
