const currentEndpoint = 'https://api.openweathermap.org/data/2.5/weather'
const forecastEndpoint = 'https://api.openweathermap.org/data/2.5/forecast'

function sendJson(response, status, body) {
  response.statusCode = status
  response.setHeader('Content-Type', 'application/json; charset=utf-8')
  response.setHeader('Cache-Control', 'no-store')
  response.end(JSON.stringify(body))
}

function parseCoordinates(request) {
  const params = new URL(request.url, 'http://localhost').searchParams
  if (!params.has('latitude') || !params.has('longitude')) return null
  const latitude = Number(params.get('latitude'))
  const longitude = Number(params.get('longitude'))
  if (!Number.isFinite(latitude) || latitude < -90 || latitude > 90 ||
      !Number.isFinite(longitude) || longitude < -180 || longitude > 180) {
    return null
  }
  return { latitude, longitude }
}

function localDate(timestamp, timezoneOffset) {
  return new Date((timestamp + timezoneOffset) * 1000).toISOString().slice(0, 10)
}

function normalizeForecast(data) {
  const days = new Map()
  for (const entry of data.list || []) {
    const date = localDate(entry.dt, data.city.timezone)
    const day = days.get(date) || {
      date,
      low: Infinity,
      high: -Infinity,
      rainChance: 0,
      descriptions: new Map(),
      temperature: null,
      temperatureDistance: Infinity,
    }
    day.low = Math.min(day.low, entry.main.temp_min)
    day.high = Math.max(day.high, entry.main.temp_max)
    day.rainChance = Math.max(day.rainChance, Math.round((entry.pop || 0) * 100))
    const localHour = new Date((entry.dt + data.city.timezone) * 1000).getUTCHours()
    const temperatureDistance = Math.abs(localHour - 12)
    if (temperatureDistance < day.temperatureDistance) {
      day.temperature = entry.main.temp
      day.temperatureDistance = temperatureDistance
    }
    const description = entry.weather?.[0]?.description
    if (description) day.descriptions.set(description, (day.descriptions.get(description) || 0) + 1)
    days.set(date, day)
  }

  return Array.from(days.values()).slice(0, 5).map(({ descriptions, temperatureDistance: _temperatureDistance, ...day }) => ({
    ...day,
    description: Array.from(descriptions.entries()).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Forecast unavailable',
  }))
}

function providerError(status) {
  if (status === 401 || status === 403) return 'Weather service authentication failed. Check the OpenWeather API key and its access.'
  if (status === 429) return 'Weather service rate limit reached. Please wait and try again.'
  if (status >= 500) return 'Weather service is temporarily unavailable. Please try again shortly.'
  return 'Weather service could not return conditions for this location.'
}

function createHandler(apiKey) {
  return async (request, response) => {
    if (request.method !== 'GET') {
      response.setHeader('Allow', 'GET')
      sendJson(response, 405, { error: 'Use GET to request local weather.' })
      return
    }
    if (!apiKey) {
      sendJson(response, 503, { error: 'Weather is not configured. Add OPENWEATHER_API_KEY to .env.local and restart the dev server.' })
      return
    }

    const coordinates = parseCoordinates(request)
    if (!coordinates) {
      sendJson(response, 400, { error: 'Provide valid latitude and longitude coordinates.' })
      return
    }

    const query = new URLSearchParams({
      lat: String(coordinates.latitude),
      lon: String(coordinates.longitude),
      units: 'metric',
      appid: apiKey,
    })

    try {
      const [currentResponse, forecastResponse] = await Promise.all([
        fetch(`${currentEndpoint}?${query}`, { signal: AbortSignal.timeout(15000) }),
        fetch(`${forecastEndpoint}?${query}`, { signal: AbortSignal.timeout(15000) }),
      ])

      if (!currentResponse.ok || !forecastResponse.ok) {
        const failedResponse = !currentResponse.ok ? currentResponse : forecastResponse
        sendJson(response, failedResponse.status >= 500 ? 502 : failedResponse.status, {
          error: providerError(failedResponse.status),
        })
        return
      }

      const [current, forecast] = await Promise.all([currentResponse.json(), forecastResponse.json()])
      sendJson(response, 200, {
        current: {
          temperature: current.main.temp,
          apparentTemperature: current.main.feels_like,
          humidity: current.main.humidity,
          windSpeed: current.wind.speed,
          description: current.weather?.[0]?.description || 'Conditions unavailable',
          observedAt: current.dt,
        },
        daily: normalizeForecast(forecast),
        fetchedAt: Date.now(),
      })
    } catch (error) {
      if (error.name === 'TimeoutError' || error.name === 'AbortError') {
        sendJson(response, 504, { error: 'Weather request took too long. Please try again.' })
        return
      }
      sendJson(response, 502, { error: 'Could not reach the weather service. Check your connection and try again.' })
    }
  }
}

export default function openWeather({ apiKey }) {
  const handler = createHandler(apiKey)
  return {
    name: 'kaal-darpan-openweather',
    configureServer(server) {
      server.middlewares.use('/api/weather', handler)
    },
    configurePreviewServer(server) {
      server.middlewares.use('/api/weather', handler)
    },
  }
}
