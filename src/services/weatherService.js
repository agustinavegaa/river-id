// Clima de los partidos con la API pública de Open-Meteo (https://open-meteo.com).
// No necesita clave: no hay nada secreto en el frontend.
// - Pronóstico: hasta 16 días antes del partido.
// - Partidos pasados: el clima registrado ese día (archivo histórico).
import { daysUntil, normalizeName } from '../utils/matchUtils'

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search'
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast'
const ARCHIVE_URL = 'https://archive-api.open-meteo.com/v1/archive'

// El pronóstico llega hasta 15 días después de hoy.
export const FORECAST_DAYS = 15
// Para los últimos 60 días usamos el pronóstico (el archivo histórico tarda unos días en completarse).
const RECENT_DAYS = 60

// Si no se cargó ciudad y el partido es en el Monumental (o no tiene estadio), usamos el Monumental.
const MONUMENTAL = { name: 'Monumental', latitude: -34.5453, longitude: -58.4498 }

// Guardamos en memoria lo que ya pedimos, para no repetir llamadas mientras la app está abierta.
const cache = new Map()

// Códigos de clima de la Organización Meteorológica Mundial (los que usa Open-Meteo).
export function describeWeather(code) {
  if (code === 0) return { label: 'Despejado', type: 'sun' }
  if (code <= 2) return { label: 'Parcialmente nublado', type: 'cloud-sun' }
  if (code === 3) return { label: 'Nublado', type: 'cloud' }
  if (code === 45 || code === 48) return { label: 'Niebla', type: 'fog' }
  if (code >= 51 && code <= 57) return { label: 'Llovizna', type: 'drizzle' }
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return { label: 'Lluvia', type: 'rain' }
  if ((code >= 71 && code <= 77) || code === 85 || code === 86) return { label: 'Nieve', type: 'snow' }
  if (code >= 95) return { label: 'Tormenta', type: 'storm' }
  return { label: 'Sin descripción', type: 'cloud' }
}

// ¿Dónde se juega? Devuelve el nombre de la ciudad a buscar, el Monumental o null si no sabemos.
export function getLocationQuery(match) {
  if (match.city?.trim()) return match.city.trim()
  const stadium = normalizeName(match.stadium || '')
  if (!stadium || stadium.includes('monumental')) return MONUMENTAL
  return null
}

// Busca las coordenadas de una ciudad por su nombre.
async function findCity(name) {
  const key = `city:${normalizeName(name)}`
  if (cache.has(key)) return cache.get(key)

  const params = new URLSearchParams({ name, count: '1', language: 'es' })
  const response = await fetch(`${GEOCODING_URL}?${params}`)
  if (!response.ok) throw new Error('weather-request')
  const data = await response.json()
  const place = data.results?.[0]
  const result = place ? { name: place.name, latitude: place.latitude, longitude: place.longitude } : null
  cache.set(key, result)
  return result
}

// Devuelve el clima del partido o un estado que explica por qué no hay:
// { status: 'ok', ... } | 'no-location' | 'city-not-found' | 'too-far' | 'no-data'
export async function getMatchWeather(match) {
  const days = daysUntil(match.date)
  if (days > FORECAST_DAYS) return { status: 'too-far', daysToForecast: days - FORECAST_DAYS }

  const query = getLocationQuery(match)
  if (!query) return { status: 'no-location' }
  const place = typeof query === 'string' ? await findCity(query) : query
  if (!place) return { status: 'city-not-found', city: query }

  const key = `weather:${place.latitude},${place.longitude},${match.date},${match.time || ''}`
  if (cache.has(key)) return cache.get(key)

  const isForecast = days >= 0
  const useArchive = days < -RECENT_DAYS
  const params = new URLSearchParams({
    latitude: place.latitude,
    longitude: place.longitude,
    start_date: match.date,
    end_date: match.date,
    timezone: 'auto',
    daily: isForecast
      ? 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max'
      : 'weather_code,temperature_2m_max,temperature_2m_min,precipitation_sum',
    hourly: 'temperature_2m',
  })
  const response = await fetch(`${useArchive ? ARCHIVE_URL : FORECAST_URL}?${params}`)
  if (!response.ok) throw new Error('weather-request')
  const data = await response.json()

  const daily = data.daily
  if (!daily || daily.weather_code?.[0] == null || daily.temperature_2m_max?.[0] == null) {
    return { status: 'no-data' }
  }

  // Si el partido tiene hora, buscamos la temperatura a esa hora.
  let tempAtKickoff = null
  if (match.time) {
    const hour = `${match.date}T${match.time.slice(0, 2)}:00`
    const index = data.hourly?.time?.indexOf(hour) ?? -1
    if (index >= 0) tempAtKickoff = data.hourly.temperature_2m[index]
  }

  const result = {
    status: 'ok',
    isForecast,
    place: place.name,
    ...describeWeather(daily.weather_code[0]),
    max: Math.round(daily.temperature_2m_max[0]),
    min: Math.round(daily.temperature_2m_min[0]),
    tempAtKickoff: tempAtKickoff == null ? null : Math.round(tempAtKickoff),
    rainChance: isForecast ? daily.precipitation_probability_max?.[0] ?? null : null,
    rainMm: isForecast ? null : daily.precipitation_sum?.[0] ?? null,
  }
  cache.set(key, result)
  return result
}
