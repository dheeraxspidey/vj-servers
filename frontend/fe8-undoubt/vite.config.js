import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: '0.0.0.0', // Allow connections from the local network
    port: 3108, // Specify the port (default is 5173)
    cors: true, // ✅ Enable CORS
  
    allowedHosts: [
      'localhost',
      'undoubt.vnrzone.site' // ✅ Allow this subdomain
    ],
  },
  
})