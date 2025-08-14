import { encrypt, decrypt } from 'paseto-ts/v4'
import { env } from '../env'

function hexToBytes(hex: string): Uint8Array {
  const out = new Uint8Array(hex.length / 2)
  for (let i = 0; i < hex.length; i += 2) out[i / 2] = parseInt(hex.slice(i, i + 2), 16)
  return out
}

function getLocalKeyBytes(): Uint8Array {
  const magic = new TextEncoder().encode('k4.local.')
  const key = hexToBytes(env.PASETO_LOCAL_KEY)
  if (key.length !== 32) throw new Error('PASETO_LOCAL_KEY must be 32 bytes (64 hex chars)')
  const out = new Uint8Array(magic.length + key.length)
  out.set(magic)
  out.set(key, magic.length)
  return out
}

export async function issueBreakGlassToken(
  profileId: string,
  ttlMinutes = 15,
  claims: { reason: string }
): Promise<string> {
  const key = getLocalKeyBytes()
  const ttlSeconds = Math.max(1, Math.ceil(ttlMinutes * 60))
  const payload = { sub: profileId, reason: claims.reason, exp: `${ttlSeconds} seconds` }
  return await encrypt(key, payload)
}

export async function verifyBreakGlassToken(token: string): Promise<{ sub: string; reason: string; iat: number; exp: number }> {
  const key = getLocalKeyBytes()
  const { payload } = await decrypt<any>(key, token)
  if (typeof payload !== 'object' || payload === null) throw new Error('invalid payload')
  if (typeof payload.sub !== 'string' || typeof payload.reason !== 'string') throw new Error('invalid claims')
  return payload as any
}


