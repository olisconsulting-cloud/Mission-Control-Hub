import { NextResponse } from "next/server"

export async function GET() {
  const checks: Record<string, any> = {}
  
  // Check DATABASE_URL exists
  checks.dbUrlSet = !!process.env.DATABASE_URL
  checks.dbUrlPrefix = process.env.DATABASE_URL?.substring(0, 30) + "..."

  // Try Payload
  try {
    const { getPayload } = await import("payload")
    const config = (await import("@/payload/payload.config")).default
    const payload = await getPayload({ config })
    
    // Try a simple query
    const result = await payload.find({ collection: "users", limit: 1 })
    checks.payload = { status: "connected", userCount: result.totalDocs }
  } catch (error: any) {
    checks.payload = { 
      status: "error", 
      message: error?.message?.substring(0, 500),
      name: error?.name,
      code: error?.code 
    }
  }

  const healthy = checks.payload?.status === "connected"
  
  return NextResponse.json({
    status: healthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  }, { status: healthy ? 200 : 503 })
}

