import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000', // proxy backend
    },
  },
  test: {
    environment: 'jsdom', // simule le navigateur
    setupFiles: './src/__test__/setupTests.js',
    globals: true,
  },
})
