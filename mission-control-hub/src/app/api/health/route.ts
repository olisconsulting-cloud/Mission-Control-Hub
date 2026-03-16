import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const url = new URL(request.url)
  const migrate = url.searchParams.get("migrate")
  
  const checks: Record<string, any> = {}
  checks.dbUrlSet = !!process.env.DATABASE_URL

  try {
    const { getPayload } = await import("payload")
    const config = (await import("@/payload/payload.config")).default
    const payload = await getPayload({ config })

    if (migrate === "true") {
      // Run migration
      try {
        await payload.db.migrate()
        checks.migration = "completed"
      } catch (migErr: any) {
        // Try push instead
        try {
          await payload.db.push()
          checks.migration = "pushed"
        } catch (pushErr: any) {
          checks.migration = { error: pushErr?.message?.substring(0, 300) }
        }
      }
    }

    try {
      const result = await payload.find({ collection: "users", limit: 1 })
      checks.payload = { status: "connected", userCount: result.totalDocs }
    } catch (queryErr: any) {
      checks.payload = { status: "error", message: queryErr?.message?.substring(0, 300) }
    }
  } catch (error: any) {
    checks.payload = { status: "init_error", message: error?.message?.substring(0, 500), stack: error?.stack?.substring(0, 300) }
  }

  return NextResponse.json({
    status: checks.payload?.status === "connected" ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  }, { status: checks.payload?.status === "connected" ? 200 : 503 })
}

