import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

// GET /api/projects - List all projects
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    
    const payload = await getPayload({ config })
    
    let query: any = {}
    if (status) {
      query.status = { equals: status }
    }
    
    const result = await payload.find({
      collection: "projects",
      where: query,
      sort: "-updatedAt",
    })
    
    return NextResponse.json({ projects: result.docs })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

// POST /api/projects - Create new project
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, description, customerName } = body
    
    if (!name) {
      return NextResponse.json({ error: "Name required" }, { status: 400 })
    }
    
    const payload = await getPayload({ config })
    
    const project = await payload.create({
      collection: "projects",
      data: {
        name,
        description,
        customerName,
        status: "active",
      },
    })
    
    return NextResponse.json({ project })
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}
