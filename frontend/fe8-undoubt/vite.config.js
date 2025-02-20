// import { defineConfig } from 'vite'
// import react from '@vitejs/plugin-react'
// import tailwindcss from '@tailwindcss/vite'

// // https://vite.dev/config/
// export default defineConfig({
//   plugins: [react(),tailwindcss()],
// })

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
        host: '0.0.0.0', // Allow connections from the local network
        port: 3108, // Specify the port (default is 3108)
        allowedHosts: [
          '127.0.0.1', // or 'localhost' - Important for dev server access
          'undoubt.vnrzone.site', // Add your domains here
          'campus.vnrzone.site', 
          '10.45.8.186' 
        ]
      }
})