// app/layout.tsx

import type { Metadata, Viewport } from 'next'
import './globals.css'

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
  formatDetection: { telephone: true },
  openGraph: {
    type: 'website',
    siteName: 'PharmaGéo',
    title: 'PharmaGéo — Pharmacies à Cotonou',
    description: 'Trouvez les pharmacies de garde et médicaments disponibles près de vous.',
    locale: 'fr_BJ',
  },
  icons: {
    icon: [
      { url: '/icons/icon-32x32.png', sizes: '32x32', type: 'image/png' },
      { url: '/icons/icon-16x16.png', sizes: '16x16', type: 'image/png' },
    ],
    apple: [{ url: '/icons/icon-192x192.png', sizes: '192x192', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#008751',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="PharmaGéo" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/icons/icon-32x32.png" type="image/png" sizes="32x32" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <script dangerouslySetInnerHTML={{
          __html: `
            if ('serviceWorker' in navigator) {
              window.addEventListener('load', function() {
                navigator.serviceWorker.register('/sw.js').catch(function() {});
              });
            }
          `
        }} />
      </head>
      <body>
        {children}
      </body>
    </html>
  )
}