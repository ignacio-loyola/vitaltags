import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'VitalTags v2',
  description: 'Privacy-first emergency and clinical tags',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}


