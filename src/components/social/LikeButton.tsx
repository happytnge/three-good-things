'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { useLikes } from '@/lib/hooks/useLikes'
import { cn } from '@/lib/utils/cn'

interface LikeButtonProps {
  entryId: string
  initialLiked?: boolean
  initialCount?: number
  size?: 'sm' | 'md' | 'lg'
  showCount?: boolean
  onLikeChange?: (liked: boolean, newCount: number) => void
}

export default function LikeButton({
  entryId,
  initialLiked = false,
  initialCount = 0,
  size = 'md',
  showCount = true,
  onLikeChange,
}: LikeButtonProps) {
  const [liked, setLiked] = useState(initialLiked)
  const [count, setCount] = useState(initialCount)
  const [isAnimating, setIsAnimating] = useState(false)
  const { toggleLike, loading } = useLikes()

  useEffect(() => {
    setLiked(initialLiked)
    setCount(initialCount)
  }, [initialLiked, initialCount])

  const handleClick = async () => {
    if (loading) return

    // 楽観的UI更新
    const newLiked = !liked
    const newCount = newLiked ? count + 1 : count - 1

    setLiked(newLiked)
    setCount(newCount)
    setIsAnimating(true)

    // アニメーション終了
    setTimeout(() => setIsAnimating(false), 300)

    // サーバーに反映
    const result = await toggleLike(entryId, liked)

    if (!result.success) {
      // 失敗時はロールバック
      setLiked(liked)
      setCount(count)
    } else {
      // 成功時は正確な値を設定
      setLiked(result.newLikedState)
      setCount(result.newCount)
      onLikeChange?.(result.newLikedState, result.newCount)
    }
  }

  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-5 h-5',
    lg: 'w-6 h-6',
  }

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className={cn(
        'flex items-center gap-1.5 transition-all duration-150',
        'hover:scale-105 active:scale-95',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        isAnimating && 'animate-pulse'
      )}
      title={liked ? 'いいねを取り消す' : 'いいね'}
    >
      <Heart
        className={cn(
          sizeClasses[size],
          'transition-all duration-200',
          liked
            ? 'fill-red-500 text-red-500'
            : 'text-gray-400 hover:text-red-400'
        )}
      />
      {showCount && (
        <span
          className={cn(
            textSizeClasses[size],
            'font-medium',
            liked ? 'text-red-500' : 'text-gray-600'
          )}
        >
          {count}
        </span>
      )}
    </button>
  )
}
