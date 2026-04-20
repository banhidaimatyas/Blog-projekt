import { defineConfig } from 'vite'

export default defineConfig({
  server: {
    port: 5173,
    // A json-server kéréseket átirányítjuk a 3001-es portra
    proxy: {
      '/api': {
        target: 'http://localhost:3001'
      }
    }
  }
})
