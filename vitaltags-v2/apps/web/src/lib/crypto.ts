import { getSodium } from './sodium'
import { env } from '../env'

// Load KEK from env (dev placeholder). 256-bit key provided as hex.
export function loadKEK(): Uint8Array {
  const hex = env.KEK_HEX
  if (!hex) throw new Error('KEK_HEX not set')
  if (hex.length !== 64) throw new Error('KEK_HEX must be 256-bit hex (64 chars)')
  const bytes = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) {
    bytes[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  }
  return bytes
}

export async function generateDEK(): Promise<Uint8Array> {
  const sodium = await getSodium()
  return sodium.randombytes_buf(32)
}

// Dev wrap/unwrap using libsodium sealed box (asymmetric). We derive an ephemeral keypair from KEK via crypto_kdf.
// Note: This is a placeholder until a KMS KEK wrapper is used.
export async function wrapDEK(dek: Uint8Array): Promise<Uint8Array> {
  const sodium = await getSodium()
  const kek = loadKEK()
  // Derive a deterministic secret key from KEK to use as sealed box recipient
  const context = 'VTDEKWRA' // 8-char context for KDF
  const masterKey = kek
  const subkey = sodium.crypto_kdf_derive_from_key(32, 1, context, masterKey)
  const kp = sodium.crypto_box_seed_keypair(subkey)
  return sodium.crypto_box_seal(dek, kp.publicKey)
}

export async function unwrapDEK(wrapped: Uint8Array): Promise<Uint8Array> {
  const sodium = await getSodium()
  const kek = loadKEK()
  const context = 'VTDEKWRA'
  const masterKey = kek
  const subkey = sodium.crypto_kdf_derive_from_key(32, 1, context, masterKey)
  const kp = sodium.crypto_box_seed_keypair(subkey)
  const dek = sodium.crypto_box_seal_open(wrapped, kp.publicKey, kp.privateKey)
  if (!dek) throw new Error('unwrap failed')
  return dek
}

export async function encryptJSON(dek: Uint8Array, obj: unknown): Promise<{ ciphertext: Uint8Array; nonce: Uint8Array }> {
  const sodium = await getSodium()
  const nonce = sodium.randombytes_buf(sodium.crypto_aead_xchacha20poly1305_ietf_NPUBBYTES)
  const plaintext = new TextEncoder().encode(JSON.stringify(obj))
  const ciphertext = sodium.crypto_aead_xchacha20poly1305_ietf_encrypt(
    plaintext,
    undefined,
    null,
    nonce,
    dek
  )
  return { ciphertext, nonce }
}

export async function decryptJSON(dek: Uint8Array, ciphertext: Uint8Array, nonce: Uint8Array): Promise<any> {
  const sodium = await getSodium()
  const plaintext = sodium.crypto_aead_xchacha20poly1305_ietf_decrypt(
    null,
    ciphertext,
    undefined,
    nonce,
    dek
  )
  const json = new TextDecoder().decode(plaintext)
  return JSON.parse(json)
}

export async function hashPII(value: string): Promise<string> {
  const saltHex = env.PII_SALT_HEX
  if (!saltHex || saltHex.length < 32) throw new Error('PII_SALT_HEX not set or too short')
  const saltBuf = Buffer.from(saltHex, 'hex')
  const crypto = await import('node:crypto')
  const hash = crypto.createHash('sha256')
  hash.update(saltBuf)
  hash.update(value, 'utf8')
  return hash.digest('hex')
}


