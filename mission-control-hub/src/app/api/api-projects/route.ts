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

export async function GET() {
  try {
    const result = await runQuery(
      "SELECT id, name, description, customer_name, status, created_at FROM projects ORDER BY updated_at DESC"
    )
    return NextResponse.json({ projects: result.rows || [] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, customerName } = body
    
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }
    
    const result = await runQuery(
      "INSERT INTO projects (name, description, customer_name, status, created_at, updated_at) VALUES ($1, $2, $3, 'active', NOW(), NOW()) RETURNING id, name, description, customer_name, status",
      [name, description || null, customerName || null]
    )
    
    return NextResponse.json({ project: result.rows?.[0] })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
