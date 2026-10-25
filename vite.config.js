import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: [
        'icons/favicon-196.png',
        'icons/apple-icon-180.png'
      ],
      manifest: {
        name: 'Little Japanese',
        short_name: 'Japanese',
        description: 'Japanese reading tool with scholarly transliteration',
        theme_color: '#6366F1',
        background_color: '#F8FAFC',
        display: 'standalone',
        scope: '/Little_Hanzi_Japanese/',
        start_url: '/Little_Hanzi_Japanese/',
        icons: [
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/manifest-icon-192.maskable.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable'
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'icons/manifest-icon-512.maskable.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      }
    })
  ],
  base: '/Little_Hanzi_Japanese/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    emptyOutDir: true,
    sourcemap: true,
    timeout: 120000,
  },
  server: {
    port: 3000,
    open: true,
    host: '0.0.0.0'
  },
})