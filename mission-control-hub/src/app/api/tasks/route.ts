import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const project = searchParams.get("project")
    const status = searchParams.get("status")
    
    const payload = await getPayload({ config })
    
    let where: any = {}
    if (project) where.project = { equals: parseInt(project) }
    if (status) where.status = { equals: status }
    
    const result = await payload.find({
      collection: "tasks",
      where,
      sort: "-updatedAt",
      depth: 1,
    })
    
    return NextResponse.json({ tasks: result.docs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { title, description, project, status = "todo", priority = "medium" } = body
    
    if (!title || !project) {
      return NextResponse.json({ error: "Title and project required" }, { status: 400 })
    }
    
    const payload = await getPayload({ config })
    
    const task = await payload.create({
      collection: "tasks",
      data: {
        title,
        description,
        project,
        status,
        priority,
      },
    })
    
    return NextResponse.json({ task })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
