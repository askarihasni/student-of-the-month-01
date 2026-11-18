import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            const code = (err as any)?.code
            if (code === 'ECONNABORTED' || code === 'ECONNRESET' || code === 'EPIPE' || code === 'ECONNREFUSED') return
          })
        },
      },
      '/uploads': {
        target: 'http://127.0.0.1:5000',
        changeOrigin: true,
        secure: false,
      },
      '/socket.io': {
        target: 'http://127.0.0.1:5000',
        ws: true,
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err) => {
            const code = (err as any)?.code
            if (code === 'ECONNABORTED' || code === 'ECONNRESET' || code === 'EPIPE' || code === 'ECONNREFUSED') return
          })
          proxy.on('proxyReqWs', (_proxyReq, _req, socket) => {
            socket.on('error', () => {})
          })
        },
      },
    },
  },
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/tests/setup.ts'],
    include: ['src/tests/**/*.test.ts'],
  },
})
