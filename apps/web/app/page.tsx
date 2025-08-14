import Link from 'next/link';
import { 
  ShieldCheckIcon, 
  QrCodeIcon, 
  HeartIcon, 
  GlobeAltIcon,
  UserGroupIcon,
  ClockIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-red-50 via-white to-orange-50">
      {/* Header */}
      <header className="relative z-10">
        <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center">
                    <HeartIcon className="w-5 h-5 text-white" />
                  </div>
                  <span className="text-xl font-bold text-gray-900">Vital Tags</span>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/login"
                className="text-gray-600 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
              <Link
                href="/signup"
                className="bg-red-500 text-white hover:bg-red-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Get Started
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main>
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
              Emergency Medical Information
              <span className="block text-red-600">When Every Second Counts</span>
            </h1>
            <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-gray-600">
              Privacy-first emergency medical information system using QR codes and NFC tags. 
              Give first responders instant access to your critical medical information.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/signup"
                className="rounded-md bg-red-600 px-6 py-3 text-base font-semibold text-white shadow-sm hover:bg-red-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-600 transition-colors"
              >
                Create Your Emergency Tag
              </Link>
              <Link
                href="#how-it-works"
                className="text-base font-semibold leading-6 text-gray-900 hover:text-red-600 transition-colors"
              >
                Learn more <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>

          {/* Demo QR Code Section */}
          <div className="mt-16 text-center">
            <p className="text-sm font-medium text-gray-600 mb-4">
              See a demo emergency page:
            </p>
            <div className="inline-flex items-center justify-center p-4 bg-white rounded-lg border-2 border-gray-200 shadow-sm">
              <QrCodeIcon className="w-16 h-16 text-gray-400" />
            </div>
            <p className="mt-2 text-xs text-gray-500">
              Scan with your camera or{' '}
              <Link href="/e/demo123" className="text-red-600 hover:text-red-500 underline">
                click here for demo
              </Link>
            </p>
          </div>
        </div>

        {/* Features Section */}
        <div id="how-it-works" className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg leading-8 text-gray-600">
              Simple, secure, and life-saving emergency medical information system
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {[
              {
                icon: UserGroupIcon,
                title: 'Create Your Profile',
                description: 'Add your medical conditions, allergies, medications, and emergency contacts with field-level privacy controls.',
              },
              {
                icon: QrCodeIcon,
                title: 'Generate Your Tag',
                description: 'Get QR codes and printable tags for your wallet, phone case, or medical jewelry.',
              },
              {
                icon: ShieldCheckIcon,
                title: 'Emergency Access',
                description: 'First responders can scan your tag to instantly access your critical medical information.',
              },
              {
                icon: ClockIcon,
                title: 'Real-time Updates',
                description: 'Update your information anytime. Changes are immediately available to emergency responders.',
              },
              {
                icon: GlobeAltIcon,
                title: 'Works Everywhere',
                description: 'No apps required. Works with any smartphone camera or QR code scanner worldwide.',
              },
              {
                icon: HeartIcon,
                title: 'Privacy First',
                description: 'You control what information is public. GDPR compliant with data minimization principles.',
              },
            ].map((feature, index) => (
              <div key={index} className="text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <feature.icon className="h-8 w-8 text-red-600" aria-hidden="true" />
                </div>
                <h3 className="mt-6 text-lg font-semibold leading-7 text-gray-900">
                  {feature.title}
                </h3>
                <p className="mt-2 text-base leading-7 text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Use Cases Section */}
        <div className="bg-gray-50 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Perfect For
              </h2>
            </div>

            <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
              {[
                {
                  title: 'Athletes & Cyclists',
                  description: 'Carry your medical info during sports and outdoor activities.',
                  icon: '🚴‍♀️',
                },
                {
                  title: 'Elderly Care',
                  description: 'Peace of mind for seniors and their families.',
                  icon: '👵',
                },
                {
                  title: 'School Children',
                  description: 'Keep kids safe with easily accessible medical information.',
                  icon: '👶',
                },
                {
                  title: 'Travelers',
                  description: 'Access to medical info anywhere in the world.',
                  icon: '✈️',
                },
              ].map((useCase, index) => (
                <div key={index} className="text-center">
                  <div className="text-4xl mb-4">{useCase.icon}</div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {useCase.title}
                  </h3>
                  <p className="text-gray-600">{useCase.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-red-600 py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="mx-auto max-w-2xl text-center">
              <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to Create Your Emergency Tag?
              </h2>
              <p className="mt-6 text-lg leading-8 text-red-100">
                Join thousands of people who trust Vital Tags with their emergency medical information.
              </p>
              <div className="mt-10 flex items-center justify-center gap-x-6">
                <Link
                  href="/signup"
                  className="rounded-md bg-white px-6 py-3 text-base font-semibold text-red-600 shadow-sm hover:bg-red-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-colors"
                >
                  Get Started Free
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                <HeartIcon className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold text-gray-900">Vital Tags</span>
            </div>
            <p className="text-sm text-gray-600">
              Privacy-first emergency medical information system.
            </p>
            <p className="mt-2 text-xs text-gray-500">
              © {new Date().getFullYear()} Vital Tags. Made with ❤️ for emergency responders worldwide.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}