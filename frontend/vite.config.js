import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:4000',
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: './src/__test__/setupTests.js',
    globals: true,
    coverage: {
      reporter: ['text', 'lcov'],   // <── ajoute ceci
      reportsDirectory: './coverage', // emplacement standard
      exclude: ['node_modules/', 'dist/', 'test/'], // optionnel
    },
  },
})
