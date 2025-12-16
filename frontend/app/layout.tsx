import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Rakeback MVP',
  description: 'Long-Term Cashback System - Rakeback MVP',
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

