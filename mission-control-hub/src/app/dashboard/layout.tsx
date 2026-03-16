import { auth } from '@/lib/auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import NextImage from 'next/image'

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await auth()

  if (!session?.user) {
    redirect('/api/auth/signin')
  }

  return (
    <div className="flex h-screen">
      {/* Sidebar */}
      <aside className="w-64 bg-surface-900 border-r border-surface-800 flex flex-col">
        <div className="p-4 border-b border-surface-800">
          <h1 className="text-lg font-bold font-[family-name:var(--font-heading)] text-volt-400">
            Mission Control
          </h1>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          <Link
            href="/dashboard"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>🏠</span>
            <span>Overview</span>
          </Link>
          <Link
            href="/dashboard/spaces"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>📂</span>
            <span>Spaces</span>
          </Link>
          <Link
            href="/dashboard/board"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>📋</span>
            <span>Board</span>
          </Link>
          <Link
            href="/dashboard/agents"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>🤖</span>
            <span>Agents</span>
          </Link>
          <Link
            href="/dashboard/analytics"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>📊</span>
            <span>Analytics</span>
          </Link>
          <Link
            href="/dashboard/costs"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>💰</span>
            <span>Costs</span>
          </Link>
          <Link
            href="/dashboard/activity"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>📜</span>
            <span>Activity</span>
          </Link>
          <Link
            href="/dashboard/teams"
            className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-surface-800 transition-colors"
          >
            <span>👥</span>
            <span>Teams</span>
          </Link>
        </nav>

        {/* User */}
        <div className="p-4 border-t border-surface-800">
          <div className="flex items-center gap-3">
            {session.user.image && (
              <NextImage
                src={session.user.image}
                alt=""
                width={32}
                height={32}
                className="w-8 h-8 rounded-full"
              />
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{session.user.name}</p>
              <p className="text-xs text-muted truncate">{session.user.email}</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  )
}
