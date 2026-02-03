'use client'

import { cn } from '@/lib/utils/cn'
import { formatDate, isToday, isSameMonthAs } from '@/lib/utils/dateUtils'
import type { Entry } from '@/lib/types'

interface CalendarDayProps {
  date: Date
  currentMonth: Date
  entry?: Entry
  onClick: (date: Date) => void
}

export default function CalendarDay({ date, currentMonth, entry, onClick }: CalendarDayProps) {
  const isCurrentMonth = isSameMonthAs(date, currentMonth)
  const isTodayDate = isToday(date)
  const hasEntry = !!entry
  const hasImage = entry?.image_url

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        'aspect-square p-2 rounded-lg transition-all relative overflow-hidden',
        'hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        !isCurrentMonth && 'text-gray-400',
        isTodayDate && 'bg-blue-50 font-semibold',
        hasEntry && 'border-2 border-blue-500'
      )}
    >
      {/* 背景画像（サムネイル） */}
      {hasImage && entry.image_url && (
        <div className="absolute inset-0 opacity-30">
          <img
            src={entry.image_url}
            alt="エントリー画像"
            className="w-full h-full object-cover"
          />
        </div>
      )}

      {/* 日付と画像アイコン */}
      <div className="relative flex flex-col items-center justify-center h-full">
        <span className={cn(
          'text-sm font-semibold',
          isTodayDate && 'text-blue-600',
          hasImage && 'bg-white/90 px-1.5 py-0.5 rounded'
        )}>
          {formatDate(date, 'd')}
        </span>

        {/* 画像サムネイル（小さいアイコン表示） */}
        {hasImage && entry.image_url && (
          <div className="mt-1 w-8 h-8 rounded border-2 border-white shadow-sm overflow-hidden">
            <img
              src={entry.image_url}
              alt="サムネイル"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* エントリーがあるが画像がない場合は点を表示 */}
        {hasEntry && !hasImage && (
          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
        )}
      </div>
    </button>
  )
}
