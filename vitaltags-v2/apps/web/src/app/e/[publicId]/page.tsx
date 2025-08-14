import Link from 'next/link'
import { headers } from 'next/headers'
import { t } from '../../../lib/i18n'
import LanguageMenu from '../../../components/LanguageMenu'

async function fetchEmergency(publicId: string) {
  const h = headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/e/${publicId}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

export default async function EmergencyPage({ params }: { params: { publicId: string } }) {
  const data = await fetchEmergency(params.publicId)
  if (!data) return <div style={{ padding: 24 }}>Not found.</div>
  const suspicious = Array.isArray(data.nfc?.flags) && data.nfc.flags.some((f: string) => f !== 'STUB_NO_CRYPTO')
  const accept = headers().get('accept-language') || 'en'
  const lang = accept.split(',')[0]?.split('-')[0] || 'en'
  return (
    <>
      <div className="topbar"><div className="topbar-inner"><div className="brand">VitalTags<span className="dot">•</span></div><div className="muted">Emergency Mode</div><LanguageMenu current={lang} /></div></div>
      <main className="container" style={{ position: 'relative' }}>
      <div className="watermark" aria-hidden>{t(lang as any, 'emergencyUseOnly')}</div>
      {suspicious && (
        <div className="banner">{t(lang as any, 'spoofWarning')}</div>
      )}
      <div className="card">
        <div className="hero">
          <h1 className="page-title">{t(lang as any, 'emergencyRecord')}</h1>
          <p className="subtitle">Immediate, critical info to assist care.</p>
          <div className="badges">
            <span className="badge">{t(lang as any, 'alias')}: <strong>{data.alias ?? '—'}</strong></span>
            <span className="badge">{t(lang as any, 'ageRange')}: <strong>{data.ageRange}</strong></span>
          </div>
        </div>
        <section className="section">
          <h2>{t(lang as any, 'criticalAllergies')}</h2>
          <ul className="list">{data.criticalAllergies.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
        </section>
        <section className="section">
          <h2>{t(lang as any, 'criticalConditions')}</h2>
          <ul className="list">{data.criticalConditions.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
        </section>
        <section className="section">
          <h2>{t(lang as any, 'criticalMeds')}</h2>
          <ul className="list">{data.criticalMeds.map((a: string, i: number) => <li key={i}>{a}</li>)}</ul>
        </section>
        <div className="grid-2">
          <div className="card" style={{ borderStyle: 'dashed' }}>
            <div className="muted">{t(lang as any, 'iceContact')}</div>
            <div style={{ fontWeight: 800, fontSize: 18 }}>{data.icePhone}</div>
            <div className="cta-row"><a className="btn btn-danger" href={`tel:${encodeURIComponent(data.icePhone)}`}>{t(lang as any, 'callICE')}</a></div>
          </div>
          <div className="card">
            <div className="muted">Need full clinical details?</div>
            <div className="cta-row"><Link className="btn btn-primary" href={`/e/${params.publicId}/request`} prefetch={false}>{t(lang as any, 'requestDetails')}</Link></div>
          </div>
        </div>
        <div className="footer-note">{t(lang as any, 'notIndexed')}</div>
      </div>
      <FloatingICEButton phone={data.icePhone} label={t(lang as any, 'callICE')} />
      </main>
      <div className="emergency-sticky">{t(lang as any, 'emergencyUseOnly')}</div>
    </>
  )
}

function FloatingICEButton({ phone, label }: { phone: string; label: string }) {
  return (
    <a href={`tel:${encodeURIComponent(phone)}`} style={{ position: 'fixed', right: 16, bottom: 80, background: 'var(--danger)', color: '#fff', padding: '14px 16px', borderRadius: 9999, boxShadow: '0 8px 18px rgba(220,38,38,0.35)', textDecoration: 'none', fontWeight: 800 }}>
      {label}
    </a>
  )
}


