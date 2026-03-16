import { describe, it, expect, vi, beforeEach } from 'vitest'
import { taskService } from '@/lib/services/taskService'
import { createMockTask, createMockPayloadResponse } from '../helpers'
import { getPayload } from 'payload'

vi.mock('payload')

describe('Task Service', () => {
  let mockPayload: any

  beforeEach(() => {
    mockPayload = {
      find: vi.fn(),
      findByID: vi.fn(),
      create: vi.fn(),
      update: vi.fn(),
      delete: vi.fn(),
    }
    vi.mocked(getPayload).mockResolvedValue(mockPayload)
  })

  describe('findBySpace', () => {
    it('should find tasks by space ID', async () => {
      const mockTasks = [createMockTask(), createMockTask({ id: 'task-2' })]
      mockPayload.find.mockResolvedValue(createMockPayloadResponse(mockTasks))

      const result = await taskService.findBySpace('space-1')

      expect(mockPayload.find).toHaveBeenCalledWith({
        collection: 'tasks',
        where: { space: { equals: 'space-1' } },
        sort: '-createdAt',
        page: 1,
        limit: 50,
      })
      expect(result.docs).toHaveLength(2)
    })

    it('should support pagination', async () => {
      mockPayload.find.mockResolvedValue(createMockPayloadResponse([]))

      await taskService.findBySpace('space-1', 2, 25)

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({ page: 2, limit: 25 })
      )
    })
  })

  describe('findById', () => {
    it('should find task by ID', async () => {
      const mockTask = createMockTask()
      mockPayload.findByID.mockResolvedValue(mockTask)

      const result = await taskService.findById('task-1')

      expect(mockPayload.findByID).toHaveBeenCalledWith({
        collection: 'tasks',
        id: 'task-1',
      })
      expect(result).toEqual(mockTask)
    })
  })

  describe('create', () => {
    it('should create a task with createdBy', async () => {
      const taskData = {
        title: 'New Task',
        status: 'todo',
        space: 'space-1',
      }
      const mockTask = createMockTask(taskData)
      mockPayload.create.mockResolvedValue(mockTask)

      const result = await taskService.create(taskData, 'user-1')

      expect(mockPayload.create).toHaveBeenCalledWith({
        collection: 'tasks',
        data: { ...taskData, createdBy: 'user-1' },
      })
      expect(result).toEqual(mockTask)
    })
  })

  describe('update', () => {
    it('should update a task', async () => {
      const updateData = { status: 'done' }
      const mockTask = createMockTask(updateData)
      mockPayload.update.mockResolvedValue(mockTask)

      const result = await taskService.update('task-1', updateData)

      expect(mockPayload.update).toHaveBeenCalledWith({
        collection: 'tasks',
        id: 'task-1',
        data: updateData,
      })
      expect(result.status).toBe('done')
    })
  })

  describe('delete', () => {
    it('should delete a task', async () => {
      const mockTask = createMockTask()
      mockPayload.delete.mockResolvedValue(mockTask)

      const result = await taskService.delete('task-1')

      expect(mockPayload.delete).toHaveBeenCalledWith({
        collection: 'tasks',
        id: 'task-1',
      })
      expect(result).toEqual(mockTask)
    })
  })

  describe('getStats', () => {
    it('should calculate task statistics', async () => {
      const mockTasks = [
        createMockTask({ status: 'todo', priority: 'high' }),
        createMockTask({ id: 'task-2', status: 'done', priority: 'medium' }),
        createMockTask({ id: 'task-3', status: 'in-progress', priority: 'high' }),
      ]
      
      mockPayload.find
        .mockResolvedValueOnce(createMockPayloadResponse([], 3))
        .mockResolvedValueOnce(createMockPayloadResponse(mockTasks, 3))

      const result = await taskService.getStats('space-1')

      expect(result.total).toBe(3)
      expect(result.byStatus).toEqual({
        todo: 1,
        done: 1,
        'in-progress': 1,
      })
      expect(result.byPriority).toEqual({
        high: 2,
        medium: 1,
      })
    })

    it('should count overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const mockTasks = [
        createMockTask({ dueDate: yesterday, status: 'todo' }),
        createMockTask({ id: 'task-2', status: 'done' }),
      ]
      
      mockPayload.find
        .mockResolvedValueOnce(createMockPayloadResponse([], 2))
        .mockResolvedValueOnce(createMockPayloadResponse(mockTasks, 2))

      const result = await taskService.getStats('space-1')

      expect(result.overdue).toBe(1)
    })
  })

  describe('findOverdue', () => {
    it('should find overdue tasks', async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const mockTasks = [createMockTask({ dueDate: yesterday, status: 'todo' })]
      mockPayload.find.mockResolvedValue(createMockPayloadResponse(mockTasks))

      const result = await taskService.findOverdue('space-1')

      expect(mockPayload.find).toHaveBeenCalledWith(
        expect.objectContaining({
          collection: 'tasks',
          where: expect.objectContaining({
            and: expect.arrayContaining([
              expect.objectContaining({ dueDate: expect.any(Object) }),
              { status: { not_equals: 'done' } },
            ]),
          }),
        })
      )
      expect(result.docs).toHaveLength(1)
    })
  })
})
