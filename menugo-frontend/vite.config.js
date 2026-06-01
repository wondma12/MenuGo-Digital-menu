import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
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
    port: 5173,
    host: true,
    open: true,
    proxy: {
      '/api': {
        // Forward API requests to the backend. In local development we
        // default to the backend port the server started on (5000),
        // which is what the backend logs show when you restart it.
        // You can override this by setting the `API_URL` env var.
        // Default matches the backend `PORT` in menugo-backend/.env (5003).
        target: process.env.API_URL || 'http://localhost:5003',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, '/api'),
        timeout: 120000,
      },
      '/ws': {
        // WebSocket proxy: derive ws target from API_URL when possible
        target: (process.env.API_URL && process.env.API_URL.replace(/^http/, 'ws')) || 'ws://localhost:5003',
        ws: true,
      },
      '/uploads': {
        target: process.env.API_URL || 'http://localhost:5003',
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
          exports: ['file-saver', 'xlsx', 'jspdf', 'html2canvas'],
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
    host: true,
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
})
