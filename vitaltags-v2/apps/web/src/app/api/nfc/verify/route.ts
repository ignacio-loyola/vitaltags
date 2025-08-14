import { NextRequest, NextResponse } from 'next/server'
import { verifyNtag424SDM, type NFCVerifyInput } from '../../../../lib/nfc'

export async function POST(req: NextRequest) {
  // Parse JSON body without logging PII
  let body: NFCVerifyInput
  try {
    body = (await req.json()) as NFCVerifyInput
  } catch {
    return NextResponse.json({ error: 'bad_json' }, { status: 400 })
  }

  const result = await verifyNtag424SDM(body)

  // Log ok=false as a risk (avoid PII; include only publicId and flags)
  if (!result.ok) {
    console.warn('[NFC_VERIFY_FAIL]', {
      publicId: body.publicId,
      flags: result.flags,
    })
  }

  return NextResponse.json({ ok: result.ok, flags: result.flags, counter: result.counter })
}


