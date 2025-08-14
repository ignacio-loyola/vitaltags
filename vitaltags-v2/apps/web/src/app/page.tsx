import Link from 'next/link'
import { getSessionUser } from '../lib/auth'

export default async function Home() {
  const user = await getSessionUser()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                VitalTags
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              {user ? (
                <>
                  <span className="text-gray-700">Welcome, {user.email}</span>
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Dashboard
                  </Link>
                  <form action="/api/auth/logout" method="POST" className="inline">
                    <button
                      type="submit"
                      className="text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Logout
                    </button>
                  </form>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    className="text-gray-600 hover:text-gray-800 transition-colors"
                  >
                    Login
                  </Link>
                  <Link
                    href="/register"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>

      <main>
        {/* Hero Section */}
        <div className="relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
            <div className="text-center">
              <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
                Emergency Medical Information
                <span className="block text-indigo-600">When Every Second Counts</span>
              </h1>
              <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
                VitalTags provides instant access to critical medical information during emergencies. 
                Store conditions, allergies, and medications with tiered privacy protection.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {user ? (
                  <Link
                    href="/dashboard"
                    className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                  >
                    Go to Dashboard
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/register"
                      className="bg-indigo-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-indigo-700 transition-colors"
                    >
                      Get Started Free
                    </Link>
                    <Link
                      href="/demo"
                      className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition-colors"
                    >
                      View Demo
                    </Link>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="bg-white py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Designed for Emergency Situations
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Quick access to life-saving information when medical professionals need it most.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Secure & Private</h3>
                <p className="text-gray-600">
                  Your medical data is encrypted and protected with enterprise-grade security. 
                  Control what information is shared publicly vs. privately.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Instant Access</h3>
                <p className="text-gray-600">
                  Emergency responders can access critical information instantly via QR code or NFC tag. 
                  No app downloads required.
                </p>
              </div>

              <div className="text-center p-6">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Complete Medical Profile</h3>
                <p className="text-gray-600">
                  Store conditions, allergies, medications, and emergency contacts. 
                  Smart autocomplete helps you add information quickly.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-indigo-600 py-16">
          <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-white mb-4">
              Ready to Create Your Emergency Profile?
            </h2>
            <p className="text-xl text-indigo-200 mb-8">
              Join thousands who trust VitalTags to keep their medical information safe and accessible.
            </p>
            {!user && (
              <Link
                href="/register"
                className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
              >
                Sign Up Now - It's Free
              </Link>
            )}
          </div>
        </div>
      </main>

      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold">VitalTags</span>
              <p className="text-gray-400 mt-2">Emergency medical information when it matters most.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/demo" className="text-gray-400 hover:text-white transition-colors">
                Demo
              </Link>
              <Link href="/healthz" className="text-gray-400 hover:text-white transition-colors">
                Status
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}


