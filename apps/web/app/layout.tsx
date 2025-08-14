import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Vital Tags - Emergency Medical Information',
  description: 'Privacy-first emergency medical information system using QR codes and NFC tags',
  keywords: 'emergency, medical, information, QR code, NFC, first responders, health',
  authors: [{ name: 'Vital Tags' }],
  creator: 'Vital Tags',
  publisher: 'Vital Tags',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification codes for search engines when available
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://vitaltags.com',
    siteName: 'Vital Tags',
    title: 'Vital Tags - Emergency Medical Information',
    description: 'Privacy-first emergency medical information system using QR codes and NFC tags',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Vital Tags - Emergency Medical Information',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Vital Tags - Emergency Medical Information',
    description: 'Privacy-first emergency medical information system',
    images: ['/og-image.png'],
  },
  manifest: '/manifest.json',
  icons: {
    icon: [
      { url: '/favicon-16x16.png', sizes: '16x16', type: 'image/png' },
      { url: '/favicon-32x32.png', sizes: '32x32', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Preload critical fonts */}
        <link
          rel="preload"
          href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap"
          as="style"
          crossOrigin="anonymous"
        />
        
        {/* Security headers via meta tags */}
        <meta httpEquiv="X-Content-Type-Options" content="nosniff" />
        <meta httpEquiv="X-Frame-Options" content="DENY" />
        <meta httpEquiv="X-XSS-Protection" content="1; mode=block" />
        <meta name="referrer" content="strict-origin-when-cross-origin" />
        
        {/* Viewport for responsive design */}
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=5" />
        
        {/* Theme color for mobile browsers */}
        <meta name="theme-color" content="#ef4444" />
        
        {/* DNS prefetch for external domains */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        
        {/* Preconnect to API domain */}
        {process.env.NEXT_PUBLIC_API_BASE && (
          <link rel="preconnect" href={process.env.NEXT_PUBLIC_API_BASE} />
        )}
      </head>
      <body className={`${inter.className} h-full antialiased`}>
        <div className="min-h-full">
          {children}
        </div>

        {/* Service worker registration */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                window.addEventListener('load', function() {
                  navigator.serviceWorker.register('/sw.js')
                    .then(function(registration) {
                      console.log('SW registered: ', registration);
                    })
                    .catch(function(registrationError) {
                      console.log('SW registration failed: ', registrationError);
                    });
                });
              }
            `,
          }}
        />
      </body>
    </html>
  );
}