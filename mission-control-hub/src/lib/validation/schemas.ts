import { z } from 'zod'

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(50),
  sort: z.string().optional(),
  order: z.enum(['asc', 'desc']).default('desc'),
})

export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200),
  description: z.string().max(10000).optional(),
  status: z.enum(['todo', 'in_progress', 'review', 'done', 'archived']).default('todo'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  spaceId: z.string().min(1, 'Space ID is required'),
  assignee: z.string().optional(),
  dueDate: z.string().datetime().optional(),
  tags: z.array(z.string().max(50)).max(20).optional(),
  estimatedHours: z.number().min(0).max(1000).optional(),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  completedAt: z.string().datetime().optional(),
  actualHours: z.number().min(0).max(1000).optional(),
})

export const createSpaceSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  description: z.string().max(500).optional(),
  type: z.enum(['personal', 'team', 'project', 'client']).default('team'),
  team: z.string().optional(),
})

export const updateSpaceSchema = createSpaceSchema.partial()

export const createTeamSchema = z.object({
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
})

export const createAgentSchema = z.object({
  name: z.string().min(1).max(100),
  type: z.enum(['openai', 'anthropic', 'custom']),
  model: z.string().max(100).optional(),
  webhookUrl: z.string().url().optional(),
  apiKey: z.string().optional(),
  systemPrompt: z.string().max(10000).optional(),
  spaceId: z.string().min(1),
})

export const chatMessageSchema = z.object({
  message: z.string().min(1, 'Message is required').max(10000),
  context: z.record(z.unknown()).optional(),
})

export type CreateTask = z.infer<typeof createTaskSchema>
export type UpdateTask = z.infer<typeof updateTaskSchema>
export type CreateSpace = z.infer<typeof createSpaceSchema>
export type CreateTeam = z.infer<typeof createTeamSchema>
export type CreateAgent = z.infer<typeof createAgentSchema>
export type ChatMessage = z.infer<typeof chatMessageSchema>
export type Pagination = z.infer<typeof paginationSchema>
