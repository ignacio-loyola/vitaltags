import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

vi.mock('../../../../lib/tokens', () => ({
  verifyBreakGlassToken: vi.fn(async (t: string) => ({ sub: 'p1', reason: 'ER', iat: 1, exp: 2 })),
}))

vi.mock('../../../../lib/db', () => ({
  prisma: {
    profile: { findUnique: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

vi.mock('../../../../lib/crypto', () => ({
  unwrapDEK: vi.fn(async () => new Uint8Array(32)),
  decryptJSON: vi.fn(async () => ({ identity: 'x' })),
}))

const { prisma } = await import('../../../../lib/db')
const { verifyBreakGlassToken } = await import('../../../../lib/tokens')

function makeReq(url: string) { return new Request(url) as any }

describe('GET /api/c/[token]', () => {
  beforeEach(() => vi.clearAllMocks())

  it('rejects invalid token', async () => {
    ;(verifyBreakGlassToken as any).mockRejectedValueOnce(new Error('bad'))
    const res = await GET(makeReq('http://x/api/c/t1'), { params: { token: 't1' } })
    expect(res.status).toBe(401)
  })

  it('returns redacted minimal JSON and audits', async () => {
    ;(prisma.profile.findUnique as any).mockResolvedValueOnce({ id: 'p1', revoked: false, c_ciphertext: new Uint8Array(1), c_nonce: new Uint8Array(1), dek_wrapped: new Uint8Array(1) })
    const res = await GET(makeReq('http://x/api/c/t1'), { params: { token: 't1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.meta?.redacted).toBe(true)
    expect(prisma.auditLog.create).toHaveBeenCalled()
  })
})


