import Link from 'next/link'
import { headers } from 'next/headers'
import { t } from '../../../../lib/i18n'
import { prisma } from '../../../../lib/db'

async function fetchEmergency(publicId: string) {
  const h = headers()
  const host = h.get('host') || 'localhost:3000'
  const proto = h.get('x-forwarded-proto') || 'http'
  const base = `${proto}://${host}`
  const res = await fetch(`${base}/api/e/${publicId}`, { cache: 'no-store' })
  if (!res.ok) return null
  return res.json()
}

async function fetchDetailedMedicalInfo(publicId: string) {
  // Get the full profile with all medical terms
  const profile = await prisma.profile.findUnique({
    where: { publicId },
    include: {
      conditions: {
        orderBy: { createdAt: 'desc' }
      },
      medications: {
        orderBy: { createdAt: 'desc' }
      },
      allergies: {
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  return profile
}

export default async function DetailsPage({ params }: { params: { publicId: string } }) {
  const data = await fetchEmergency(params.publicId)
  const detailedInfo = await fetchDetailedMedicalInfo(params.publicId)
  
  if (!data || !detailedInfo) return <div style={{ padding: 24 }}>Not found.</div>
  
  // Check if break-glass access is allowed
  if (!data.allowBreakGlass) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-xl border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">
            The profile owner has disabled break-glass access to detailed medical information.
          </p>
          <Link
            href={`/e/${params.publicId}`}
            className="bg-indigo-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
          >
            Back to Emergency Info
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100">
      <nav className="bg-white shadow-sm border-b border-red-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-red-600">
                VitalTags
              </Link>
              <span className="ml-4 text-gray-500">Detailed Medical Information</span>
            </div>
            <div className="flex items-center space-x-4">
              <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm font-semibold">
                🚨 BREAK-GLASS ACCESS
              </span>
              <Link
                href={`/e/${params.publicId}`}
                className="text-gray-600 hover:text-gray-800 transition-colors"
              >
                Back to Emergency
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-red-100 border border-red-300 rounded-lg p-4 mb-8">
          <div className="flex items-start">
            <svg className="w-6 h-6 text-red-600 mt-0.5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <div>
              <h3 className="text-red-800 font-bold text-lg">EMERGENCY BREAK-GLASS ACCESS ACTIVATED</h3>
              <p className="text-red-700 mt-1">
                You are viewing detailed medical information that may be critical for emergency treatment. 
                This access has been logged and the profile owner will be notified.
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Patient Overview */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Patient Overview</h2>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Name/Alias:</span>
                <span className="text-gray-900">{data.alias || 'Not provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Age Range:</span>
                <span className="text-gray-900">{data.ageRange}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Emergency Contact:</span>
                <a href={`tel:${encodeURIComponent(data.icePhone)}`} className="text-red-600 font-semibold hover:text-red-700">
                  {data.icePhone}
                </a>
              </div>
              <div className="flex justify-between">
                <span className="font-medium text-gray-700">Profile ID:</span>
                <span className="text-gray-600 font-mono text-sm">{data.publicId}</span>
              </div>
            </div>
          </div>

          {/* Critical Allergies */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-red-600 mb-4">⚠️ Critical Allergies</h2>
            {detailedInfo.allergies.length > 0 ? (
              <div className="space-y-4">
                {detailedInfo.allergies.map((allergy) => (
                  <div key={allergy.id} className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex justify-between items-start">
                      <h3 className="font-bold text-lg text-gray-900">{allergy.name_en}</h3>
                      {allergy.criticality && (
                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                          allergy.criticality === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {allergy.criticality.toUpperCase()} RISK
                        </span>
                      )}
                    </div>
                    {allergy.note && (
                      <p className="text-gray-600 mt-1">{allergy.note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No known allergies on record</p>
            )}
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8 mt-8">
          {/* Medical Conditions */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-blue-600 mb-4">🏥 Medical Conditions</h2>
            {detailedInfo.conditions.length > 0 ? (
              <div className="space-y-4">
                {detailedInfo.conditions.map((condition) => (
                  <div key={condition.id} className="border-l-4 border-blue-500 pl-4 py-2">
                    <h3 className="font-bold text-lg text-gray-900">{condition.name_en}</h3>
                    {condition.onsetDate && (
                      <p className="text-sm text-gray-500 mt-1">
                        Onset: {new Date(condition.onsetDate).toLocaleDateString()}
                      </p>
                    )}
                    {condition.note && (
                      <p className="text-gray-600 mt-1">{condition.note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medical conditions on record</p>
            )}
          </div>

          {/* Current Medications */}
          <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-2xl font-bold text-green-600 mb-4">💊 Current Medications</h2>
            {detailedInfo.medications.length > 0 ? (
              <div className="space-y-4">
                {detailedInfo.medications.map((medication) => (
                  <div key={medication.id} className="border-l-4 border-green-500 pl-4 py-2">
                    <h3 className="font-bold text-lg text-gray-900">{medication.name_en}</h3>
                    {medication.doseText && (
                      <p className="text-sm text-gray-700 font-medium mt-1">Dosage: {medication.doseText}</p>
                    )}
                    {medication.note && (
                      <p className="text-gray-600 mt-1">{medication.note}</p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500">No medications on record</p>
            )}
          </div>
        </div>

        <div className="mt-8 bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-amber-800 font-semibold text-lg mb-2">⚠️ Important Medical Notes</h3>
          <ul className="text-amber-700 space-y-1">
            <li>• This information is current as of the last profile update</li>
            <li>• Always verify critical allergies before administering any medications</li>
            <li>• Contact the emergency contact for additional information if needed</li>
            <li>• This access has been logged for audit and security purposes</li>
          </ul>
        </div>

        <div className="mt-8 flex justify-center space-x-4">
          <Link
            href={`/e/${params.publicId}`}
            className="bg-gray-100 text-gray-700 px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors"
          >
            Back to Emergency Info
          </Link>
          <a
            href={`tel:${encodeURIComponent(data.icePhone)}`}
            className="bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Call Emergency Contact
          </a>
        </div>
      </div>
    </div>
  )
}