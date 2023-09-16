import { defineConfig } from 'vite'
import { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue()
  ],
  build: {
    rollupOptions: {
      input: {
        notification: resolve(__dirname, 'src/ui/notification/index.html'),
        popup: resolve(__dirname, 'src/ui/popup/index.html'),
        dashboard: resolve(__dirname, 'src/ui/dashboard/index.html')
      }
    }
  },
  server: {
    port: 5174
  }
})