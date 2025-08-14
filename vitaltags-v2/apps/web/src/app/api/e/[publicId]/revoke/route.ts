import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../../lib/db'
import { rateLimit, getClientIp } from '../../../../../lib/rateLimiter'

const bodySchema = z.object({ revocationCode: z.string().optional() })

export async function POST(req: NextRequest, { params }: { params: { publicId: string } }) {
  const { publicId } = params
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`e:revoke:${publicId}:${ip}`, 5, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  let json: unknown
  try {
    json = await req.json()
  } catch {
    json = {}
  }
  const parsed = bodySchema.safeParse(json)
  if (!parsed.success) return NextResponse.json({ error: 'bad_request' }, { status: 400 })

  // TODO: Authenticated owner check (stub). For now, accept revocationCode path.
  const profile = await prisma.profile.findFirst({ where: { publicId } })
  if (!profile) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  if (parsed.data.revocationCode && parsed.data.revocationCode !== profile.revocationCode) {
    return NextResponse.json({ error: 'forbidden' }, { status: 403 })
  }

  // Rotate publicId and revoke
  const { randomUUID } = await import('node:crypto')
  const newPublicId = randomUUID().replace(/-/g, '')
  await prisma.profile.update({
    where: { id: profile.id },
    data: { revoked: true, publicId: newPublicId },
  })

  await prisma.auditLog.create({ data: { profileId: profile.id, event: 'REVOKE' } })

  return NextResponse.json({ ok: true })
}


