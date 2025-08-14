import { beforeAll, describe, expect, it } from 'vitest'
import { getSodium } from './sodium'

let decryptJSON: any, encryptJSON: any, generateDEK: any, hashPII: any, unwrapDEK: any, wrapDEK: any

beforeAll(async () => {
  process.env.KEK_HEX = process.env.KEK_HEX || 'a'.repeat(64)
  process.env.PII_SALT_HEX = process.env.PII_SALT_HEX || 'b'.repeat(64)
  process.env.PASETO_LOCAL_KEY = process.env.PASETO_LOCAL_KEY || 'c'.repeat(64)
  process.env.DATABASE_URL = process.env.DATABASE_URL || 'postgresql://localhost:5433/test?schema=public'
  // Dynamically import after env is set so env.ts reads them
  const mod = await import('./crypto')
  decryptJSON = mod.decryptJSON
  encryptJSON = mod.encryptJSON
  generateDEK = mod.generateDEK
  hashPII = mod.hashPII
  unwrapDEK = mod.unwrapDEK
  wrapDEK = mod.wrapDEK
  await getSodium()
})

describe('crypto', () => {
  it('DEK wrap/unwrap roundtrip', async () => {
    const dek = await generateDEK()
    const wrapped = await wrapDEK(dek)
    const unwrapped = await unwrapDEK(wrapped)
    expect(Buffer.from(unwrapped).toString('hex')).toEqual(Buffer.from(dek).toString('hex'))
  })

  it('encrypt/decrypt JSON roundtrip', async () => {
    const dek = await generateDEK()
    const data = { a: 1, b: 'x', c: [1, 2, 3] }
    const { ciphertext, nonce } = await encryptJSON(dek, data)
    const plain = await decryptJSON(dek, ciphertext, nonce)
    expect(plain).toEqual(data)
  })

  it('tamper detection fails decryption', async () => {
    const dek = await generateDEK()
    const { ciphertext, nonce } = await encryptJSON(dek, { foo: 'bar' })
    const tampered = new Uint8Array(ciphertext)
    tampered[0] = (tampered[0] || 0) ^ 0xff
    await expect(async () => {
      await decryptJSON(dek, tampered, nonce)
    }).rejects.toThrow()
  })

  it('hashPII produces deterministic salted hash', async () => {
    const h1 = await hashPII('hello@example.com')
    const h2 = await hashPII('hello@example.com')
    expect(h1).toEqual(h2)
    expect(h1).toMatch(/^[a-f0-9]{64}$/)
  })
})


