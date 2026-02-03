'use client'

import NotificationList from '@/components/social/NotificationList'

export default function NotificationsPage() {
  return (
    <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white rounded-2xl shadow-md border border-gray-300 p-6">
        <NotificationList />
      </div>
    </main>
  )
}
