import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('react-markdown') || id.includes('remark-') || id.includes('unified')) {
            return 'markdown'
          }
          if (id.includes('@tanstack/react-query')) {
            return 'query'
          }
          if (id.includes('react-router')) {
            return 'router'
          }
          if (id.includes('lucide-react')) {
            return 'icons'
          }
          return 'vendor'
        },
      },
    },
  },
})
