import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'
import axios from 'axios'
import http from 'http'
import https from 'https'

const normalizeProxyUrl = (url) => {
  if (!url) return url
  return url.replace(/\/api\/?$/, '').replace(/\/$/, '')
}

const probeHealth = async (baseUrl, timeoutMs = 900) => {
  if (!baseUrl) return false
  try {
    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), timeoutMs)
    const healthUrl = new URL('/api/health', baseUrl).toString()
    const response = await fetch(healthUrl, { signal: controller.signal })
    clearTimeout(timer)
    return response.ok
  } catch (error) {
    return false
  }
}

const uniqueCandidates = (values) => {
  const seen = new Set()
  return values.filter((value) => {
    if (!value) return false
    const normalized = normalizeProxyUrl(value)
    if (!normalized || seen.has(normalized)) return false
    seen.add(normalized)
    return true
  })
}

const resolveBackendUrl = async (env) => {
  const configuredUrl = normalizeProxyUrl(env.VITE_API_URL || env.API_URL || '')
  const runtimeUrlPath = path.resolve(__dirname, '..', 'runtime_api_url.txt')
  let runtimeUrl = ''

  try {
    if (fs.existsSync(runtimeUrlPath)) {
      runtimeUrl = normalizeProxyUrl(fs.readFileSync(runtimeUrlPath, 'utf8').trim())
    }
  } catch (error) {
    runtimeUrl = ''
  }

  const fallbackPorts = [5003, 5004, 5000, 5001, 5002, 5005]
  const fallbackUrls = fallbackPorts.flatMap((port) => [`http://127.0.0.1:${port}`, `http://localhost:${port}`])
  const candidates = uniqueCandidates([
    configuredUrl,
    runtimeUrl,
    ...fallbackUrls,
    'http://127.0.0.1:5000',
  ])

  for (const candidate of candidates) {
    if (await probeHealth(candidate)) {
      return candidate
    }
  }

  return configuredUrl || runtimeUrl || 'http://127.0.0.1:5000'
}

