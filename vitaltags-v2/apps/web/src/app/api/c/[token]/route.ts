import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { verifyBreakGlassToken } from '../../../../lib/tokens'
import { prisma } from '../../../../lib/db'
import { unwrapDEK, decryptJSON } from '../../../../lib/crypto'
import { getClientIp, rateLimit } from '../../../../lib/rateLimiter'

export async function GET(req: NextRequest, { params }: { params: { token: string } }) {
  const { token } = params
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`c:${ip}`, 20, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let payload
  try {
    payload = await verifyBreakGlassToken(token)
  } catch {
    return NextResponse.json({ error: 'invalid_token' }, { status: 401 })
  }

  const profile = await prisma.profile.findUnique({ where: { id: payload.sub } })
  if (!profile || profile.revoked) return NextResponse.json({ error: 'not_found' }, { status: 404 })
  if (!profile.c_ciphertext || !profile.c_nonce || !profile.dek_wrapped) return NextResponse.json({ error: 'no_tier_c' }, { status: 404 })

  const dek = await unwrapDEK(new Uint8Array(profile.dek_wrapped as unknown as ArrayBuffer))
  const data = await decryptJSON(
    dek,
    new Uint8Array(profile.c_ciphertext as unknown as ArrayBuffer),
    new Uint8Array(profile.c_nonce as unknown as ArrayBuffer)
  )

  // Audit (no PII in logs)
  await prisma.auditLog.create({ data: { profileId: profile.id, event: 'VIEW_TIER_C' } })

  // Redacted minimal JSON skeleton
  return NextResponse.json({
    identity: '[REDACTED]',
    history: '[REDACTED]',
    docs: '[REDACTED]',
    meta: { redacted: true, fields: ['identity', 'history', 'docs'] },
  })
}


