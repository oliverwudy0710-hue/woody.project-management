import react from '@vitejs/plugin-react'
import { loadEnv } from 'vite'
import { defineConfig } from 'vitest/config'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const llmProxyTarget = env.VITE_LLM_PROXY_TARGET || 'https://api.deepseek.com'

  return {
    /** Relative asset URLs so `file://` loads work in the packaged Electron app */
    base: './',
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
