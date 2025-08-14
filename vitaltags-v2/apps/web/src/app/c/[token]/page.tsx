"use client"
import { useEffect, useState } from 'react'

export default function ClinicalPage({ params }: { params: { token: string } }) {
  const [data, setData] = useState<any | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [expired, setExpired] = useState(false)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch(`/api/c/${params.token}`, { cache: 'no-store' })
        if (!res.ok) throw new Error('failed')
        const json = await res.json()
        if (!cancelled) setData(json)
      } catch {
        if (!cancelled) setError('This access link may have expired. If needed, request access again.')
        setExpired(true)
      }
    })()
    return () => { cancelled = true }
  }, [params.token])

  if (error) {
    return <div className="container"><div className="card"><p>{error}</p></div></div>
  }
  if (!data) return <div className="container"><div className="card">Loading…</div></div>

  return (
    <main className="container">
      <div className="card">
      <h1 className="page-title">Clinical view (time-boxed)</h1>
      <RedactedItem label="Identity" value={data.identity} />
      <RedactedItem label="History" value={data.history} />
      <RedactedItem label="Documents" value={data.docs} />
      {expired && <p style={{ color: '#a00' }}>Link expired.</p>}
      </div>
    </main>
  )
}

function RedactedItem({ label, value }: { label: string; value: string }) {
  const [reveal, setReveal] = useState(false)
  return (
    <section className="section">
      <h2>{label}</h2>
      {reveal ? <div className="redacted" style={{ whiteSpace: 'pre-wrap' }}>{value}</div> : <button className="reveal-btn" onClick={() => setReveal(true)}>Click to reveal</button>}
    </section>
  )
}


