import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('../../../../../lib/db', () => ({
  prisma: {
    profile: { findFirst: vi.fn(), update: vi.fn() },
    auditLog: { create: vi.fn() },
  },
}))

const { prisma } = await import('../../../../../lib/db')

function makeReq(url: string, body?: any) {
  return new Request(url, { method: 'POST', body: body ? JSON.stringify(body) : undefined }) as any
}

describe('POST /api/e/[publicId]/revoke', () => {
  beforeEach(() => vi.clearAllMocks())

  it('forbids wrong revocation code', async () => {
    ;(prisma.profile.findFirst as any).mockResolvedValueOnce({ id: 'p1', publicId: 'pub1', revocationCode: 'abc' })
    const res = await POST(makeReq('http://x/api/e/pub1/revoke', { revocationCode: 'wrong' }), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(403)
  })

  it('revokes when code matches', async () => {
    ;(prisma.profile.findFirst as any).mockResolvedValueOnce({ id: 'p1', publicId: 'pub1', revocationCode: 'abc' })
    const res = await POST(makeReq('http://x/api/e/pub1/revoke', { revocationCode: 'abc' }), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(200)
    expect(prisma.profile.update).toHaveBeenCalled()
    expect(prisma.auditLog.create).toHaveBeenCalled()
  })
})


