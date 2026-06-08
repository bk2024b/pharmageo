// scripts/generate-icons.mjs

import sharp from 'sharp'
import { mkdirSync } from 'fs'

mkdirSync('public/icons', { recursive: true })

const sizes = [16, 32, 72, 96, 128, 144, 152, 192, 384, 512]

for (const size of sizes) {
  await sharp('public/logo-source.png')
    .resize(size, size)
    .png()
    .toFile(`public/icons/icon-${size}x${size}.png`)

  console.log(`✓ icon-${size}x${size}.png`)
}

// Favicon ICO (32x32)
await sharp('public/logo-source.png')
  .resize(32, 32)
  .png()
  .toFile('public/favicon.ico')

console.log('✓ favicon.ico')
console.log('Tous les icônes générés !')