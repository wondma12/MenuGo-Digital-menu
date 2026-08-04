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

// Also create nested index.html files for routes that static hosts may request
// directly (e.g. /admin/dashboard). This ensures a 200-served HTML for those
// paths even when the host doesn't support SPA rewrites.
const ensureNestedIndex = (routePath) => {
  const parts = routePath.replace(/^\/+|\/+$/g, '').split('/')
  const dir = path.join(distDir, ...parts)
  try {
    fs.mkdirSync(dir, { recursive: true })
    const target = path.join(dir, 'index.html')
    fs.copyFileSync(indexFile, target)
    console.log(`Copied index.html -> ${path.relative(distDir, target)}`)
  } catch (err) {
    console.warn('Failed to create nested index for', routePath, err && err.message)
  }
}

const routesToCreate = [
  '/admin',
  '/admin/dashboard',
  '/admin/login',
  '/admin/*'
]

routesToCreate.forEach(r => ensureNestedIndex(r))
