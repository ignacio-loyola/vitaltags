import { test, expect } from '@playwright/test'

test('POST /api/nfc/verify returns stubbed ok', async ({ request }) => {
  const res = await request.post('/api/nfc/verify', {
    data: { publicId: 'abc', ct: '42', sdm: 'zz' },
  })
  expect(res.status()).toBe(200)
  const json = await res.json()
  expect(json.ok).toBe(true)
  expect(json.flags).toContain('STUB_NO_CRYPTO')
  expect(json.counter).toBe(42)
})


