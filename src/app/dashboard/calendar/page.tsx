'use client'

import { useState, useEffect } from 'react'
import { useEntries } from '@/lib/hooks/useEntries'
import CalendarView from '@/components/calendar/CalendarView'
import MonthNavigator from '@/components/calendar/MonthNavigator'
import EntryCard from '@/components/entries/EntryCard'
import EntryForm from '@/components/entries/EntryForm'
import Modal from '@/components/ui/Modal'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import EmptyState from '@/components/ui/EmptyState'
import Button from '@/components/ui/Button'
import type { Entry, EntryFormData } from '@/lib/types'
import { formatDate, toLocalDateString } from '@/lib/utils/dateUtils'

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [entries, setEntries] = useState<Entry[]>([])
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [showForm, setShowForm] = useState(false)
  const { fetchEntries, fetchEntryByDate, createEntry, updateEntry, deleteEntry, loading } = useEntries()

  useEffect(() => {
    loadMonthEntries()
  }, [currentDate])

  const loadMonthEntries = async () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = toLocalDateString(new Date(year, month, 1))
    const lastDay = toLocalDateString(new Date(year, month + 1, 0))
    const data = await fetchEntries(firstDay, lastDay)
    setEntries(data)
  }

  const handleDateClick = async (date: Date) => {
    setSelectedDate(date)
    const dateString = toLocalDateString(date)
    const entry = await fetchEntryByDate(dateString)
    setSelectedEntry(entry)
    setShowForm(!entry)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedDate(null)
    setSelectedEntry(null)
    setShowForm(false)
    setIsEditing(false)
  }

  const handleSubmit = async (data: EntryFormData) => {
    if (isEditing && selectedEntry) {
      const updated = await updateEntry(selectedEntry.id, data)
      if (updated) {
        setSelectedEntry(updated)
        setIsEditing(false)
        setShowForm(false)
        await loadMonthEntries()
      }
    } else {
      const created = await createEntry(data)
      if (created) {
        setSelectedEntry(created)
        setShowForm(false)
        await loadMonthEntries()
      }
    }
  }

  const handleEdit = (entry: Entry) => {
    setIsEditing(true)
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    const success = await deleteEntry(id)
    if (success) {
      await loadMonthEntries()
      handleCloseModal()
    }
  }

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <MonthNavigator currentDate={currentDate} onMonthChange={setCurrentDate} />

        {loading && !entries.length ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <CalendarView
            currentDate={currentDate}
            entries={entries}
            onDateClick={handleDateClick}
          />
        )}

      {/* エントリー詳細モーダル */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        title={selectedDate ? formatDate(selectedDate, 'yyyy年MM月dd日 (E)') : ''}
        size="lg"
      >
        {showForm ? (
          <EntryForm
            initialData={isEditing ? selectedEntry || undefined : undefined}
            initialDate={selectedDate ? toLocalDateString(selectedDate) : undefined}
            onSubmit={handleSubmit}
            onCancel={() => {
              setShowForm(false)
              setIsEditing(false)
              if (!selectedEntry) {
                handleCloseModal()
              }
            }}
            submitLabel={isEditing ? '更新' : '作成'}
          />
        ) : selectedEntry ? (
          <EntryCard
            entry={selectedEntry}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <EmptyState
            title="エントリーがありません"
            description="この日の3つの良いことを記録しましょう"
            action={<Button onClick={() => setShowForm(true)}>エントリーを作成</Button>}
          />
        )}
      </Modal>
    </main>
  )
}
