import Link from "next/link"

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-neutral-950">
      <div className="text-center space-y-8">
        <h1 className="text-6xl font-bold tracking-tight text-white">
          Mission Control
          <span className="text-green-400"> Hub</span>
        </h1>
        <p className="text-neutral-400 text-lg max-w-md mx-auto">
          AI-powered mission control for teams. Manage agents, track tasks, ship faster.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/auth/signin" className="px-6 py-3 bg-green-500 text-black font-semibold rounded-lg hover:bg-green-400 transition-colors">
            Sign In
          </Link>
          <Link href="/auth/register" className="px-6 py-3 border border-neutral-700 text-white rounded-lg hover:border-green-500 transition-colors">
            Create Account
          </Link>
        </div>
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-2xl mx-auto">
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-green-400 text-2xl mb-2">⚡</div>
            <h3 className="font-semibold text-white mb-1">AI Agents</h3>
            <p className="text-neutral-400 text-sm">Connect OpenAI, Anthropic, and custom agents.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-green-400 text-2xl mb-2">📋</div>
            <h3 className="font-semibold text-white mb-1">Mission Board</h3>
            <p className="text-neutral-400 text-sm">Kanban with drag and drop and live updates.</p>
          </div>
          <div className="p-4 rounded-xl bg-neutral-900 border border-neutral-800">
            <div className="text-green-400 text-2xl mb-2">📊</div>
            <h3 className="font-semibold text-white mb-1">Intelligence</h3>
            <p className="text-neutral-400 text-sm">Analytics, cost tracking, and insights.</p>
          </div>
        </div>
      </div>
    </main>
  )
}

