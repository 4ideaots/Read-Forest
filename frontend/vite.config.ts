import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
// The Read-Forest Spring Boot backend (port 8080) disables CORS, so during
// dev we proxy same-origin `/api` (and the OAuth2 routes) to it. This keeps
// the browser happy without touching the backend.
const BACKEND = process.env.VITE_BACKEND_ORIGIN || 'http://localhost:8080'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': { target: BACKEND, changeOrigin: true },
      '/oauth2': { target: BACKEND, changeOrigin: true },
      '/login/oauth2': { target: BACKEND, changeOrigin: true },
    },
  },
})
