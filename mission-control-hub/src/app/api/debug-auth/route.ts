import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body
    
    console.log("Debug auth attempt:", email)
    
    const payload = await getPayload({ config })
    
    // Find user
    const result = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
    })
    
    const user = result.docs[0] as any
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    
    return NextResponse.json({
      found: true,
      userId: user.id,
      email: user.email,
      hasHash: !!user.hash,
      hashLength: user.hash?.length,
      role: user.role,
    })
  } catch (error: any) {
    return NextResponse.json({
      error: error.message,
      stack: error.stack?.substring(0, 500),
    }, { status: 500 })
  }
}
