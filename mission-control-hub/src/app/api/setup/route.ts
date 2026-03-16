import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export async function POST(request: Request) {
  try {
    const payload = await getPayload({ config })
    
    // Check if any users exist
    const existing = await payload.find({ collection: "users", limit: 1 })
    
    if (existing.totalDocs > 0) {
      return NextResponse.json({ error: "Users already exist" }, { status: 400 })
    }
    
    // Create first admin user using Payload's create method
    const user = await payload.create({
      collection: "users",
      data: {
        email: "admin@mission-control.de",
        password: "admin12345!",
        name: "Admin",
        role: "admin",
      },
    })
    
    return NextResponse.json({ 
      success: true, 
      message: "Admin user created",
      email: user.email 
    })
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message || "Setup failed" 
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({ message: "Use POST to create first user" })
}
