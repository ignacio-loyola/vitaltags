type Counter = { count: number; resetAt: number }
const buckets = new Map<string, Counter>()

function now(): number {
  return Date.now()
}

export function getClientIp(headers: Headers): string {
  const xff = headers.get('x-forwarded-for') || ''
  const real = headers.get('x-real-ip') || ''
  const ip = xff.split(',')[0].trim() || real || 'unknown'
  return ip
}

export function rateLimit(key: string, limit: number, windowMs: number): { ok: boolean; remaining: number; resetAt: number } {
  const nowMs = now()
  const bucket = buckets.get(key)
  if (!bucket || bucket.resetAt <= nowMs) {
    const resetAt = nowMs + windowMs
    buckets.set(key, { count: 1, resetAt })
    return { ok: true, remaining: limit - 1, resetAt }
  }
  if (bucket.count >= limit) {
    return { ok: false, remaining: 0, resetAt: bucket.resetAt }
  }
  bucket.count += 1
  return { ok: true, remaining: limit - bucket.count, resetAt: bucket.resetAt }
}


