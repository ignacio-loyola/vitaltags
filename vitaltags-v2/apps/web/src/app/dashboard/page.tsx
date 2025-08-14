import { getSessionUser } from '../../lib/auth'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <main style={{ padding: 24 }}>
        <h1>Dashboard</h1>
        <p>You are not signed in.</p>
        <Link href="/">Home</Link>
      </main>
    )
  }
  return (
    <main style={{ padding: 24 }}>
      <h1>Dashboard</h1>
      <p>Signed in as {user.email}</p>
      <ul>
        <li><Link href="/dashboard/profile">Edit profile</Link></li>
        <li><Link href="/dashboard/audit">View access logs</Link></li>
      </ul>
    </main>
  )
}


