import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

const normalizeProxyUrl = (url) => {
  if (!url) return url
  return url.replace(/\/api\/?$/, '').replace(/\/$/, '')
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = env.VITE_API_URL || env.API_URL || 'http://localhost:5003'
  const normalizedApiUrl = normalizeProxyUrl(apiUrl)
  const wsUrl = env.VITE_WS_URL || `${normalizedApiUrl.replace(/^http/, 'ws')}`
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
      host: '127.0.0.1',
      open: false,
      proxy: {
        '/api': {
          target: normalizedApiUrl,
          changeOrigin: true,
          rewrite: (path) => path.replace(/^\/api/, '/api'),
          timeout: 120000,
        },
        '/ws': {
          target: wsUrl,
          ws: true,
        },
        '/uploads': {
          target: normalizedApiUrl,
          changeOrigin: true,
          timeout: 120000,
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

