import { test, expect } from '@playwright/test'

test('GET /healthz returns 200', async ({ page, request }) => {
  const res = await request.get('/healthz')
  expect(res.status()).toBe(200)
  expect(await res.text()).toContain('ok')
})


