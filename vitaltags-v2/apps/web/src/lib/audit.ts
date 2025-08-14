import type { NextRequest } from 'next/server'
import { prisma } from './db'
import { getClientIp } from './rateLimiter'
import { hashPII } from './crypto'

export async function recordAudit(
  req: NextRequest,
  profileId: string,
  event: string,
  reason?: string
) {
  try {
    const ip = getClientIp(req.headers)
    const ua = req.headers.get('user-agent') || ''
    const country = req.headers.get('cf-ipcountry') || req.headers.get('x-country') || undefined
    await prisma.auditLog.create({
      data: {
        profileId,
        event,
        reason: reason ? '[REDACTED]' : undefined,
        ipHash: ip ? await hashPII(ip) : undefined,
        uaHash: ua ? await hashPII(ua) : undefined,
        country,
      },
    })
  } catch {
    // swallow audit errors
  }
}


