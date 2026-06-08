// app/layout.tsx

import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  metadataBase: new URL('https://pharmageo.vercel.app'),
  title: {
    default: 'PharmaGéo — Pharmacies à Cotonou',
    template: '%s — PharmaGéo',
  },
  description: 'Trouvez les pharmacies de garde et médicaments disponibles près de vous à Cotonou, Bénin.',
  keywords: ['pharmacie', 'garde', 'cotonou', 'bénin', 'médicaments', 'santé'],
  authors: [{ name: 'PharmaGéo' }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'PharmaGéo',
  },
  formatDetection: {
    telephone: true,
  },
  openGraph: {
    type: 'website',
    siteName: 'PharmaGéo',
    title: 'PharmaGéo — Pharmacies à Cotonou',
    description: 'Trouvez les pharmacies de garde et médicaments disponibles près de vous.',
    locale: 'fr_BJ',
  },
  twitter: {
    card: 'summary',
    title: 'PharmaGéo',
    description: 'Pharmacies de garde et médicaments à Cotonou',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [
      { url: '/icons/icon-152x152.png', sizes: '152x152', type: 'image/png' },
      { url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#16A34A',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <head>
        {/* iOS PWA */}
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PharmaGéo" />

        {/* Splash screens iOS */}
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-750x1334.png"
          media="(device-width: 375px) and (device-height: 667px)"
        />
        <link
          rel="apple-touch-startup-image"
          href="/icons/splash-1170x2532.png"
          media="(device-width: 390px) and (device-height: 844px)"
        />

        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
      </head>
      <body className={inter.className}>
        {children}
      </body>
    </html>
  )
}