import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import fs from 'fs'

const normalizeProxyUrl = (url) => {
  if (!url) return url
  return url.replace(/\/api\/?$/, '').replace(/\/$/, '')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  // Allow explicit env override via VITE_API_URL or API_URL. If not provided,
  // attempt to read the backend runtime URL written by the backend server
  // to `runtime_api_url.txt` at the repo root (convenience for local dev).
  let apiUrl = env.VITE_API_URL || env.API_URL || ''
  if (!apiUrl) {
    try {
      const possible = path.resolve(__dirname, '..', 'runtime_api_url.txt')
      if (fs.existsSync(possible)) {
        apiUrl = fs.readFileSync(possible, 'utf8').trim()
      }
    } catch (e) {
      // ignore
    }
  }
  if (!apiUrl) apiUrl = 'http://localhost:5003'
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
          // Provide clearer console errors when proxying fails
          onError: (err, req, res) => {
            // eslint-disable-next-line no-console
            console.error('Vite proxy /api error ->', err && err.message ? err.message : err);
            try {
              if (!res.headersSent) {
                res.writeHead && res.writeHead(502);
                res.end && res.end('Bad gateway');
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

