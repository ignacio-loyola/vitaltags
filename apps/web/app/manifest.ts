import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Vital Tags - Emergency Medical Information',
    short_name: 'Vital Tags',
    description: 'Privacy-first emergency medical information system using QR codes and NFC tags',
    start_url: '/',
    display: 'minimal-ui',
    background_color: '#ffffff',
    theme_color: '#ef4444',
    orientation: 'portrait',
    scope: '/',
    lang: 'en',
    categories: ['health', 'medical', 'emergency', 'safety'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}