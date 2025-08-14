import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function GET() {
  try {
    // simple connectivity check: count profiles
    const count = await prisma.profile.count()
    return NextResponse.json({ ok: true, count })
  } catch (e) {
    return new NextResponse('db error', { status: 500 })
  }
}


