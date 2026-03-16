import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get("project")
    
    if (!project) {
      return NextResponse.json({ error: "Project required" }, { status: 400 })
    }
    
    const payload = await getPayload({ config })
    
    const result = await payload.find({
      collection: "messages",
      where: { project: { equals: parseInt(project) } },
      sort: "createdAt",
      depth: 1,
    })
    
    return NextResponse.json({ messages: result.docs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { content, project } = body
    
    if (!content || !project) {
      return NextResponse.json({ error: "Content and project required" }, { status: 400 })
    }
    
    const payload = await getPayload({ config })
    
    // For now, use a default user since we don't have auth
    const users = await payload.find({
      collection: "users",
      limit: 1,
    })
    
    const userId = users.docs[0]?.id || 1
    
    const message = await payload.create({
      collection: "messages",
      data: {
        content,
        project,
        user: userId,
      },
    })
    
    return NextResponse.json({ message })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
