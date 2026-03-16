import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export const maxDuration = 60

export async function GET(request: Request) {
  const url = new URL(request.url)
  const setup = url.searchParams.get("setup")
  
  const checks: Record<string, any> = {}
  checks.dbUrlSet = !!process.env.DATABASE_URL

  try {
    const payload = await getPayload({ config })
    
    if (setup === "true") {
      try {
        // @ts-ignore - push exists on the db adapter
        if (typeof payload.db.push === "function") {
          await payload.db.push({ forceAcceptWarning: true })
          checks.setup = "schema pushed successfully"
        } else {
          checks.setup = "push not available, trying createMigration"
          await payload.db.createMigration({ forceAcceptWarning: true })
          await payload.db.migrate()
          checks.setup = "migration completed"
        }
      } catch (setupErr: any) {
        checks.setup = { error: setupErr?.message?.substring(0, 500) }
      }
    }

    try {
      const result = await payload.find({ collection: "users", limit: 1 })
      checks.database = { status: "connected", userCount: result.totalDocs }
    } catch (queryErr: any) {
      checks.database = { status: "query_error", message: queryErr?.message?.substring(0, 300) }
    }
  } catch (error: any) {
    checks.database = { status: "init_error", message: error?.message?.substring(0, 500) }
  }

  const healthy = checks.database?.status === "connected"
  
  return NextResponse.json({
    status: healthy ? "healthy" : "unhealthy",
    checks,
    timestamp: new Date().toISOString(),
  }, { status: healthy ? 200 : 503 })
}

