import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { getClientIp, rateLimit } from '../../../../../lib/rateLimiter'
import { issueBreakGlassToken } from '../../../../../lib/tokens'

const bodySchema = z.object({ reason: z.string().min(2).max(256) })

export async function POST(req: NextRequest, { params }: { params: { publicId: string } }) {
  const { publicId } = params
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`e:request:${publicId}:${ip}`, 10, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  // Lookup profile by publicId
  const profile = await prisma.profile.findFirst({ where: { publicId, revoked: false } })
  if (!profile) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  // Audit request (avoid PII: only publicId and reason length)
  await prisma.auditLog.create({
    data: {
      profileId: profile.id,
      event: 'REQUEST_BREAK_GLASS',
      reason: '[REDACTED]',
    },
  })

  // Issue break-glass token (stub: not returned in API)
  await issueBreakGlassToken(profile.id, 15, { reason: parsed.data.reason })

  // TODO: notify owner (stub)

  return NextResponse.json({ ok: true })
}


