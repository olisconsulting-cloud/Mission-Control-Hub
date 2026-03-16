'use client'

import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
  type DragOverEvent,
} from '@dnd-kit/core'
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable'
import { KanbanColumn } from './KanbanColumn'
import { TaskCard } from './TaskCard'
import { useKanban } from '@/hooks/useKanban'
import { COLUMNS, type ColumnId, type Task } from '@/types/task'
import { BoardSkeleton } from '@/components/ui/Skeleton'

interface KanbanBoardProps {
  spaceId: string
}

export function KanbanBoard({ spaceId }: KanbanBoardProps) {
  const { loading, getTasksByColumn, moveTask, createTask, deleteTask } = useKanban(spaceId)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [addingTo, setAddingTo] = useState<ColumnId | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, { 
      activationConstraint: { 
        distance: 5 // 5px threshold to prevent accidental drags
      } 
    }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  )

  const handleDragStart = (event: DragStartEvent) => {
    const task = event.active.data.current?.task as Task | undefined
    if (task) setActiveTask(task)
  }

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback handled by KanbanColumn isOver
  }

  const handleDragEnd = (event: DragEndEvent) => {
    setActiveTask(null)
    const { active, over } = event
    if (!over) return

    const taskId = active.id as string
    const overId = over.id as string

    // Determine target column
    let targetColumn: ColumnId
    const isColumn = COLUMNS.some(c => c.id === overId)

    if (isColumn) {
      targetColumn = overId as ColumnId
    } else {
      // Dropped on another task — find its column
      const overTask = over.data.current?.task as Task | undefined
      if (!overTask) return
      targetColumn = overTask.status
    }

    const columnTasks = getTasksByColumn(targetColumn)
    const newOrder = columnTasks.length > 0
      ? Math.max(...columnTasks.map(t => t.order)) + 1
      : 0

    moveTask(taskId, targetColumn, newOrder)
  }

  const handleAddTask = async (columnId: ColumnId) => {
    if (!newTaskTitle.trim()) return
    await createTask({ title: newTaskTitle, status: columnId })
    setNewTaskTitle('')
    setAddingTo(null)
  }

  if (loading) {
    return <BoardSkeleton />
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4" aria-label="Kanban board">
        {COLUMNS.map(col => (
          <div key={col.id} className="flex flex-col">
            <KanbanColumn
              id={col.id}
              title={col.title}
              icon={col.icon}
              tasks={getTasksByColumn(col.id)}
              wipLimit={col.wipLimit}
              onDeleteTask={deleteTask}
            />

            {/* Quick Add */}
            <div className="mt-2 px-2">
              {addingTo === col.id ? (
                <div className="flex gap-1">
                  <input
                    type="text"
                    value={newTaskTitle}
                    onChange={e => setNewTaskTitle(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && handleAddTask(col.id)}
                    placeholder="Task title..."
                    className="flex-1 px-2 py-1 text-sm bg-void border border-surface-700 rounded focus:border-volt-500 focus:outline-none"
                    autoFocus
                  />
                  <button
                    onClick={() => handleAddTask(col.id)}
                    className="px-2 py-1 text-sm bg-volt-500 text-void rounded hover:bg-volt-400"
                  >
                    +
                  </button>
                  <button
                    onClick={() => { setAddingTo(null); setNewTaskTitle('') }}
                    className="px-2 py-1 text-sm text-muted hover:text-foreground"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => setAddingTo(col.id)}
                  className="w-full text-left text-sm text-muted hover:text-volt-400 px-2 py-1 rounded hover:bg-surface-900 transition-colors"
                >
                  + Add task
                </button>
              )}
            </div>
          </div>
        ))}
      </div>

      <DragOverlay>
        {activeTask && <TaskCard task={activeTask} />}
      </DragOverlay>
    </DndContext>
  )
}
