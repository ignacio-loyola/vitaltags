import { NextResponse } from 'next/server'
import { getSessionUser } from '../../../../lib/auth'
import { prisma } from '../../../../lib/db'

export async function GET() {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })
  const profile = await prisma.profile.findFirst({ where: { userId: user.id } })
  const logs = profile ? await prisma.auditLog.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: 'desc' } }) : []
  const payload = {
    user: { id: user.id, email: user.email },
    profile: profile ? {
      id: profile.id,
      publicId: profile.publicId,
      alias: profile.alias,
      ageRange: profile.ageRange,
      criticalAllergies: profile.criticalAllergies,
      criticalConditions: profile.criticalConditions,
      criticalMeds: profile.criticalMeds,
      ecpPhone: profile.icePhone,
      c_ciphertext: profile.c_ciphertext ? Buffer.from(profile.c_ciphertext as unknown as Uint8Array).toString('base64') : null,
      c_nonce: profile.c_nonce ? Buffer.from(profile.c_nonce as unknown as Uint8Array).toString('base64') : null,
      dek_wrapped: profile.dek_wrapped ? Buffer.from(profile.dek_wrapped as unknown as Uint8Array).toString('base64') : null,
      revoked: profile.revoked,
      createdAt: profile.createdAt,
      updatedAt: profile.updatedAt,
    } : null,
    logs: logs.map((l) => ({ id: l.id, event: l.event, reason: l.reason, country: l.country, createdAt: l.createdAt })),
    meta: { encrypted: Boolean(profile?.c_ciphertext) },
  }
  return new NextResponse(JSON.stringify(payload), {
    status: 200,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': 'attachment; filename="vitaltags-export.json"',
    },
  })
}


