import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyRegistrationResponse } from '@simplewebauthn/server'
import { prisma } from '../../../../../lib/db'
import { env } from '../../../../../env'
import { takeChallenge } from '../../../../../lib/webauthnStore'
import { createSession } from '../../../../../lib/auth'

const bodySchema = z.object({ email: z.string().email(), attestation: z.any() })

export async function POST(req: NextRequest) {
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }) }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { email, attestation } = parsed.data

  const ch = takeChallenge(email)
  if (!ch || ch.type !== 'register') return NextResponse.json({ error: 'no_challenge' }, { status: 400 })

  const verification = await verifyRegistrationResponse({
    response: attestation,
    expectedChallenge: ch.challenge,
    expectedOrigin: env.RP_ORIGIN,
    expectedRPID: env.RP_ID,
  })
  if (!verification.verified || !verification.registrationInfo) {
    return NextResponse.json({ error: 'verify_failed' }, { status: 401 })
  }

  const { credentialID, credentialPublicKey, counter, credentialBackedUp, credentialDeviceType } = verification.registrationInfo

  // Upsert user
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  // Store credential
  await prisma.webAuthnCredential.upsert({
    where: { id: credentialID.toString('base64url') },
    update: { publicKey: credentialPublicKey, counter },
    create: {
      id: credentialID.toString('base64url'),
      userId: user.id,
      publicKey: credentialPublicKey,
      counter,
      backedUp: credentialBackedUp,
      deviceType: credentialDeviceType,
    },
  })

  await createSession(user.id)
  return NextResponse.json({ ok: true })
}


