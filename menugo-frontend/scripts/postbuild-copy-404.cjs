const fs = require('fs')
const path = require('path')

const distDir = path.resolve(__dirname, '..', 'dist')
const indexFile = path.join(distDir, 'index.html')
const fallbackFile = path.join(distDir, '404.html')

if (!fs.existsSync(distDir)) {
  console.error('dist directory not found. Run build first.')
  process.exit(1)
}

if (!fs.existsSync(indexFile)) {
  console.error('index.html not found in dist. Run build first.')
  process.exit(1)
}

fs.copyFileSync(indexFile, fallbackFile)
console.log('Copied index.html -> 404.html for SPA fallback')
