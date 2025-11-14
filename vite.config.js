import { defineConfig } from 'vite'

export default defineConfig({
  root: 'frontend',
  server: {
    port: 5173,
    host: '0.0.0.0',
    open: false,
  },
  build: {
    outDir: 'dist',
    emptyOutDir: true,
  }
})
