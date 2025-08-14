import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { generateAuthenticationOptions } from '@simplewebauthn/server'
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
  const creds = await prisma.webAuthnCredential.findMany({ where: { user: { email } } })
  const options = await generateAuthenticationOptions({
    rpID: env.RP_ID,
    allowCredentials: creds.map((c) => ({ id: Buffer.from(c.id, 'base64url'), type: 'public-key' as const })),
    userVerification: 'preferred',
  })
  putChallenge(email, { challenge: options.challenge, type: 'login', expiresAt: Date.now() + 5 * 60 * 1000 })
  return NextResponse.json(options)
}


