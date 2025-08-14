import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyAuthenticationResponse } from '@simplewebauthn/server'
import { prisma } from '../../../../../lib/db'
import { env } from '../../../../../env'
import { takeChallenge } from '../../../../../lib/webauthnStore'
import { createSession } from '../../../../../lib/auth'

const bodySchema = z.object({ email: z.string().email(), assertion: z.any() })

export async function POST(req: NextRequest) {
  let json: unknown
  try { json = await req.json() } catch { return NextResponse.json({ error: 'bad_json' }, { status: 400 }) }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  const { email, assertion } = parsed.data

  const ch = takeChallenge(email)
  if (!ch || ch.type !== 'login') return NextResponse.json({ error: 'no_challenge' }, { status: 400 })

  const credId = assertion.id as string
  const cred = await prisma.webAuthnCredential.findUnique({ where: { id: credId } })
  if (!cred) return NextResponse.json({ error: 'unknown_credential' }, { status: 404 })

  const verification = await verifyAuthenticationResponse({
    response: assertion,
    expectedChallenge: ch.challenge,
    expectedOrigin: env.RP_ORIGIN,
    expectedRPID: env.RP_ID,
    authenticator: {
      credentialID: Buffer.from(cred.id, 'base64url'),
      credentialPublicKey: Buffer.from(cred.publicKey),
      counter: cred.counter,
      transports: cred.transports as any,
    },
  })
  if (!verification.verified) return NextResponse.json({ error: 'verify_failed' }, { status: 401 })

  await prisma.webAuthnCredential.update({ where: { id: cred.id }, data: { counter: verification.authenticationInfo.newCounter } })

  await createSession(cred.userId)
  return NextResponse.json({ ok: true })
}


