export interface NFCVerifyInput {
  publicId: string
  ct: string
  sdm: string
  extras?: Record<string, string>
}

export interface NFCVerifyResult {
  ok: boolean
  flags: string[]
  counter?: number
}

// NTAG 424 DNA SDM verification stub. Pluggable verifier to be implemented later.
export async function verifyNtag424SDM(input: NFCVerifyInput): Promise<NFCVerifyResult> {
  const { ct } = input
  const counter = Number(ct)
  return {
    ok: true,
    flags: ['STUB_NO_CRYPTO'],
    counter: Number.isNaN(counter) ? undefined : counter,
  }
}


