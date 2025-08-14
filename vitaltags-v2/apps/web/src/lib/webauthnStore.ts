type ChallengeRecord = { challenge: string; type: 'register' | 'login'; expiresAt: number }
const store = new Map<string, ChallengeRecord>()

export function putChallenge(key: string, rec: ChallengeRecord) {
  store.set(key, rec)
}

export function takeChallenge(key: string): ChallengeRecord | null {
  const rec = store.get(key) || null
  if (!rec) return null
  if (rec.expiresAt < Date.now()) {
    store.delete(key)
    return null
  }
  store.delete(key)
  return rec
}


