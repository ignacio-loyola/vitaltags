import { getSessionUser } from '../../lib/auth'
import { prisma } from '../../lib/db'
import Link from 'next/link'

export default async function DashboardPage() {
  const user = await getSessionUser()
  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">You are not signed in.</p>
          <Link href="/" className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors">
            Go Home
          </Link>
        </div>
      </div>
    )
  }

  // Get user's profiles
  const profiles = await prisma.profile.findMany({
    where: { userId: user.id },
    include: {
      conditions: { take: 5 },
      medications: { take: 5 },
      allergies: { take: 5 },
    }
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                VitalTags
              </Link>
              <span className="ml-4 text-gray-500">Dashboard</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">Welcome, {user.email}</span>
              <form action="/api/auth/logout" method="POST" className="inline">
                <button
                  type="submit"
                  className="text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Manage your emergency medical profiles</p>
        </div>

        {profiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-8 text-center">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Create Your First Profile</h2>
            <p className="text-gray-600 mb-6">
              Set up your emergency medical profile to ensure critical information is accessible when needed.
            </p>
            <Link
              href="/dashboard/profile/new"
              className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
            >
              Create Profile
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {profiles.map((profile) => (
              <div key={profile.id} className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {profile.alias || 'Medical Profile'}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                    profile.revoked 
                      ? 'bg-red-100 text-red-800' 
                      : 'bg-green-100 text-green-800'
                  }`}>
                    {profile.revoked ? 'Revoked' : 'Active'}
                  </span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Age Range:</span>
                    <span className="ml-2">{profile.ageRange}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <span className="font-medium">Public ID:</span>
                    <span className="ml-2 font-mono text-xs">{profile.publicId}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4">
                  <div className="text-center p-2 bg-blue-50 rounded-lg">
                    <div className="text-lg font-bold text-blue-600">{profile.conditions.length}</div>
                    <div className="text-xs text-blue-800">Conditions</div>
                  </div>
                  <div className="text-center p-2 bg-red-50 rounded-lg">
                    <div className="text-lg font-bold text-red-600">{profile.allergies.length}</div>
                    <div className="text-xs text-red-800">Allergies</div>
                  </div>
                  <div className="text-center p-2 bg-green-50 rounded-lg">
                    <div className="text-lg font-bold text-green-600">{profile.medications.length}</div>
                    <div className="text-xs text-green-800">Medications</div>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Link
                    href={`/dashboard/profile/${profile.id}/edit`}
                    className="flex-1 bg-indigo-600 text-white px-3 py-2 rounded-lg text-sm font-semibold text-center hover:bg-indigo-700 transition-colors"
                  >
                    Edit
                  </Link>
                  <Link
                    href={`/e/${profile.publicId}`}
                    className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-lg text-sm font-semibold text-center hover:bg-gray-200 transition-colors"
                  >
                    View Public
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          <Link
            href="/dashboard/profile/new"
            className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-indigo-200 transition-colors">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">New Profile</h3>
            </div>
            <p className="text-gray-600">Create a new emergency medical profile</p>
          </Link>

          <Link
            href="/dashboard/audit"
            className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-blue-200 transition-colors">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Access Logs</h3>
            </div>
            <p className="text-gray-600">View who has accessed your profiles</p>
          </Link>

          <Link
            href="/demo"
            className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-6 hover:shadow-xl transition-shadow group"
          >
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mr-4 group-hover:bg-purple-200 transition-colors">
                <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Demo</h3>
            </div>
            <p className="text-gray-600">Try the autocomplete demo</p>
          </Link>
        </div>
      </div>
    </div>
  )
}


