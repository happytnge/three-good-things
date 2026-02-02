import {
  format,
  isToday as isTodayFn,
  parseISO,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay
} from 'date-fns'
import { ja } from 'date-fns/locale'

/**
 * 日付を指定されたフォーマットでフォーマット
 */
export function formatDate(date: Date | string, formatStr: string = 'yyyy-MM-dd'): string {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return format(dateObj, formatStr, { locale: ja })
}

/**
 * 日付が今日かどうかをチェック
 */
export function isToday(date: Date | string): boolean {
  const dateObj = typeof date === 'string' ? parseISO(date) : date
  return isTodayFn(dateObj)
}

/**
 * 指定された年月の全日付を取得
 */
export function getMonthDays(year: number, month: number): Date[] {
  const start = startOfMonth(new Date(year, month))
  const end = endOfMonth(new Date(year, month))
  return eachDayOfInterval({ start, end })
}

/**
 * カレンダーグリッド用の日付配列を取得（前月・次月の日付を含む）
 */
export function getCalendarDays(year: number, month: number): Date[] {
  const firstDay = startOfMonth(new Date(year, month))
  const lastDay = endOfMonth(new Date(year, month))
  const start = startOfWeek(firstDay, { weekStartsOn: 0 }) // 日曜始まり
  const end = endOfWeek(lastDay, { weekStartsOn: 0 })
  return eachDayOfInterval({ start, end })
}

/**
 * 今日の日付をYYYY-MM-DD形式で取得
 */
export function getTodayString(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

/**
 * ISO日付文字列をパース
 */
export function parseISODate(dateString: string): Date {
  return parseISO(dateString)
}

/**
 * 次の月を取得
 */
export function getNextMonth(date: Date): Date {
  return addMonths(date, 1)
}

/**
 * 前の月を取得
 */
export function getPrevMonth(date: Date): Date {
  return subMonths(date, 1)
}

/**
 * 2つの日付が同じ月かチェック
 */
export function isSameMonthAs(date1: Date, date2: Date): boolean {
  return isSameMonth(date1, date2)
}

/**
 * 2つの日付が同じ日かチェック
 */
export function isSameDayAs(date1: Date | string, date2: Date | string): boolean {
  const d1 = typeof date1 === 'string' ? parseISO(date1) : date1
  const d2 = typeof date2 === 'string' ? parseISO(date2) : date2
  return isSameDay(d1, d2)
}
