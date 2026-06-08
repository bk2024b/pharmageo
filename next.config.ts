// next.config.ts

import type { NextConfig } from 'next'

const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  runtimeCaching: [
    // Cache les tuiles OpenStreetMap
    {
      urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'osm-tiles',
        expiration: {
          maxEntries: 200,
          maxAgeSeconds: 60 * 60 * 24 * 7, // 7 jours
        },
      },
    },
    // Cache les appels API pharmacies
    {
      urlPattern: /^https:\/\/.*\.supabase\.co\/rest\/v1\/pharmacies.*/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'supabase-pharmacies',
        expiration: {
          maxEntries: 50,
          maxAgeSeconds: 60 * 5, // 5 minutes
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache les appels API guard
    {
      urlPattern: /\/api\/pharmacies\/guard/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-guard',
        expiration: {
          maxEntries: 10,
          maxAgeSeconds: 60 * 5,
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache les appels API nearby
    {
      urlPattern: /\/api\/pharmacies\/nearby/i,
      handler: 'NetworkFirst',
      options: {
        cacheName: 'api-nearby',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 2,
        },
        networkTimeoutSeconds: 5,
      },
    },
    // Cache les assets statiques
    {
      urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-images',
        expiration: {
          maxEntries: 100,
          maxAgeSeconds: 60 * 60 * 24 * 30, // 30 jours
        },
      },
    },
    // Cache les fonts
    {
      urlPattern: /\.(?:woff|woff2|ttf|eot)$/i,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-fonts',
        expiration: {
          maxEntries: 20,
          maxAgeSeconds: 60 * 60 * 24 * 365, // 1 an
        },
      },
    },
  ],
})

const nextConfig: NextConfig = {
  images: {
    domains: ['unpkg.com'],
  },
}

module.exports = withPWA(nextConfig)