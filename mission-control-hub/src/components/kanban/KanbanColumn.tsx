'use client'

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { TaskCard } from './TaskCard'
import type { Task } from '@/types/task'

interface KanbanColumnProps {
  id: string
  title: string
  icon: string
  tasks: Task[]
  wipLimit: number
  onDeleteTask?: (id: string) => void
}

export function KanbanColumn({ id, title, icon, tasks, wipLimit, onDeleteTask }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id })
  const isOverWip = wipLimit > 0 && tasks.length >= wipLimit

  return (
    <div
      className={`flex flex-col w-72 min-w-[18rem] shrink-0 rounded-xl bg-surface-900 border transition-colors ${
        isOver ? 'border-volt-500' : 'border-surface-800'
      }`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-surface-800">
        <div className="flex items-center gap-2">
          <span>{icon}</span>
          <h3 className="font-semibold text-sm">{title}</h3>
          <span className="text-xs text-muted bg-surface-800 px-1.5 py-0.5 rounded">
            {tasks.length}
          </span>
        </div>
        {wipLimit > 0 && (
          <span className={`text-xs ${isOverWip ? 'text-red-400' : 'text-muted'}`}>
            max {wipLimit}
          </span>
        )}
      </div>

      {/* Cards */}
      <div ref={setNodeRef} className="flex-1 p-2 space-y-2 overflow-y-auto min-h-[200px]">
        <SortableContext items={tasks.map(t => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map(task => (
            <TaskCard key={task.id} task={task} onDelete={onDeleteTask} />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-20 text-xs text-muted">
            Drop tasks here
          </div>
        )}
      </div>
    </div>
  )
}
