import { fileURLToPath, URL } from "node:url";

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const apiBaseUrl = "https://localhost:7144";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    proxy: {
      "^/api/": {
        target: apiBaseUrl,
        secure: false,
        rewrite: (path) => path.startsWith('/api/') ? path : `/${path}`
      },
      '/api/grados': {
        target: apiBaseUrl,
        changeOrigin: true,
        secure: false,
      },
      '/alumnos': {
        target: 'https://localhost:7144',
        changeOrigin: true,
        secure: false, // Disable SSL verification for development
      },
      '/usuarios': {
        target: 'https://localhost:7144',
        changeOrigin: true,
        secure: false, // Disable SSL verification for development
      },
    },
    port: 5173,
    // https: {
    //   key: fs.readFileSync(keyFilePath),
    //   cert: fs.readFileSync(certFilePath),
    // },
  },  
})
