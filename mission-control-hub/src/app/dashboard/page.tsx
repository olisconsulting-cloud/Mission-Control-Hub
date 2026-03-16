import { auth } from '@/lib/auth'
import { CardSkeleton } from '@/components/ui/Skeleton'
import { Suspense } from 'react'

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-16 w-2/3 rounded bg-surface-800 animate-pulse" />
      <div className="grid grid-cols-3 gap-6">
        <CardSkeleton />
        <CardSkeleton />
        <CardSkeleton />
      </div>
    </div>
  )
}

async function DashboardContent() {
  const session = await auth()
  const userName = session?.user?.name || 'Commander'
  const greeting = getGreeting()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
          {greeting}, <span className="text-volt-400">{userName}</span>
        </h1>
        <p className="text-muted mt-2">Here&apos;s your mission overview.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 hover:border-volt-500 transition-colors">
          <div className="text-3xl mb-2">📂</div>
          <h3 className="text-lg font-semibold">Spaces</h3>
          <p className="text-muted text-sm mt-1">Organize your projects</p>
        </div>
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 hover:border-volt-500 transition-colors">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-lg font-semibold">Missions</h3>
          <p className="text-muted text-sm mt-1">Track tasks & progress</p>
        </div>
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800 hover:border-volt-500 transition-colors">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="text-lg font-semibold">Agents</h3>
          <p className="text-muted text-sm mt-1">AI-powered automation</p>
        </div>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  return (
    <Suspense fallback={<DashboardSkeleton />}>
      <DashboardContent />
    </Suspense>
  )
}
