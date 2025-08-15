import { notFound } from 'next/navigation';
import { Metadata } from 'next';
import EmergencyCard from '@/components/EmergencyCard';
import PrintButton from '@/components/PrintButton';
import { api } from '@/lib/api';
import { Suspense } from 'react';
import { ExclamationTriangleIcon } from '@heroicons/react/24/solid';

interface PageProps {
  params: {
    short_id: string;
  };
  searchParams: {
    lang?: string;
    format?: string;
  };
}

// Generate metadata for SEO and social sharing
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  try {
    // Try to fetch basic info for metadata (with minimal format to reduce load)
    const info = await api.getEmergencyInfo(params.short_id, undefined, 'minimal');
    
    return {
      title: `Emergency Medical Info - ${info.alias || 'Vital Tags'}`,
      description: 'Emergency medical information accessible via QR code. Critical information for first responders.',
      robots: 'noindex, nofollow', // Don't index for privacy
      openGraph: {
        title: `Emergency Medical Information`,
        description: 'Critical medical information for emergency responders',
        type: 'website',
      },
    };
  } catch {
    return {
      title: 'Emergency Medical Information - Vital Tags',
      description: 'Emergency medical information system',
      robots: 'noindex, nofollow',
    };
  }
}

async function fetchEmergencyInfo(shortId: string, lang?: string) {
  try {
    const info = await api.getEmergencyInfo(shortId, lang);
    return info;
  } catch (error) {
    console.error('Error fetching emergency info:', error);
    return null;
  }
}

function LoadingState() {
  return (
    <div className="emergency-container">
      <div className="container mx-auto px-4 py-8">
        <div className="emergency-card max-w-4xl mx-auto">
          <div className="emergency-header">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gray-200 rounded-full animate-pulse"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 rounded animate-pulse mb-2"></div>
                <div className="h-4 bg-gray-200 rounded animate-pulse w-32"></div>
              </div>
            </div>
          </div>
          
          {/* Loading skeleton */}
          <div className="space-y-6">
            <div className="medical-section">
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-4 w-48"></div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 p-3 rounded-lg">
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-6 bg-gray-200 rounded animate-pulse"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ErrorState({ shortId, error }: { shortId: string; error?: string }) {
  return (
    <div className="emergency-container">
      <div className="container mx-auto px-4 py-8">
        <div className="emergency-card max-w-2xl mx-auto text-center">
          <div className="emergency-header">
            <div className="flex items-center justify-center space-x-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <ExclamationTriangleIcon className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Emergency Tag Not Found
                </h1>
              </div>
            </div>
          </div>

          <div className="py-8">
            <p className="text-gray-600 mb-4">
              The emergency tag <code className="bg-gray-100 px-2 py-1 rounded">{shortId}</code> could not be found or has been disabled.
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-yellow-800 mb-2">For Emergency Responders:</h3>
              <ul className="text-sm text-yellow-700 text-left space-y-1">
                <li>• This tag may have been revoked by the owner</li>
                <li>• Check if the QR code or URL was scanned correctly</li>
                <li>• Try refreshing the page</li>
                <li>• Contact emergency services if medical attention is needed</li>
              </ul>
            </div>

            <div className="text-sm text-gray-500">
              <p>If you believe this is an error, please contact support.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default async function EmergencyPage({ params, searchParams }: PageProps) {
  const shortId = params.short_id;
  const lang = searchParams.lang;

  // Validate short_id format (basic validation)
  if (!shortId || shortId.length < 6 || shortId.length > 32) {
    notFound();
  }

  const info = await fetchEmergencyInfo(shortId, lang);

  if (!info) {
    return <ErrorState shortId={shortId} />;
  }

  return (
    <div className="emergency-container">
      <div className="container mx-auto px-4 py-8">
        <Suspense fallback={<LoadingState />}>
          <EmergencyCard info={info} shortId={shortId} />
        </Suspense>

        {/* Print button */}
        <div className="no-print mt-8 text-center">
          <PrintButton />
        </div>

        {/* Emergency services info */}
        <div className="no-print mt-8 max-w-2xl mx-auto">
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <h3 className="text-red-900 font-semibold mb-2">🚨 For Medical Emergencies:</h3>
            <p className="text-red-800 text-sm">
              This information is provided to assist medical professionals. In case of a life-threatening emergency, 
              call emergency services immediately. This system does not replace professional medical judgment.
            </p>
          </div>
        </div>

        {/* Footer info */}
        <div className="no-print mt-8 text-center text-xs text-gray-500">
          <p>
            Powered by <span className="font-semibold">Vital Tags</span> - 
            Privacy-first emergency medical information system
          </p>
        </div>
      </div>
    </div>
  );
}