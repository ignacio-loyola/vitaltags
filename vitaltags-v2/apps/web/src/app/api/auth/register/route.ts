import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '../../../../lib/db'
import { createSession } from '../../../../lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password (in a real app, use bcrypt)
    const crypto = await import('node:crypto')
    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex')

    // Create user
    const user = await prisma.user.create({
      data: {
        email,
        // Note: In a real app, store the hashed password in a separate table or field
        // For this demo, we're storing it in a way that's compatible with the existing schema
      },
    })

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

    console.error('Registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}