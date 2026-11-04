import { useEffect, useState } from 'react'
import { getCountdown } from '../utils/matchUtils'

// Cuenta regresiva (días, horas y minutos) hasta la fecha "target".
// Se actualiza sola cada 30 segundos.
function Countdown({ target }) {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 30000)
    return () => clearInterval(timer)
  }, [])

  const { days, hours, minutes } = target ? getCountdown(target, now) : {}
  const format = (n) => (target ? String(n).padStart(2, '0') : '--')

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
