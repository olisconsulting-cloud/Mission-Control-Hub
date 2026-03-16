import { NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export const maxDuration = 60

export async function GET() {
  const checks: Record<string, any> = {}

  try {
    const payload = await getPayload({ config })
    checks.init = "ok"
    
    try {
      const result = await payload.find({ collection: "users", limit: 1 })
      checks.db = { status: "healthy", count: result.totalDocs }
    } catch (e: any) {
      checks.db = { 
        status: "error", 
        message: e?.message?.substring(0, 1000),
        cause: e?.cause?.message?.substring(0, 500),
        code: e?.code,
      }
    }
  } catch (e: any) {
    checks.init = { 
      error: e?.message?.substring(0, 1000),
      cause: e?.cause?.message?.substring(0, 500),
    }
  }

  const ok = checks.db?.status === "healthy"
  return NextResponse.json({ status: ok ? "healthy" : "unhealthy", checks }, { status: ok ? 200 : 503 })
}

