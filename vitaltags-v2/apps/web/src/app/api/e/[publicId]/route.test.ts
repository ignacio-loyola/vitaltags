import { describe, it, expect, vi, beforeEach } from 'vitest'
import { GET } from './route'

vi.mock('../../../../lib/db', () => {
  return {
    prisma: {
      $queryRawUnsafe: vi.fn(),
    },
  }
})

vi.mock('../../../../lib/nfc', () => ({
  verifyNtag424SDM: vi.fn(async () => ({ ok: true, flags: ['STUB_NO_CRYPTO'] })),
}))

const { prisma } = await import('../../../../lib/db')
const { verifyNtag424SDM } = await import('../../../../lib/nfc')

function makeReq(url: string, headers: Record<string, string> = {}) {
  return new Request(url, { headers: new Headers(headers) }) as any
}

describe('GET /api/e/[publicId]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns Tier E record from view', async () => {
    ;(prisma.$queryRawUnsafe as any).mockResolvedValueOnce([
      {
        publicId: 'pub1',
        alias: 'A',
        ageRange: '20-30',
        criticalAllergies: [],
        criticalConditions: [],
        criticalMeds: [],
        icePhone: '+123',
      },
    ])

    const res = await GET(makeReq('http://x/api/e/pub1'), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(200)
    const json = await res.json()
    expect(json.publicId).toBe('pub1')
    expect(json).not.toHaveProperty('c_ciphertext')
  })

  it('404 when not found', async () => {
    ;(prisma.$queryRawUnsafe as any).mockResolvedValueOnce([])
    const res = await GET(makeReq('http://x/api/e/pubx'), { params: { publicId: 'pubx' } })
    expect(res.status).toBe(404)
  })

  it('calls NFC verify when ct/sdm present and logs failure without PII', async () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    ;(prisma.$queryRawUnsafe as any).mockResolvedValue([{
      publicId: 'pub1', alias: null, ageRange: '20-30', criticalAllergies: [], criticalConditions: [], criticalMeds: [], icePhone: '+123',
    }])
    ;(verifyNtag424SDM as any).mockResolvedValueOnce({ ok: false, flags: ['BAD'] })
    const res = await GET(makeReq('http://x/api/e/pub1?ct=1&sdm=2'), { params: { publicId: 'pub1' } })
    expect(res.status).toBe(200)
    expect(warn).toHaveBeenCalled()
    const arg = (warn.mock.calls[0] || [])[1]
    expect(arg).toMatchObject({ publicId: 'pub1', flags: ['BAD'] })
    warn.mockRestore()
  })
})


