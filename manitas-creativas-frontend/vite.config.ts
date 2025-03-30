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
    },
    port: 5173,
    // https: {
    //   key: fs.readFileSync(keyFilePath),
    //   cert: fs.readFileSync(certFilePath),
    // },
  },  
})
