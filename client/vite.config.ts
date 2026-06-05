import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    allowedHosts: [
      'localhost',
      '.ngrok-free.app',
      '.ngrok-free.dev'
    ],
    headers: {
      'ngrok-skip-browser-warning': 'true'
    }
  }
})
