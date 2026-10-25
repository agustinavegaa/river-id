import { ArrowRight, CalendarClock, Flag, Plus, Star, Ticket, Trophy } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import StatCard from '../components/StatCard'
import { STATUS, calculateStats, formatDate, sortByDate } from '../utils/matchUtils'

function HomePage({ matches, actions, busyId, onNavigate }) {
  const stats = calculateStats(matches)
  const latest = sortByDate(matches.filter((m) => m.status !== STATUS.UPCOMING)).slice(0, 3)
  const nextMatch = sortByDate(
    matches.filter((m) => m.status === STATUS.UPCOMING),
    true
  )[0]

  return (
    <div className="page">
      <section className="hero">
        <div>
          <p className="hero-kicker">Bienvenido, hincha</p>
          <h1>Tu historia en el Monumental y en cada cancha.</h1>
          <p className="hero-text">
            Registrá los partidos que viviste, organizá los próximos y mirá tus estadísticas como hincha.
          </p>
        </div>
        <button className="btn btn-light btn-large" onClick={() => actions.onAdd()}>
          <Plus size={20} /> Agregar partido
        </button>
      </section>

      {matches.length === 0 ? (
        <EmptyState
          icon={Ticket}
          title="Todavía no registraste partidos"
          message="Empezá tu diario de hincha agregando el primer partido al que fuiste (o al que vas a ir)."
          action={
            <button className="btn btn-primary" onClick={() => actions.onAdd()}>
              <Plus size={18} /> Agregar mi primer partido
            </button>
          }
        />
      ) : (
        <>
          <section className="stat-grid">
            <StatCard label="Partidos asistidos" value={stats.attended} icon={Ticket} variant="dark" />
            <StatCard label="Victorias vistas" value={stats.wins} icon={Trophy} variant="red" />
            <StatCard label="Próximos" value={stats.upcoming} icon={CalendarClock} />
            <StatCard label="Favoritos" value={stats.favorites} icon={Star} />
          </section>

          {nextMatch && (
            <section className="next-match" onClick={() => onNavigate('proximos')}>
              <div>
                <span className="next-label">
                  <Flag size={16} /> Próximo partido
                </span>
                <strong>River vs {nextMatch.rival}</strong>
                <span>
                  {formatDate(nextMatch.date)}
                  {nextMatch.competition && ` · ${nextMatch.competition}`}
                </span>
              </div>
              <ArrowRight size={22} />
            </section>
          )}

          <section>
            <div className="section-title">
              <h2>Últimos partidos</h2>
              <button className="link-btn" onClick={() => onNavigate('partidos')}>
                Ver todos <ArrowRight size={16} />
              </button>
            </div>
            {latest.length > 0 ? (
              <MatchList matches={latest} actions={actions} busyId={busyId} />
            ) : (
              <p className="muted">Todavía no hay partidos jugados registrados. ¡Solo próximos!</p>
            )}
          </section>
        </>
      )}
    </div>
  )
}

export default HomePage
