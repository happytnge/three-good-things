'use client'

import Button from '@/components/ui/Button'
import { formatDate, getNextMonth, getPrevMonth } from '@/lib/utils/dateUtils'

interface MonthNavigatorProps {
  currentDate: Date
  onMonthChange: (date: Date) => void
}

export default function MonthNavigator({ currentDate, onMonthChange }: MonthNavigatorProps) {
  const handlePrevMonth = () => {
    onMonthChange(getPrevMonth(currentDate))
  }

  const handleNextMonth = () => {
    onMonthChange(getNextMonth(currentDate))
  }

  const handleToday = () => {
    onMonthChange(new Date())
  }

  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-2xl font-bold text-gray-900">
        {formatDate(currentDate, 'yyyy年MM月')}
      </h2>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={handlePrevMonth}>
          前月
        </Button>
        <Button variant="secondary" size="sm" onClick={handleToday}>
          今日
        </Button>
        <Button variant="secondary" size="sm" onClick={handleNextMonth}>
          次月
        </Button>
      </div>
    </div>
  )
}
