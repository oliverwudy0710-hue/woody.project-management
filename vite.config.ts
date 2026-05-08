import { readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

const appDir = dirname(fileURLToPath(import.meta.url))
const appVersion = JSON.parse(readFileSync(join(appDir, 'package.json'), 'utf-8')).version as string

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const llmProxyTarget = env.VITE_LLM_PROXY_TARGET || 'https://api.deepseek.com'

  return {
    /** Relative asset URLs so `file://` loads work in the packaged Electron app */
    base: './',
    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(appVersion),
    },
    plugins: [react()],
    server: {
      /** Listen on IPv4 + IPv6 loopback so http://127.0.0.1:5175 and http://localhost:5175 both work. */
      host: true,
      port: 5175,
      proxy: {
        '/api-llm': {
          target: llmProxyTarget,
          changeOrigin: true,
          secure: true,
          rewrite: (p) => p.replace(/^\/api-llm/, ''),
        },
      },
    },
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
    },
  }
})
