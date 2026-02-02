'use client'

import { cn } from '@/lib/utils/cn'
import { formatDate, isToday, isSameMonthAs } from '@/lib/utils/dateUtils'

interface CalendarDayProps {
  date: Date
  currentMonth: Date
  hasEntry: boolean
  onClick: (date: Date) => void
}

export default function CalendarDay({ date, currentMonth, hasEntry, onClick }: CalendarDayProps) {
  const isCurrentMonth = isSameMonthAs(date, currentMonth)
  const isTodayDate = isToday(date)

  return (
    <button
      onClick={() => onClick(date)}
      className={cn(
        'aspect-square p-2 rounded-lg transition-all relative',
        'hover:bg-gray-100',
        'focus:outline-none focus:ring-2 focus:ring-blue-500',
        !isCurrentMonth && 'text-gray-400',
        isTodayDate && 'bg-blue-50 font-semibold',
        hasEntry && 'border-2 border-blue-500'
      )}
    >
      <div className="flex flex-col items-center justify-center h-full">
        <span className={cn(
          'text-sm',
          isTodayDate && 'text-blue-600'
        )}>
          {formatDate(date, 'd')}
        </span>
        {hasEntry && (
          <div className="absolute bottom-1 w-1.5 h-1.5 rounded-full bg-blue-600" />
        )}
      </div>
    </button>
  )
}
