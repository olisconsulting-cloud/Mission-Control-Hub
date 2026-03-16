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
    
    if (!projectId) {
      return NextResponse.json({ error: "project required" }, { status: 400 })
    }
    
    const result = await runQuery(
      "SELECT m.id, m.content, m.created_at, u.name as user_name, u.email as user_email FROM messages m LEFT JOIN users u ON m.user_id = u.id WHERE m.project_id = $1 ORDER BY m.created_at ASC",
      [parseInt(projectId)]
    )
    
    return NextResponse.json({ messages: result.rows || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, projectId } = body
    
    if (!content || !projectId) {
      return NextResponse.json({ error: "content and projectId required" }, { status: 400 })
    }
    
    // Get first user as default
    const userResult = await runQuery("SELECT id FROM users LIMIT 1")
    const userId = userResult.rows?.[0]?.id || 1
    
    const result = await runQuery(
      "INSERT INTO messages (content, project_id, user_id, created_at) VALUES ($1, $2, $3, NOW()) RETURNING id, content, created_at",
      [content, parseInt(projectId), userId]
    )
    
    return NextResponse.json({ message: result.rows?.[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
