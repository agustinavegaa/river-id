import { useEffect, useState } from 'react'
import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudOff,
  CloudRain,
  CloudSun,
  RotateCcw,
  Snowflake,
  Sun,
} from 'lucide-react'
import { FORECAST_DAYS, getMatchWeather } from '../services/weatherService'

const ICONS = {
  sun: Sun,
  'cloud-sun': CloudSun,
  cloud: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: Snowflake,
  storm: CloudLightning,
}

// Muestra el clima de un partido (pronóstico o el clima que hizo ese día).
// variant "card": en las tarjetas de partido. variant "hero": una línea corta en la portada.
function WeatherInfo({ match, variant = 'card' }) {
  const [state, setState] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)
  const { date, time, city, stadium } = match

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    if (!navigator.onLine) {
      setState({ status: 'error', message: 'Sin conexión: no pudimos cargar el clima.' })
      return
    }

    getMatchWeather({ date, time, city, stadium })
      .then((result) => !cancelled && setState(result))
      .catch(() => !cancelled && setState({ status: 'error', message: 'No pudimos cargar el clima.' }))

    // Si el partido cambia antes de que llegue la respuesta, ignoramos la respuesta vieja.
    return () => {
      cancelled = true
    }
  }, [date, time, city, stadium, attempt])

  // En la portada solo mostramos el clima cuando lo tenemos.
  if (variant === 'hero') {
    if (state.status !== 'ok') return null
    const Icon = ICONS[state.type]
    return (
      <small className="weather-hero">
        <Icon size={15} /> {state.label} · {state.max}° / {state.min}°
        {state.rainChance != null && ` · Lluvia ${state.rainChance}%`}
      </small>
    )
  }

  if (state.status === 'loading') {
    return (
      <p className="weather weather-muted" aria-live="polite">
        <Cloud size={18} />
        <span>Cargando el clima…</span>
      </p>
    )
  }

  if (state.status === 'error') {
    return (
      <p className="weather weather-muted" role="status">
        <CloudOff size={18} />
        <span>
          {state.message}{' '}
          <button type="button" className="link-btn" onClick={() => setAttempt((n) => n + 1)}>
            <RotateCcw size={14} /> Reintentar
          </button>
        </span>
      </p>
    )
  }

  if (state.status !== 'ok') {
    const messages = {
      'too-far': `El pronóstico aparece ${FORECAST_DAYS + 1} días antes del partido (faltan ${state.daysToForecast} ${state.daysToForecast === 1 ? 'día' : 'días'}).`,
      'no-location': 'Agregá la ciudad del partido para ver el clima.',
      'city-not-found': `No encontramos la ciudad “${state.city}”. Revisá cómo está escrita.`,
      'no-data': 'No hay datos del clima para esa fecha.',
    }
    return (
      <p className="weather weather-muted">
        <CloudOff size={18} />
        <span>{messages[state.status]}</span>
      </p>
    )
  }

  const Icon = ICONS[state.type]
  return (
    <div className="weather">
      <Icon size={22} className="weather-icon" />
      <div className="weather-text">
        <strong>
          {state.isForecast ? 'Pronóstico' : 'Ese día'}: {state.label}
          {state.tempAtKickoff != null && ` · ${state.tempAtKickoff}° a las ${time} h`}
        </strong>
        <small>
          Máx {state.max}° · Mín {state.min}°
          {state.rainChance != null && ` · Lluvia ${state.rainChance}%`}
          {state.rainMm > 0 && ` · Llovió ${state.rainMm} mm`} · {state.place}
        </small>
      </div>
    </div>
  )
}

export default WeatherInfo
