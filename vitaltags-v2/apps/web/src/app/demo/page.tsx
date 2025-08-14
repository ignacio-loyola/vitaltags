import Link from 'next/link'
import { AutocompleteDemo } from '../../components/AutocompleteDemo'

export default function Demo() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-2xl font-bold text-indigo-600">
                VitalTags
              </Link>
              <span className="ml-4 text-gray-500">Demo</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/register"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
              >
                Sign Up
              </Link>
            </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            VitalTags Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Experience our smart autocomplete system for medical information. 
            Type partial words to see instant suggestions from our curated database.
          </p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl shadow-indigo-100/25 border border-gray-100 overflow-hidden mb-12">
          <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
            <h2 className="text-2xl font-bold text-white mb-2">Interactive Medical Autocomplete</h2>
            <p className="text-indigo-100">
              Try typing medical terms below to see our intelligent suggestions in action
            </p>
          </div>
          
          <div className="p-8">
            <AutocompleteDemo />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-8 mb-12">
          <div className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-indigo-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Lightning Fast</h3>
            </div>
            <p className="text-gray-600">
              Get instant suggestions as you type. Our autocomplete system searches through 
              thousands of medical terms in milliseconds, helping you add information quickly and accurately.
            </p>
          </div>

          <div className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-8">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mr-4">
                <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Medically Accurate</h3>
            </div>
            <p className="text-gray-600">
              Our database includes the most common medical conditions, allergies, and medications, 
              ensuring you can find the right terms quickly without spelling errors.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-lg shadow-indigo-100/25 border border-gray-100 p-8 mb-12">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">How It Works</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-blue-600">1</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Start Typing</h4>
              <p className="text-gray-600">Type just a few letters of a medical term</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-purple-600">2</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">See Suggestions</h4>
              <p className="text-gray-600">Instantly view matching medical terms</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl font-bold text-green-600">3</span>
              </div>
              <h4 className="text-lg font-semibold text-gray-900 mb-2">Select & Add</h4>
              <p className="text-gray-600">Click or press Enter to add to your profile</p>
            </div>
          </div>
        </div>

        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-center">
          <h3 className="text-3xl font-bold text-white mb-4">
            Ready to Create Your Medical Profile?
          </h3>
          <p className="text-indigo-100 text-lg mb-8 max-w-2xl mx-auto">
            Join VitalTags today and ensure your critical medical information is always accessible 
            to emergency responders when you need it most.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/register"
              className="bg-white text-indigo-600 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-gray-50 transition-colors"
            >
              Sign Up Free
            </Link>
            <Link
              href="/"
              className="border-2 border-white text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/10 transition-colors"
            >
              Learn More
            </Link>
          </div>
        </div>
      </div>

      <footer className="bg-gray-800 text-white py-8 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <span className="text-2xl font-bold">VitalTags</span>
              <p className="text-gray-400 mt-2">Emergency medical information when it matters most.</p>
            </div>
            <div className="flex space-x-6">
              <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                Home
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