export default defineConfig(async ({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = await resolveBackendUrl(env)
  const normalizedApiUrl = normalizeProxyUrl(apiUrl)
  // Prefer 127.0.0.1 instead of localhost for proxy targets to avoid IPv6/localhost resolution issues
  const finalApiUrl = normalizedApiUrl && normalizedApiUrl.replace(/^http:\/\/localhost/i, 'http://127.0.0.1')
  const wsUrl = env.VITE_WS_URL || `${(finalApiUrl || normalizedApiUrl).replace(/^http/, 'ws')}`
  const devPort = Number.parseInt(env.VITE_PORT || env.PORT || '3002', 10)

  return {
    plugins: [react()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@components': path.resolve(__dirname, './src/components'),
        '@hooks': path.resolve(__dirname, './src/hooks'),
        '@services': path.resolve(__dirname, './src/services'),
        '@store': path.resolve(__dirname, './src/store'),
        '@utils': path.resolve(__dirname, './src/utils'),
        'react-hot-toast': path.resolve(__dirname, './src/utils/hotToastShim.js'),
        '@styles': path.resolve(__dirname, './src/styles'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@config': path.resolve(__dirname, './src/config'),
        '@types': path.resolve(__dirname, './src/types'),
      },
    },
    server: {
      port: devPort,
      strictPort: false,
      host: '0.0.0.0',
      hmr: {
        host: 'localhost',
        protocol: 'ws',
      },
      open: false,
      proxy: {
        '/api': {
          target: finalApiUrl || normalizedApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          timeout: 120000,
          // Provide clearer console errors when proxying fails and attempt alternatives
          onError: async (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('Vite proxy /api error ->', err && err.message ? err.message : err);
            try {
              if (!res.headersSent) {
                // Try alternative backend candidates synchronously: runtime_api_url.txt then fallback ports
                const runtimeUrlPath = path.resolve(__dirname, '..', 'runtime_api_url.txt')
                let runtimeCandidate = ''
                try { if (fs.existsSync(runtimeUrlPath)) runtimeCandidate = fs.readFileSync(runtimeUrlPath, 'utf8').trim() } catch (e) { runtimeCandidate = '' }
                const fallbackPorts = [5003, 5004, 5000, 5001, 5002, 5005]
                const candidates = []
                if (finalApiUrl) candidates.push(finalApiUrl)
                if (runtimeCandidate) candidates.push(runtimeCandidate)
                for (const p of fallbackPorts) {
                  candidates.push(`http://127.0.0.1:${p}`)
                  candidates.push(`http://localhost:${p}`)
                }

                const proxiedUrl = req.originalUrl || req.url || ''
                for (const target of candidates) {
                  if (!target) continue
                  const full = `${target.replace(/\/$/, '')}${proxiedUrl}`
                  try {
                    // eslint-disable-next-line no-await-in-loop
                    const upstream = await axios.request({ url: full, method: req.method || 'GET', responseType: 'stream', timeout: 8000, validateStatus: () => true, httpAgent: new http.Agent({ keepAlive: true }), httpsAgent: new https.Agent({ keepAlive: true }) })
                    if (upstream && upstream.status >= 200 && upstream.status < 400 && upstream.data) {
                      // Pipe headers and stream back
                      Object.entries(upstream.headers || {}).forEach(([k, v]) => { try { res.setHeader(k, v) } catch (e) {} })
                      res.statusCode = upstream.status
                      upstream.data.pipe(res)
                      return
                    }
                  } catch (e) {
                    // try next candidate
                  }
                }

                res.writeHead && res.writeHead(502)
                res.end && res.end('Bad gateway')
              }
            } catch (e) {
              // ignore
            }
          },
        },
        '/auth': {
          target: finalApiUrl || normalizedApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/auth/, '/auth'),
          timeout: 120000,
          onError: (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('Vite proxy /auth error ->', err && err.message ? err.message : err);
            try { if (!res.headersSent) { res.writeHead && res.writeHead(502); res.end && res.end('Bad gateway'); } } catch (e) {}
          },
        },
        '/ws': {
          target: wsUrl,
          ws: true,
        },
        '/uploads': {
          target: finalApiUrl || normalizedApiUrl,
          changeOrigin: true,
          timeout: 120000,
          onError: (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('Vite proxy /uploads error ->', err && err.message ? err.message : err);
            try { if (!res.headersSent) { res.writeHead && res.writeHead(502); res.end && res.end('Bad gateway'); } } catch (e) {}
          },
        },
      },
    },
    build: {
      outDir: 'dist',
      sourcemap: true,
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
      rollupOptions: {
        output: {
          manualChunks: {
            vendor: ['react', 'react-dom', 'react-router-dom'],
            ui: ['@headlessui/react', '@heroicons/react', 'framer-motion'],
            charts: ['recharts', 'react-chartjs-2', 'chart.js'],
            forms: ['react-hook-form', 'yup', '@hookform/resolvers'],
            utils: ['date-fns', 'axios', 'react-query', 'zustand'],
            qr: ['react-qr-code', 'html5-qrcode'],
            exports: ['file-saver', 'jspdf', 'html2canvas'],
          },
          chunkFileNames: 'assets/[name]-[hash].js',
          entryFileNames: 'assets/[name]-[hash].js',
          assetFileNames: 'assets/[name]-[hash].[ext]',
        },
      },
      target: 'es2015',
      cssCodeSplit: true,
      assetsInlineLimit: 4096,
    },
    preview: {
      port: 4173,
      host: '127.0.0.1',
    },
    optimizeDeps: {
      include: ['react', 'react-dom', 'react-router-dom', 'axios', 'react-query', 'zustand'],
    },
    css: {
      devSourcemap: true,
      modules: {
        localsConvention: 'camelCase',
      },
    },
    // Note: avoid setting deprecated `esbuild` options here to reduce warnings
  }
})

