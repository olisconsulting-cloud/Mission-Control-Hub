import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { auth } from '@/lib/auth'

export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await getPayload({ config })

    // Task Analytics
    const allTasks = await payload.find({ collection: 'tasks', limit: 1000 })
    const tasks = allTasks.docs

    const tasksByStatus: Record<string, number> = {}
    const tasksByPriority: Record<string, number> = {}
    for (const task of tasks) {
      tasksByStatus[task.status] = (tasksByStatus[task.status] || 0) + 1
      tasksByPriority[task.priority || 'medium'] = (tasksByPriority[task.priority || 'medium'] || 0) + 1
    }

    // Velocity: tasks completed in last 7 days
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    const recentDone = tasks.filter(
      t => t.status === 'done' && new Date(t.updatedAt) > weekAgo
    ).length

    // Agent Analytics
    const allUsage = await payload.find({ collection: 'agent-usage', limit: 1000 })
    const usageDocs = allUsage.docs

    const avgResponseTime = usageDocs.length > 0
      ? usageDocs.reduce((sum, d) => sum + (d.durationMs || 0), 0) / usageDocs.length
      : 0

    const successRate = usageDocs.length > 0
      ? (usageDocs.filter(d => d.success).length / usageDocs.length) * 100
      : 100

    // Space Activity
    const allActivities = await payload.find({
      collection: 'activities',
      sort: '-createdAt',
      limit: 100,
    })

    // Active days (last 30d)
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const activeDays = new Set(
      allActivities.docs
        .filter(a => new Date(a.createdAt) > thirtyDaysAgo)
        .map(a => new Date(a.createdAt).toISOString().split('T')[0])
    ).size

    return NextResponse.json({
      tasks: {
        total: tasks.length,
        byStatus: tasksByStatus,
        byPriority: tasksByPriority,
        weeklyVelocity: recentDone,
        completionRate: tasks.length > 0
          ? Math.round((tasksByStatus['done'] || 0) / tasks.length * 100)
          : 0,
      },
      agents: {
        totalCalls: usageDocs.length,
        avgResponseTimeMs: Math.round(avgResponseTime),
        successRate: Math.round(successRate),
      },
      activity: {
        totalActions: allActivities.totalDocs,
        activeDaysLast30: activeDays,
      },
    })
  } catch (error) {
    console.error('Failed to fetch analytics:', error)
    return NextResponse.json({ error: 'Internal error' }, { status: 500 })
  }
}
