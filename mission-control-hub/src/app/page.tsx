import Link from 'next/link'

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-8">
        <div className="relative">
          <div className="absolute inset-0 blur-3xl opacity-20 bg-volt-glow rounded-full" />
          <h1 className="relative text-6xl font-bold font-[family-name:var(--font-heading)] tracking-tight">
            Mission Control
            <span className="text-volt-400"> Hub</span>
          </h1>
        </div>
        <p className="text-muted text-lg max-w-md mx-auto">
          AI-powered mission control for teams. Manage agents, track tasks, ship faster.
        </p>
        <div className="flex gap-4 justify-center">
          <Link
            href="/api/auth/signin"
            className="px-6 py-3 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors"
          >
            Get Started
          </Link>
          <Link
            href="/admin"
            className="px-6 py-3 border border-surface-700 text-foreground rounded-lg hover:border-volt-500 transition-colors"
          >
            Admin Panel
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-3 gap-8 text-left max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-surface-900 border border-surface-800">
            <div className="text-volt-400 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold mb-1">AI Agents</h3>
            <p className="text-muted text-sm">Connect OpenAI, Anthropic, and custom agents.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-900 border border-surface-800">
            <div className="text-volt-400 text-2xl mb-2">📋</div>
            <h3 className="font-semibold mb-1">Mission Board</h3>
            <p className="text-muted text-sm">Kanban with drag & drop and live updates.</p>
          </div>
          <div className="p-4 rounded-xl bg-surface-900 border border-surface-800">
            <div className="text-volt-400 text-2xl mb-2">📊</div>
            <h3 className="font-semibold mb-1">Intelligence</h3>
            <p className="text-muted text-sm">Analytics, cost tracking, and insights.</p>
          </div>
        </div>
      </div>
    </main>
  )
}
