import { getSessionUser } from '../../../lib/auth'
import { prisma } from '../../../lib/db'

export default async function AuditPage() {
  const user = await getSessionUser()
  if (!user) return <div className="container"><div className="card">Not signed in.</div></div>
  const profile = await prisma.profile.findFirst({ where: { userId: user.id } })
  if (!profile) return <div className="container"><div className="card">No profile yet.</div></div>
  const logs = await prisma.auditLog.findMany({ where: { profileId: profile.id }, orderBy: { createdAt: 'desc' }, take: 200 })
  return (
    <main className="container">
      <div className="card">
        <h1 className="page-title">Access logs</h1>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ textAlign: 'left' }}><th>Time</th><th>Event</th><th>Country</th></tr>
          </thead>
          <tbody>
            {logs.map((l) => (
              <tr key={l.id} style={{ borderTop: '1px solid #e2e8f0' }}>
                <td>{new Date(l.createdAt).toLocaleString()}</td>
                <td>{l.event}</td>
                <td>{l.country ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}


