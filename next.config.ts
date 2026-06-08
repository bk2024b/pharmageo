// next.config.ts

import type { NextConfig } from 'next'
const withPWA = require('@ducanh2912/next-pwa').default

const nextConfig: NextConfig = {
  images: {
    domains: ['unpkg.com'],
  },
  turbopack: {},
}

module.exports = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  cacheOnFrontEndNav: true,
  aggressiveFrontEndNavCaching: true,
  reloadOnOnline: true,
  workboxOptions: {
    disableDevLogs: true,
    runtimeCaching: [
      {
        urlPattern: /^https:\/\/[a-c]\.tile\.openstreetmap\.org\/.*/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'osm-tiles',
          expiration: {
            maxEntries: 200,
            maxAgeSeconds: 60 * 60 * 24 * 7,
          },
        },
      },
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
      {
        urlPattern: /\/api\/medications\/search/i,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'api-medications',
          expiration: {
            maxEntries: 30,
            maxAgeSeconds: 60 * 2,
          },
          networkTimeoutSeconds: 5,
        },
      },
      {
        urlPattern: /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/i,
        handler: 'CacheFirst',
        options: {
          cacheName: 'static-images',
          expiration: {
            maxEntries: 100,
            maxAgeSeconds: 60 * 60 * 24 * 30,
          },
        },
      },
    ],
  },
})(nextConfig)