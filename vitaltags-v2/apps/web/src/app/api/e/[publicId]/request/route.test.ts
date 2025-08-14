import { describe, it, expect, vi, beforeEach } from 'vitest'
import { POST } from './route'

vi.mock('../../../../../lib/db', () => {
  return {
    prisma: {
      profile: { findFirst: vi.fn() },
      auditLog: { create: vi.fn() },
    },
  }
})

vi.mock('../../../../../lib/tokens', () => ({
  issueBreakGlassToken: vi.fn(async () => 'token'),
}))

const { prisma } = await import('../../../../../lib/db')
const { issueBreakGlassToken } = await import('../../../../../lib/tokens')

function makeReq(url: string, body: any) {
  return new Request(url, { method: 'POST', body: JSON.stringify(body) }) as any
}

describe('POST /api/e/[publicId]/request', () => {
  beforeEach(() => vi.clearAllMocks())

  it('creates audit and issues token', async () => {
    ;(prisma.profile.findFirst as any).mockResolvedValueOnce({ id: 'p1', publicId: 'pub1' })
    const res = await POST(makeReq('http://x/api/e/pub1/request', { reason: 'ER' }), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ ok: true })
    expect(prisma.auditLog.create).toHaveBeenCalled()
    expect(issueBreakGlassToken).toHaveBeenCalled()
  })

  it('rejects bad body', async () => {
    const res = await POST(makeReq('http://x/api/e/pub1/request', { reason: '' }), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(400)
  })
})


