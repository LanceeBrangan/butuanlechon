import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import VueInspector from 'vite-plugin-vue-inspector'

export default defineConfig({
  plugins: [
    vue(),
    // Pass the editor configuration into the DevTools plugin
    vueDevTools({
      launchEditor: 'code',
    }),
    // Also tell the Inspector specifically to use 'code'
    VueInspector({
      launchEditor: 'code',
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    host: true, // This helps Antigravity route the 'click' signal correctly
    cors: true,
  },
})
