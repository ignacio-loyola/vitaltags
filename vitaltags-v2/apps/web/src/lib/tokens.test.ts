import { beforeAll, describe, expect, it, vi } from 'vitest'

let issueBreakGlassToken: any, verifyBreakGlassToken: any

beforeAll(async () => {
  process.env.PASETO_LOCAL_KEY = process.env.PASETO_LOCAL_KEY || 'c'.repeat(64)
  process.env.KEK_HEX = process.env.KEK_HEX || 'a'.repeat(64)
  process.env.PII_SALT_HEX = process.env.PII_SALT_HEX || 'b'.repeat(64)
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5433/test?schema=public'
  process.env.RP_ID = process.env.RP_ID || 'localhost'
  process.env.RP_ORIGIN = process.env.RP_ORIGIN || 'http://localhost:3000'
  const mod = await import('./tokens')
  issueBreakGlassToken = mod.issueBreakGlassToken
  verifyBreakGlassToken = mod.verifyBreakGlassToken
})

describe('break-glass tokens', () => {
  it('issues and verifies with claims intact', async () => {
    const token = await issueBreakGlassToken('profile123', 10, { reason: 'ER access' })
    const payload = await verifyBreakGlassToken(token)
    expect(payload.sub).toBe('profile123')
    expect(payload.reason).toBe('ER access')
  })

  it('expires after ttl', async () => {
    const token = await issueBreakGlassToken('p1', 1 / 60, { reason: 'test' })
    await new Promise((r) => setTimeout(r, 1100))
    await expect(verifyBreakGlassToken(token)).rejects.toThrow()
  })
})


