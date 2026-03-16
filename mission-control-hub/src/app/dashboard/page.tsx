import { auth } from '@/lib/auth'

export default async function DashboardPage() {
  const session = await auth()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-[family-name:var(--font-heading)]">
          Welcome back, <span className="text-volt-400">{session?.user?.name || 'Commander'}</span>
        </h1>
        <p className="text-muted mt-2">Here&apos;s your mission overview.</p>
      </div>

      <div className="grid grid-cols-3 gap-6">
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
          <div className="text-3xl mb-2">📂</div>
          <h3 className="text-lg font-semibold">Spaces</h3>
          <p className="text-muted text-sm mt-1">Organize your projects</p>
        </div>
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
          <div className="text-3xl mb-2">📋</div>
          <h3 className="text-lg font-semibold">Missions</h3>
          <p className="text-muted text-sm mt-1">Track tasks & progress</p>
        </div>
        <div className="p-6 rounded-xl bg-surface-900 border border-surface-800">
          <div className="text-3xl mb-2">🤖</div>
          <h3 className="text-lg font-semibold">Agents</h3>
          <p className="text-muted text-sm mt-1">AI-powered automation</p>
        </div>
      </div>
    </div>
  )
}
