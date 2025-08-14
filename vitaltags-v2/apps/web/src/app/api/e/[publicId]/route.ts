import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { prisma } from '../../../../lib/db'
import { verifyNtag424SDM } from '../../../../lib/nfc'
import { getClientIp, rateLimit } from '../../../../lib/rateLimiter'

const querySchema = z.object({ ct: z.string().optional(), sdm: z.string().optional() })

export async function GET(req: NextRequest, { params }: { params: { publicId: string } }) {
  const { publicId } = params
  const ip = getClientIp(req.headers)
  const rl = rateLimit(`e:${publicId}:${ip}`, 30, 60_000)
  if (!rl.ok) return NextResponse.json({ error: 'rate_limited' }, { status: 429 })

  const url = new URL(req.url)
  const parse = querySchema.safeParse(Object.fromEntries(url.searchParams))
  if (!parse.success) return NextResponse.json({ error: 'bad_query' }, { status: 400 })
  const { ct, sdm } = parse.data

  // RLS-safe read from public view
  const rows = await prisma.$queryRawUnsafe<any[]>(
    'SELECT "publicId", "alias", "ageRange", "criticalAllergies", "criticalConditions", "criticalMeds", "icePhone" FROM v_profile_public WHERE "publicId" = $1',
    publicId
  )
  if (!rows.length) return NextResponse.json({ error: 'not_found' }, { status: 404 })

  let nfc: { flags: string[]; counter?: number } | undefined
  if (ct || sdm) {
    const res = await verifyNtag424SDM({ publicId, ct: ct || '', sdm: sdm || '' })
    if (!res.ok) {
      console.warn('[NFC_VERIFY_FAIL]', { publicId, flags: res.flags })
    }
    nfc = { flags: res.flags, counter: res.counter }
  }

  const rec = rows[0]
  return NextResponse.json({
    publicId: rec.publicId,
    alias: rec.alias ?? null,
    ageRange: rec.ageRange,
    criticalAllergies: rec.criticalAllergies,
    criticalConditions: rec.criticalConditions,
    criticalMeds: rec.criticalMeds,
    icePhone: rec.icePhone,
    nfc,
  })
}


