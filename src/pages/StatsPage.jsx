import { BarChart3, Equal, ListChecks, MapPin, Star, Swords, ThumbsDown, Ticket, Trophy } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import ResultsChart from '../components/ResultsChart'
import StatCard from '../components/StatCard'
import { calculateCuriosities, calculateStats } from '../utils/matchUtils'

const plural = (n) => `${n} ${n === 1 ? 'partido' : 'partidos'}`

// Muestra el dato curioso. Si hay empate, lo decimos en lugar de elegir uno.
function Curiosity({ icon: Icon, label, data }) {
  return (
    <div className="curiosity">
      <Icon size={22} />
      <span>{label}</span>
      {data ? (
        <>
          <strong>{data.names.length === 1 ? data.names[0] : `Empate: ${data.names.join(', ')}`}</strong>
          <small>
            {plural(data.count)}
            {data.names.length > 1 && ' cada uno'}
          </small>
        </>
      ) : (
        <>
          <strong>—</strong>
          <small>Sin datos cargados</small>
        </>
      )}
    </div>
  )
}

function StatsPage({ matches, onNavigate }) {
  const stats = calculateStats(matches)
  const curiosities = calculateCuriosities(matches)

  return (
    <>
      <PageHeader
        kicker="Récord personal"
        image="/images/festejo-jugadores.webp"
        title="Mis estadísticas"
        subtitle="Calculadas solo con los partidos a los que fuiste."
      />

      <div className="sheet">
        {stats.attended === 0 ? (
          <EmptyState
            icon={BarChart3}
            title="Todavía no hay datos suficientes"
            message="Tus estadísticas se arman con los partidos marcados como “Asistí”. Cargá uno o marcá tu asistencia en un próximo partido."
            action={
              <button className="btn btn-primary" onClick={() => onNavigate('partidos')}>
                <ListChecks size={18} /> Ir a Mis partidos
              </button>
            }
          />
        ) : (
          <>
            {/* ---------- Resumen: porcentaje + gráfico ---------- */}
            <section className="stats-overview">
              <div className="stats-hero">
                <span>Porcentaje de victorias</span>
                <strong className="display">{stats.winRate}%</strong>
                <small>
                  {stats.withResult > 0
                    ? `${stats.wins} de ${plural(stats.withResult)} con resultado`
                    : 'Todavía no cargaste resultados'}
                </small>
              </div>

              <div className="chart-card">
                <h2>Resultados que viste</h2>
                {stats.withResult > 0 ? (
                  <ResultsChart wins={stats.wins} draws={stats.draws} losses={stats.losses} />
                ) : (
                  <p className="muted">Cargá el resultado de los partidos a los que fuiste para ver el gráfico.</p>
                )}
              </div>
            </section>

            {stats.attendedWithoutResult > 0 && (
              <p className="info-banner">
                {stats.attendedWithoutResult === 1
                  ? 'Tenés 1 partido asistido sin resultado: no cuenta para victorias, empates ni derrotas.'
                  : `Tenés ${stats.attendedWithoutResult} partidos asistidos sin resultado: no cuentan para victorias, empates ni derrotas.`}
              </p>
            )}

            {/* ---------- Números ---------- */}
            <section className="stat-grid">
              <StatCard label="Partidos asistidos" value={stats.attended} icon={Ticket} variant="dark" />
              <StatCard label="Victorias" value={stats.wins} icon={Trophy} variant="win" />
              <StatCard label="Empates" value={stats.draws} icon={Equal} variant="draw" />
              <StatCard label="Derrotas" value={stats.losses} icon={ThumbsDown} variant="loss" />
              <StatCard label="Favoritos" value={stats.favorites} icon={Star} />
            </section>

            {/* ---------- Datos curiosos ---------- */}
            <section>
              <div className="list-heading">
                <h2 className="display">Datos curiosos</h2>
                <p>Sobre los partidos a los que fuiste.</p>
              </div>
              <div className="curiosities">
                <Curiosity icon={Swords} label="Rival que más viste" data={curiosities.topRival} />
                <Curiosity icon={MapPin} label="Estadio que más visitaste" data={curiosities.topStadium} />
                <Curiosity icon={Trophy} label="Competición más frecuente" data={curiosities.topCompetition} />
              </div>
            </section>
          </>
        )}

        <p className="stats-note">
          Solo cuentan los partidos marcados como “Asistí”. Los próximos y los partidos a los que no fuiste no suman a
          tus estadísticas. El favorito cuenta todos tus partidos.
        </p>
      </div>
    </>
  )
}

export default StatsPage
