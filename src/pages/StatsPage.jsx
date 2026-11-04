import { BarChart3, Equal, MapPin, Star, Swords, ThumbsDown, Ticket, Trophy } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import StatCard from '../components/StatCard'
import { calculateCuriosities, calculateStats } from '../utils/matchUtils'

const plural = (n) => `${n} ${n === 1 ? 'partido' : 'partidos'}`

function StatsPage({ matches }) {
  const stats = calculateStats(matches)
  const curiosities = calculateCuriosities(matches)

  return (
    <>
      <PageHeader
        kicker="Récord personal"
        title="Mis estadísticas"
        subtitle="Calculadas con los partidos a los que fuiste."
      />

      <div className="sheet">
        <section className="stats-hero">
          <div className="stats-hero-main">
            <span>Porcentaje de victorias</span>
            <strong className="display">{stats.winRate}%</strong>
            <small>
              {stats.withResult > 0
                ? `Sobre ${stats.withResult} ${stats.withResult === 1 ? 'partido' : 'partidos'} con resultado`
                : 'Todavía no hay resultados cargados'}
            </small>
          </div>
          {stats.withResult > 0 && (
            <div className="stats-hero-bar">
              <div className="record-bar" aria-label="Distribución de resultados">
                {stats.wins > 0 && <span className="bar-win" style={{ flex: stats.wins }} />}
                {stats.draws > 0 && <span className="bar-draw" style={{ flex: stats.draws }} />}
                {stats.losses > 0 && <span className="bar-loss" style={{ flex: stats.losses }} />}
              </div>
              <p>
                {stats.wins}G · {stats.draws}E · {stats.losses}P
              </p>
            </div>
          )}
        </section>

        <section className="stat-grid">
          <StatCard label="Partidos asistidos" value={stats.attended} icon={Ticket} variant="dark" />
          <StatCard label="Victorias" value={stats.wins} icon={Trophy} variant="win" />
          <StatCard label="Empates" value={stats.draws} icon={Equal} variant="draw" />
          <StatCard label="Derrotas" value={stats.losses} icon={ThumbsDown} variant="loss" />
          <StatCard label="Favoritos" value={stats.favorites} icon={Star} />
        </section>

        {stats.attended === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Todavía no hay datos suficientes"
            message="Las estadísticas se calculan con los partidos marcados como “Asistí”. Las victorias, empates y derrotas necesitan el resultado completo."
          />
        ) : (
          <section>
            <h2 className="display section-title section-title-left">Datos curiosos</h2>
            <div className="curiosities">
              <div className="curiosity">
                <Swords size={22} />
                <span>Rival que más viste</span>
                <strong>{curiosities.topRival ? curiosities.topRival.name : '—'}</strong>
                {curiosities.topRival && <small>{plural(curiosities.topRival.count)}</small>}
              </div>
              <div className="curiosity">
                <MapPin size={22} />
                <span>Estadio que más visitaste</span>
                <strong>{curiosities.topStadium ? curiosities.topStadium.name : '—'}</strong>
                {curiosities.topStadium && <small>{plural(curiosities.topStadium.count)}</small>}
              </div>
              <div className="curiosity">
                <Trophy size={22} />
                <span>Competición más vista</span>
                <strong>{curiosities.topCompetition ? curiosities.topCompetition.name : '—'}</strong>
                {curiosities.topCompetition && <small>{plural(curiosities.topCompetition.count)}</small>}
              </div>
            </div>
          </section>
        )}

        <p className="stats-note">
          Solo se cuentan los partidos marcados como “Asistí”. Los próximos y los partidos a los que no fuiste no suman
          al récord.
        </p>
      </div>
    </>
  )
}

export default StatsPage
