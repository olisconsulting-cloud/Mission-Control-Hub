'use client'

export function CardSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-4">
      <div className="h-4 w-3/4 rounded bg-neutral-700 mb-3" />
      <div className="h-3 w-1/2 rounded bg-neutral-800 mb-2" />
      <div className="h-3 w-1/3 rounded bg-neutral-800" />
    </div>
  )
}

export function TableSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div className="animate-pulse space-y-3">
      <div className="h-10 rounded bg-neutral-800" />
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="h-12 rounded bg-neutral-900" />
      ))}
    </div>
  )
}

export function BoardSkeleton() {
  return (
    <div className="flex gap-4 overflow-x-auto p-4">
      {Array.from({ length: 4 }).map((_, col) => (
        <div key={col} className="w-72 flex-shrink-0 space-y-3">
          <div className="h-8 w-24 rounded bg-neutral-800 animate-pulse" />
          {Array.from({ length: 3 }).map((_, row) => (
            <CardSkeleton key={row} />
          ))}
        </div>
      ))}
    </div>
  )
}

export function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-lg border border-neutral-800 bg-neutral-900 p-6">
      <div className="h-4 w-1/3 rounded bg-neutral-700 mb-4" />
      <div className="h-48 rounded bg-neutral-800" />
    </div>
  )
}
