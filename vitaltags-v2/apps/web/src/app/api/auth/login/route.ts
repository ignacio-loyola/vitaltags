import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { createSession } from '../../../../lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // In a real app, you would verify the hashed password here
    // For this demo, we'll just check that the user exists
    // const crypto = await import('node:crypto')
    // const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')
    // if (user.passwordHash !== hashedPassword) { ... }

    // Create session
    await createSession(user.id)

    return NextResponse.json({ success: true })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input data' },
        { status: 400 }
      )
    }

    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}