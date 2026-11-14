import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'
import { DEV_BACKEND_PORT, DEV_FRONTEND_PORT } from './src/config/site.js'

// https://vite.dev/config/
// API calls are not proxied — they go straight to the backend origin (see src/api/client.js),
// which works cross-origin because sessions use a Bearer token rather than a cookie.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: DEV_FRONTEND_PORT,
    proxy: {
      // Product/avatar images are stored as relative /uploads/... paths.
      '/uploads': { target: `http://localhost:${DEV_BACKEND_PORT}`, changeOrigin: true },
    },
  },
})
