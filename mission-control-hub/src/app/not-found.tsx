import Link from 'next/link'

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-6">
        <p className="text-8xl font-bold text-volt-400 font-[family-name:var(--font-heading)]">404</p>
        <h1 className="text-2xl font-bold">Page not found</h1>
        <p className="text-muted">The page you&apos;re looking for doesn&apos;t exist.</p>
        <Link
          href="/"
          className="inline-block px-6 py-3 bg-volt-500 text-void font-semibold rounded-lg hover:bg-volt-400 transition-colors"
        >
          Go Home
        </Link>
      </div>
    </main>
  )
}
