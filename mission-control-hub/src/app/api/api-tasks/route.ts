import { NextResponse } from "next/server"

const NEON_URL = "https://ep-morning-resonance-aldevtkh-pooler.c-3.eu-central-1.aws.neon.tech/sql"
const NEON_CONN = process.env.DATABASE_URL || ""

async function runQuery(query: string, params?: any[]) {
  const response = await fetch(NEON_URL, {
    method: "POST",
    headers: {
      "Neon-Connection-String": NEON_CONN,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, params }),
  })
  return await response.json()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project")
    
    let query = "SELECT id, title, description, status, priority, project_id, created_at FROM tasks ORDER BY created_at DESC"
    let params: any[] = []
    
    if (projectId) {
      query = "SELECT id, title, description, status, priority, project_id, created_at FROM tasks WHERE project_id = $1 ORDER BY created_at DESC"
      params = [parseInt(projectId)]
    }
    
    const result = await runQuery(query, params)
    return NextResponse.json({ tasks: result.rows || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, projectId, status = "todo", priority = "medium" } = body
    
    if (!title || !projectId) {
      return NextResponse.json({ error: "Title and projectId required" }, { status: 400 })
    }
    
    const result = await runQuery(
      "INSERT INTO tasks (title, description, status, priority, project_id, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, NOW(), NOW()) RETURNING id, title, status, priority, project_id",
      [title, description || null, status, priority, parseInt(projectId)]
    )
    
    return NextResponse.json({ task: result.rows?.[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json()
    const { id, status } = body
    
    if (!id || !status) {
      return NextResponse.json({ error: "id and status required" }, { status: 400 })
    }
    
    await runQuery(
      "UPDATE tasks SET status = $1, updated_at = NOW() WHERE id = $2",
      [status, parseInt(id)]
    )
    
    return NextResponse.json({ success: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
