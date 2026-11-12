import { useEffect, useState } from 'react'
import { daysUntil, getCountdown, getMatchDateTime } from '../utils/matchUtils'

const pad = (n) => String(n).padStart(2, '0')

// Cuenta regresiva al partido "match".
// - Con hora: días, horas y minutos (se actualiza cada 30 segundos).
// - Sin hora: solo los días que faltan y "Hora a confirmar". No inventamos una hora.
// - Sin partido: guiones.
function Countdown({ match }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  if (match && !match.time) {
    const days = daysUntil(match.date)
    return (
      <div className="countdown glass" aria-label="Días que faltan para el próximo partido">
        <div>
          <strong>{days === 0 ? 'HOY' : pad(days)}</strong>
          <span>{days === 0 ? 'Es hoy' : days === 1 ? 'Día' : 'Días'}</span>
        </div>
        <div>
          <strong>--:--</strong>
          <span>Hora a confirmar</span>
        </div>
      </div>
    )
  }

  const { days, hours, minutes } = match ? getCountdown(getMatchDateTime(match), now) : {}
  const format = (n) => (match ? pad(n) : '--')

  return (
    <div className="countdown glass" aria-label="Cuenta regresiva al próximo partido">
      <div>
        <strong>{format(days)}</strong>
        <span>Días</span>
      </div>
      <div>
        <strong>{format(hours)}</strong>
        <span>Horas</span>
      </div>
      <div>
        <strong>{format(minutes)}</strong>
        <span>Min</span>
      </div>
    </div>
  )
}

export default Countdown
