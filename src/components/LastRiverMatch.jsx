import { useEffect, useState } from 'react'
import { CalendarDays, CheckCircle2, MapPin, Plus, RotateCcw, Trophy, WifiOff } from 'lucide-react'
import { getLastRiverMatch } from '../services/footballService'
import { OUTCOME_LABELS, STATUS, formatDate, getOutcome, normalizeName } from '../utils/matchUtils'

// Tarjeta "Último partido de River" con datos de la API TheSportsDB.
// Si el usuario fue, puede cargarlo en su historial con el formulario ya completo.
function LastRiverMatch({ matches, onAdd }) {
  const [state, setState] = useState({ status: 'loading' })
  const [attempt, setAttempt] = useState(0)

  useEffect(() => {
    let cancelled = false
    setState({ status: 'loading' })

    if (!navigator.onLine) {
      setState({ status: 'error', message: 'Sin conexión: no pudimos traer el último partido.' })
      return
    }

    getLastRiverMatch()
      .then((match) => !cancelled && setState(match ? { status: 'ok', match } : { status: 'empty' }))
      .catch((error) => {
        if (cancelled) return
        const message =
          error.message === 'football-limit'
            ? 'Se hicieron muchas consultas seguidas. Probá de nuevo en un minuto.'
            : 'No pudimos traer el último partido.'
        setState({ status: 'error', message })
      })

    return () => {
      cancelled = true
    }
  }, [attempt])

  let content
  if (state.status === 'loading') {
    content = <p className="muted">Buscando el último partido de River…</p>
  } else if (state.status === 'error') {
    content = (
      <div className="api-message">
        <WifiOff size={20} />
        <p>{state.message}</p>
        <button className="btn btn-secondary btn-small" onClick={() => setAttempt((n) => n + 1)}>
          <RotateCcw size={16} /> Reintentar
        </button>
      </div>
    )
  } else if (state.status === 'empty') {
    content = <p className="muted">Por ahora no hay datos del último partido.</p>
  } else {
    const { match } = state
    const outcome = getOutcome(match)
    // ¿Ya lo cargó? Mismo rival en la misma fecha.
    const saved = matches.some(
      (m) => m.date === match.date && normalizeName(m.rival) === normalizeName(match.rival)
    )

    content = (
      <>
        <div className="match-teams">
          <span className="team">River</span>
          {outcome ? (
            <span className={`score score-${outcome}`}>
              {match.riverGoals} – {match.rivalGoals}
            </span>
          ) : (
            <span className="score score-empty">vs</span>
          )}
          <span className="team">{match.rival}</span>
        </div>
        {outcome && <p className={`outcome outcome-${outcome}`}>{OUTCOME_LABELS[outcome]}</p>}

        <ul className="match-meta">
          <li>
            <CalendarDays size={16} /> {formatDate(match.date)}
            {match.time && ` · ${match.time} h`}
          </li>
          {match.league && (
            <li>
              <Trophy size={16} /> {match.competition || match.league}
            </li>
          )}
          {match.stadium && (
            <li>
              <MapPin size={16} /> {match.stadium}
            </li>
          )}
        </ul>

        {saved ? (
          <p className="api-saved">
            <CheckCircle2 size={18} /> Ya está en tu historial
          </p>
        ) : (
          <button
            className="btn btn-primary"
            onClick={() =>
              onAdd({
                rival: match.rival,
                date: match.date,
                time: match.time,
                stadium: match.stadium,
                competition: match.competition,
                riverGoals: match.riverGoals ?? '',
                rivalGoals: match.rivalGoals ?? '',
                status: STATUS.ATTENDED,
              })
            }
          >
            <Plus size={18} /> ¿Fuiste? Cargalo
          </button>
        )}
      </>
    )
  }

  return (
    <section className="api-card" aria-live="polite">
      <div className="api-card-head">
        <h2 className="display">Último partido de River</h2>
        <small>
          Datos de{' '}
          <a href="https://www.thesportsdb.com" target="_blank" rel="noreferrer">
            TheSportsDB
          </a>
        </small>
      </div>
      {content}
    </section>
  )
}

export default LastRiverMatch
