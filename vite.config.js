import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  base: '/smart-inventory-ui/',
  plugins: [
    vue({
      template: {
        compilerOptions: {
          isCustomElement: (tag) => tag.startsWith('ui5-'),
        },
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'https://isuite-eu-prem-01.it-cpi026-rt.cfapps.eu10-002.hana.ondemand.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
        secure: false,
      },
    },
  },
})
