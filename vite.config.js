import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'node:path'
import geminiGuide from './server/gemini.js'
import openWeather from './server/weather.js'
import sarvamNarration from './server/sarvamNarration.js'

const root = import.meta.dirname

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')

  return {
    plugins: [
      react(),
      geminiGuide({ apiKey: env.GEMINI_API_KEY, sarvamApiKey: env.SARVAM_API_KEY }),
      openWeather({ apiKey: env.OPENWEATHER_API_KEY }),
      sarvamNarration({ sarvamApiKey: env.SARVAM_API_KEY }),
    ],
    server: {
      port: 5175,
      strictPort: true,
      proxy: {
        '/api/health': 'http://localhost:8000',
        '/api/config': 'http://localhost:8000',
        '/api/create-payment-intent': 'http://localhost:8000',
        '/api/order-confirmation-status': 'http://localhost:8000',
        '/api/stripe-webhook': 'http://localhost:8000',
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: resolve(root, 'index.html'),
          museum: resolve(root, 'museum.html'),
          'plan-visit': resolve(root, 'plan-visit.html'),
        },
      },
    },
  }
})
