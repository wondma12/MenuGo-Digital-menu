const fs = require('fs')
const path = require('path')

function walk(dir) {
  const files = fs.readdirSync(dir)
  files.forEach((file) => {
    const full = path.join(dir, file)
    const stat = fs.statSync(full)
    if (stat.isDirectory()) {
      walk(full)
    } else if (/\.(jsx|js|tsx|ts)$/.test(full)) {
      processFile(full)
    }
  })
}

function processFile(filePath) {
  let src = fs.readFileSync(filePath, 'utf8')
  const importReactRegex = /^import\s+React(?:\s*,\s*\{([\s\S]*?)\})?\s+from\s+['\"]react['\"];?/m
  const importReactOnlyRegex = /^import\s+React\s+from\s+['\"]react['\"];?/m
  const importReactNamedRegex = /^import\s+React\s*,\s*\{([\s\S]*?)\}\s+from\s+['\"]react['\"];?/m

  if (importReactRegex.test(src)) {
    // Check if "React" is used anywhere else (e.g., React.createElement or React.Something)
    const withoutImport = src.replace(importReactRegex, '')
    if (!/\bReact\b/.test(withoutImport)) {
      // Safe to remove default import
      if (importReactNamedRegex.test(src)) {
        // Keep named imports
        src = src.replace(importReactNamedRegex, (m, named) => {
          return `import {${named.trim()}} from 'react'`
        })
      } else if (importReactOnlyRegex.test(src)) {
        src = src.replace(importReactOnlyRegex, '')
      } else {
        src = src.replace(importReactRegex, (m, named) => {
          if (named) return `import {${named.trim()}} from 'react'`
          return ''
        })
      }
      fs.writeFileSync(filePath, src, 'utf8')
      console.log('Updated', filePath)
    }
  }
}

const root = path.join(__dirname, '..', 'src')
walk(root)
console.log('Done')
