'use client'

import { useState, useCallback, useEffect } from 'react'
import type { Task, ColumnId } from '@/types/task'

export function useKanban(spaceId?: string) {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  const fetchTasks = useCallback(async () => {
    if (!spaceId) return
    try {
      const res = await fetch(`/api/tasks?spaceId=${spaceId}`)
      const data = await res.json()
      setTasks(data.docs || [])
    } catch (error) {
      console.error('Failed to fetch tasks:', error)
    } finally {
      setLoading(false)
    }
  }, [spaceId])

  useEffect(() => {
    fetchTasks()
  }, [fetchTasks])

  const getTasksByColumn = useCallback(
    (columnId: ColumnId) =>
      tasks
        .filter(t => t.status === columnId)
        .sort((a, b) => a.order - b.order),
    [tasks]
  )

  const moveTask = useCallback(
    async (taskId: string, newStatus: ColumnId, newOrder: number) => {
      // Optimistic update
      setTasks(prev =>
        prev.map(t =>
          t.id === taskId ? { ...t, status: newStatus, order: newOrder } : t
        )
      )

      try {
        await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: newStatus, order: newOrder }),
        })
      } catch (error) {
        console.error('Failed to move task:', error)
        fetchTasks() // Rollback
      }
    },
    [fetchTasks]
  )

  const createTask = useCallback(
    async (data: { title: string; status?: ColumnId; priority?: string }) => {
      try {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...data, spaceId }),
        })
        if (res.ok) {
          await fetchTasks()
        }
      } catch (error) {
        console.error('Failed to create task:', error)
      }
    },
    [spaceId, fetchTasks]
  )

  const deleteTask = useCallback(
    async (taskId: string) => {
      setTasks(prev => prev.filter(t => t.id !== taskId))
      try {
        await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' })
      } catch (error) {
        console.error('Failed to delete task:', error)
        fetchTasks()
      }
    },
    [fetchTasks]
  )

  return {
    tasks,
    loading,
    getTasksByColumn,
    moveTask,
    createTask,
    deleteTask,
    refresh: fetchTasks,
  }
}
