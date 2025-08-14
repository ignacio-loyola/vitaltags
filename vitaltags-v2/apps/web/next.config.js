/** @type {import('next').NextConfig} */
const isDev = process.env.NODE_ENV !== 'production'
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    // In dev, allow inline/eval and ws for Next.js tooling; in prod keep strict.
    value: [
      "default-src 'self'",
      `script-src 'self'${isDev ? " 'unsafe-inline' 'unsafe-eval' blob:" : ''}`,
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data:",
      "object-src 'none'",
      "font-src 'self'",
      `connect-src 'self'${isDev ? ' ws:' : ''}`,
      `worker-src 'self'${isDev ? ' blob:' : ''}`,
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'"
    ].join('; '),
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'no-referrer' },
  {
    key: 'Permissions-Policy',
    value: [
      'accelerometer=()',
      'autoplay=()',
      'camera=()',
      'display-capture=()',
      'encrypted-media=()',
      'fullscreen=(self)',
      'geolocation=()',
      'gyroscope=()',
      'hid=()',
      'idle-detection=()',
      'magnetometer=()',
      'microphone=()',
      'midi=()',
      'payment=()',
      'picture-in-picture=()',
      'publickey-credentials-get=(self)',
      'screen-wake-lock=()',
      'serial=()',
      'usb=()',
      'xr-spatial-tracking=()'
    ].join(', '),
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig


