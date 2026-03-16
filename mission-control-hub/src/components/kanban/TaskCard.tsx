'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import type { Task } from '@/types/task'

const priorityColors: Record<string, string> = {
  low: 'bg-blue-500/20 text-blue-400',
  medium: 'bg-yellow-500/20 text-yellow-400',
  high: 'bg-orange-500/20 text-orange-400',
  critical: 'bg-red-500/20 text-red-400',
}

interface TaskCardProps {
  task: Task
  onDelete?: (id: string) => void
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      role="article"
      style={style}
      {...attributes}
      {...listeners}
      className="p-3 rounded-lg bg-void border border-surface-800 hover:border-surface-700 cursor-grab active:cursor-grabbing group transition-colors"
      onKeyDown={(e) => e.key === 'Delete' && onDelete?.(task.id)}
    >
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium leading-tight">{task.title}</h4>
        {onDelete && (
          <button
            onClick={e => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            className="opacity-100 md:opacity-0 md:group-hover:opacity-100 text-muted hover:text-red-400 text-xs transition-opacity"
            aria-label={`Delete task ${task.title}`}
          >
            ✕
          </button>
        )}
      </div>

      <div className="flex items-center gap-2 mt-2">
        <span className={`text-xs px-1.5 py-0.5 rounded ${priorityColors[task.priority] || ''}`}>
          {task.priority}
        </span>
        {task.labels?.map((label, i) => (
          <span
            key={i}
            className="text-xs px-1.5 py-0.5 rounded"
            style={{ backgroundColor: `${label.color}20`, color: label.color }}
          >
            {label.name}
          </span>
        ))}
      </div>

      {task.dueDate && (
        <p className="text-xs text-muted mt-2">
          📅 {new Date(task.dueDate).toLocaleDateString()}
        </p>
      )}
    </div>
  )
}
