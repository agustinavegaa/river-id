import { BarChart3, Equal, Percent, Star, ThumbsDown, Ticket, Trophy } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { calculateStats } from '../utils/matchUtils'

function StatsPage({ matches }) {
  const stats = calculateStats(matches)

  return (
    <div className="page">
      <PageHeader title="Mis estadísticas" subtitle="Calculadas a partir de los partidos que registraste." />

      <section className="stat-grid stat-grid-3">
        <StatCard label="Partidos asistidos" value={stats.attended} icon={Ticket} variant="dark" />
        <StatCard
          label="Porcentaje de victorias"
          value={`${stats.winRate}%`}
          icon={Percent}
          variant="red"
          hint={stats.withResult > 0 ? `Sobre ${stats.withResult} partidos con resultado` : 'Sin resultados cargados'}
        />
        <StatCard label="Partidos favoritos" value={stats.favorites} icon={Star} />
        <StatCard label="Victorias" value={stats.wins} icon={Trophy} variant="win" />
        <StatCard label="Empates" value={stats.draws} icon={Equal} variant="draw" />
        <StatCard label="Derrotas" value={stats.losses} icon={ThumbsDown} variant="loss" />
      </section>

      {stats.withResult > 0 ? (
        <section className="record-bar-wrapper">
          <h2>Tu récord en la cancha</h2>
          <div className="record-bar" aria-label="Distribución de resultados">
            {stats.wins > 0 && <span className="bar-win" style={{ flex: stats.wins }} title={`${stats.wins} victorias`} />}
            {stats.draws > 0 && <span className="bar-draw" style={{ flex: stats.draws }} title={`${stats.draws} empates`} />}
            {stats.losses > 0 && (
              <span className="bar-loss" style={{ flex: stats.losses }} title={`${stats.losses} derrotas`} />
            )}
          </div>
          <p className="muted">
            {stats.wins}G · {stats.draws}E · {stats.losses}P
          </p>
        </section>
      ) : (
        <EmptyState
          icon={BarChart3}
          title="Todavía no hay datos suficientes"
          message="Las victorias, empates y derrotas se calculan con los partidos marcados como “Asistí” que tengan el resultado completo."
        />
      )}

      <p className="stats-note">
        Solo se cuentan los partidos marcados como “Asistí”. Los próximos y los partidos a los que no fuiste no suman
        al récord.
      </p>
    </div>
  )
}

export default StatsPage
