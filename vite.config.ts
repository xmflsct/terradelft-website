import { reactRouter } from '@react-router/dev/vite'
import { cloudflareDevProxy } from '@react-router/dev/vite/cloudflare'
import { defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    cloudflareDevProxy({ environment: process.env.CF_PAGES == '1' ? undefined : 'dev' }),
    reactRouter(),
    tsconfigPaths()
  ]
})
