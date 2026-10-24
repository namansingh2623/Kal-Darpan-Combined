import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import { createHandler as createChatHandler } from './_runtime/server/gemini.js'
import { createHandler as createWeatherHandler } from './_runtime/server/weather.js'
import { createHandler as createNarrationHandler } from './_runtime/server/sarvamNarration.js'

const geminiKey = defineSecret('GEMINI_API_KEY')
const sarvamKey = defineSecret('SARVAM_API_KEY')
const weatherKey = defineSecret('OPENWEATHER_API_KEY')

export const api = onRequest({
  region: 'us-central1',
  secrets: [geminiKey, sarvamKey, weatherKey],
  memory: '512MiB',
  timeoutSeconds: 60,
  maxInstances: 2,
}, (request, response) => {
  const path = new URL(request.url, 'http://localhost').pathname
  if (path === '/api/chat') {
    return createChatHandler({ apiKey: geminiKey.value(), sarvamApiKey: sarvamKey.value() })(request, response)
  }
  if (path === '/api/weather') {
    return createWeatherHandler(weatherKey.value())(request, response)
  }
  if (path === '/api/narration') {
    return createNarrationHandler({
      sarvamApiKey: sarvamKey.value(),
      allowedOrigins: ['https://kaal-darpan.web.app', 'https://kaal-darpan.firebaseapp.com'],
    })(request, response)
  }
  response.status(404).json({ error: 'Unknown API route.' })
})
