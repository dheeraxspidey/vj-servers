import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/

export default defineConfig({
  server: {
    host: "0.0.0.0",   // Allow access from any host
    port: 3106,        // Ensure correct port
    strictPort: true,
    hmr: {
      host: "activity.vnrzone.site",
      protocol: "ws"  // Use "wss" if HTTPS is enabled
    }
  }
});

