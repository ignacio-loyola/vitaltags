import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateRegistrationOptions } from '@simplewebauthn/server'
import { prisma } from '../../../../../lib/db'
import { env } from '../../../../../env'
import { putChallenge } from '../../../../../lib/webauthnStore'

const bodySchema = z.object({ email: z.string().email() })

export async function POST(req: NextRequest) {
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }) }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { email } = parsed.data
  const user = await prisma.user.findUnique({ where: { email }, include: { /* credentials via raw */ } })
  const creds = await prisma.webAuthnCredential.findMany({ where: { user: { email } } })
  const options = await generateRegistrationOptions({
    rpID: env.RP_ID,
    rpName: env.RP_NAME,
    userID: email,
    userName: email,
    attestationType: 'none',
    excludeCredentials: creds.map((c) => ({ id: Buffer.from(c.id, 'base64url'), type: 'public-key' as const })),
  })
  putChallenge(email, { challenge: options.challenge, type: 'register', expiresAt: Date.now() + 5 * 60 * 1000 })
  return NextResponse.json(options)
}


