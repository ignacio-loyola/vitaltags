import { hashPII } from './crypto'

export type NotifyResult = {
  ok: boolean
  channel: 'email' | 'sms' | 'log'
  messageId: string
}

export type OwnerContact = {
  email?: string
  phone?: string
  userId?: string
}

function randomId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36)
}

async function secureLog(event: string, data: Record<string, unknown>) {
  // Avoid logging PII. Hash email/phone if present.
  const redacted: Record<string, unknown> = { ...data }
  if (typeof data.email === 'string') redacted.emailHash = await hashPII(data.email as string)
  if (typeof data.phone === 'string') redacted.phoneHash = await hashPII(data.phone as string)
  delete redacted.email
  delete redacted.phone
  // eslint-disable-next-line no-console
  console.log(`[notify:${event}]`, redacted)
}

export async function notifyBreakGlass(
  owner: OwnerContact,
  details: { profileId: string; reason: string; at: Date; token?: string }
): Promise<NotifyResult> {
  const env = process.env.NODE_ENV
  const messageId = randomId()
  if (env !== 'production') {
    await secureLog('break_glass', { owner: owner.userId || 'unknown', email: owner.email, phone: owner.phone, profileId: details.profileId, reasonHash: await hashPII(details.reason), at: details.at.toISOString(), tokenSet: Boolean(details.token) })
    return { ok: true, channel: 'log', messageId }
  }
  // Production wiring placeholder (SES/Sendgrid/Twilio). Return planned channel only.
  const channel: NotifyResult['channel'] = owner.email ? 'email' : owner.phone ? 'sms' : 'log'
  await secureLog('break_glass_prod_stub', { channel, owner: owner.userId || 'unknown', profileId: details.profileId })
  return { ok: true, channel, messageId }
}

export async function sendLastAccessDigest(
  owner: OwnerContact,
  digest: { profileId: string; events: Array<{ at: Date; event: string }> }
): Promise<NotifyResult> {
  const env = process.env.NODE_ENV
  const messageId = randomId()
  if (env !== 'production') {
    await secureLog('last_access_digest', { owner: owner.userId || 'unknown', email: owner.email, phone: owner.phone, profileId: digest.profileId, events: digest.events.map((e) => ({ at: e.at.toISOString(), event: e.event })) })
    return { ok: true, channel: 'log', messageId }
  }
  const channel: NotifyResult['channel'] = owner.email ? 'email' : owner.phone ? 'sms' : 'log'
  await secureLog('last_access_digest_prod_stub', { channel, owner: owner.userId || 'unknown', profileId: digest.profileId, count: digest.events.length })
  return { ok: true, channel, messageId }
}


