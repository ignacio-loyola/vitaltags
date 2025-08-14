import { describe, it, expect, vi, beforeAll } from 'vitest'

let notifyBreakGlass: any, sendLastAccessDigest: any

beforeAll(async () => {
  process.env.KEK_HEX = process.env.KEK_HEX || 'a'.repeat(64)
  process.env.PII_SALT_HEX = process.env.PII_SALT_HEX || 'b'.repeat(64)
  process.env.PASETO_LOCAL_KEY = process.env.PASETO_LOCAL_KEY || 'c'.repeat(64)
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5433/test?schema=public'
  process.env.RP_ID = process.env.RP_ID || 'localhost'
  process.env.RP_ORIGIN = process.env.RP_ORIGIN || 'http://localhost:3000'
  const mod = await import('./notify')
  notifyBreakGlass = mod.notifyBreakGlass
  sendLastAccessDigest = mod.sendLastAccessDigest
})

describe('notify', () => {
  it('stub break-glass returns log channel and redacts PII', async () => {
    const spy = vi.spyOn(console, 'log').mockImplementation(() => {})
    const res = await notifyBreakGlass({ email: 'owner@example.com', phone: '+15550001111', userId: 'u1' }, { profileId: 'p1', reason: 'ER', at: new Date() })
    expect(res.ok).toBe(true)
    expect(res.channel).toBe('log')
    expect(res.messageId).toBeTruthy()
    const args = spy.mock.calls[0]?.[1] as any
    expect(args.email).toBeUndefined()
    expect(args.phone).toBeUndefined()
    expect(args.emailHash).toMatch(/^[a-f0-9]{64}$/)
    spy.mockRestore()
  })

  it('stub last-access digest returns log channel', async () => {
    const res = await sendLastAccessDigest({ userId: 'u1' }, { profileId: 'p1', events: [{ at: new Date(), event: 'VIEW_TIER_E' }] })
    expect(res.ok).toBe(true)
    expect(['log', 'email', 'sms']).toContain(res.channel)
  })
})


