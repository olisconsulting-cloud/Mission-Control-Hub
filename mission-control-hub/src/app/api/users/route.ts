import { NextRequest, NextResponse } from "next/server"
import { getPayload } from "payload"
import config from "@/payload/payload.config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ message: "Password must be at least 8 characters" }, { status: 400 })
    }

    const payload = await getPayload({ config })

    const existing = await payload.find({
      collection: "users",
      where: { email: { equals: email } },
      limit: 1,
    })

    if (existing.docs.length > 0) {
      return NextResponse.json({ message: "Email already registered" }, { status: 409 })
    }

    const user = await payload.create({
      collection: "users",
      data: { name, email, password },
    })

    return NextResponse.json({ id: user.id, email: user.email }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Registration failed" }, { status: 500 })
  }
}

