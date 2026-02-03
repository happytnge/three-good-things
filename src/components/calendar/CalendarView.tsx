'use client'

import { useMemo } from 'react'
import CalendarDay from './CalendarDay'
import { getCalendarDays, toLocalDateString } from '@/lib/utils/dateUtils'
import type { Entry } from '@/lib/types'

interface CalendarViewProps {
  currentDate: Date
  entries: Entry[]
  onDateClick: (date: Date) => void
}

const WEEKDAYS = ['日', '月', '火', '水', '木', '金', '土']

export default function CalendarView({ currentDate, entries, onDateClick }: CalendarViewProps) {
  const calendarDays = useMemo(() => {
    return getCalendarDays(currentDate.getFullYear(), currentDate.getMonth())
  }, [currentDate])

  const entryMap = useMemo(() => {
    const map = new Map<string, Entry>()
    entries.forEach(entry => {
      map.set(entry.entry_date, entry)
    })
    return map
  }, [entries])

  const getEntry = (date: Date): Entry | undefined => {
    const dateString = toLocalDateString(date)
    return entryMap.get(dateString)
  }

  return (
    <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6">
      {/* 曜日ヘッダー */}
      <div className="grid grid-cols-7 gap-2 mb-2">
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={cn(
              'text-center text-sm font-semibold py-2',
              index === 0 ? 'text-red-600' : 'text-gray-700',
              index === 6 && 'text-blue-600'
            )}
          >
            {day}
          </div>
        ))}
      </div>

      {/* カレンダーグリッド */}
      <div className="grid grid-cols-7 gap-2">
        {calendarDays.map((date, index) => {
          const entry = getEntry(date)
          return (
            <CalendarDay
              key={index}
              date={date}
              currentMonth={currentDate}
              entry={entry}
              onClick={onDateClick}
            />
          )
        })}
      </div>
    </div>
  )
}

// cn関数のインライン定義（インポート漏れ対策）
function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ')
}
