import AuthGuard from '@/components/auth/AuthGuard'
import Header from '@/components/layout/Header'

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AuthGuard>
      <div className="min-h-screen bg-white">
        <Header />
        {children}
      </div>
    </AuthGuard>
  )
}
