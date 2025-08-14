import { test, expect } from '@playwright/test'

test('default security headers present', async ({ request }) => {
  const res = await request.get('/')
  expect(res.status()).toBe(200)
  const headers = res.headers()
  expect(headers['content-security-policy']).toBeTruthy()
  expect(headers['strict-transport-security']).toBeTruthy()
  expect(headers['x-content-type-options']).toBe('nosniff')
  expect(headers['referrer-policy']).toBe('no-referrer')
  expect(headers['permissions-policy']).toBeTruthy()
  expect(headers['x-frame-options']).toBe('DENY')
})


