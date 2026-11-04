import { ArrowRight, MapPin, Plus, Ticket } from 'lucide-react'
import Carousel from '../components/Carousel'
import Countdown from '../components/Countdown'
import EmptyState from '../components/EmptyState'
import { STATUS, calculateStats, formatDate, getMatchDateTime, getNextMatch, sortByDate } from '../utils/matchUtils'

function HomePage({ matches, actions, onNavigate }) {
  const stats = calculateStats(matches)
  const nextMatch = getNextMatch(matches)
  // En el carrusel: los últimos partidos jugados (sin los próximos).
  const latest = sortByDate(matches.filter((m) => m.status !== STATUS.UPCOMING)).slice(0, 8)

  return (
    <>
      {/* ---------- Portada oscura ---------- */}
      <section className="band band-home">
        <div className="hero-media" aria-hidden="true" />

        <div className="band-content">
          <p className="kicker">Mi vida como hincha</p>
          <h1 className="display hero-title">
            <span>Mi historia</span>
            <span className="hero-title-indent">en la cancha</span>
          </h1>
        </div>

        <div className="hero-bottom">
          <Countdown target={nextMatch ? getMatchDateTime(nextMatch) : null} />

          <p className="hero-copy">
            {nextMatch
              ? `Cuenta regresiva para River vs ${nextMatch.rival}.`
              : 'Registrá los partidos que viviste y organizá los que se vienen.'}
          </p>

          {nextMatch ? (
            <button className="next-card glass" onClick={() => onNavigate('proximos')}>
              <span className="icon-square">
                <MapPin size={22} />
              </span>
              <span className="next-card-text">
                <strong>
                  {formatDate(nextMatch.date)}
                  {nextMatch.time && ` · ${nextMatch.time} h`}
                </strong>
                <small>{nextMatch.stadium || nextMatch.competition || 'Próximo partido'}</small>
              </span>
            </button>
          ) : (
            <button className="next-card glass" onClick={() => actions.onAdd({ status: STATUS.UPCOMING })}>
              <span className="icon-square">
                <Plus size={22} />
              </span>
              <span className="next-card-text">
                <strong>Agendá tu próximo partido</strong>
                <small>Y activá la cuenta regresiva</small>
              </span>
            </button>
          )}
        </div>
      </section>

      {/* ---------- Hoja blanca ---------- */}
      <div className="sheet">
        <span className="sheet-notch">deslizá</span>

        <section className="section-center">
          <h2 className="display section-title">Últimos partidos</h2>
          <p>Los partidos que fuiste sumando a tu historia. Tocá una tarjeta para editarla.</p>
        </section>

        {latest.length > 0 ? (
          <Carousel matches={latest} onOpen={actions.onEdit} />
        ) : (
          <EmptyState
            icon={Ticket}
            title="Todavía no registraste partidos"
            message="Empezá tu diario de hincha agregando el primer partido al que fuiste."
            action={
              <button className="btn btn-primary" onClick={() => actions.onAdd()}>
                <Plus size={18} /> Agregar mi primer partido
              </button>
            }
          />
        )}

        <div className="made-with">
          <span>Hecho con</span>
          <div>
            <span className="brand-pill">React</span>
            <span className="brand-pill">Firebase</span>
            <span className="brand-pill">Vercel</span>
          </div>
        </div>

        <hr className="curve-divider" />

        {/* ---------- Sobre la app ---------- */}
        <section className="about">
          <h2 className="display about-title">Sobre River ID</h2>
          <div className="about-body">
            <p className="display about-statement">
              River ID es el diario del hincha: cada partido que viviste, cada recuerdo y tu récord en la cancha, en un
              solo lugar.
            </p>
            <div className="about-columns">
              <p>
                Cargá los partidos a los que fuiste con el resultado, el estadio y un recuerdo personal. Agendá los que
                se vienen y, después del partido, marcá si fuiste.
              </p>
              <div>
                <h3>Qué vas a encontrar</h3>
                <p>Tu historial, una cuenta regresiva al próximo partido y tus estadísticas como hincha.</p>
              </div>
            </div>
          </div>
        </section>

        {/* ---------- Banner con números ---------- */}
        <section className="promo">
          <div className="promo-media" aria-hidden="true" />
          <div className="promo-content">
            <h2 className="display promo-title">
              Tu récord
              <br />
              en la cancha
            </h2>
            <div className="promo-cta">
              <p>Mirá cuántos partidos viste y cuántos ganó River con vos en la tribuna.</p>
              <div className="pill-group">
                <button className="btn-pill btn-pill-light" onClick={() => onNavigate('estadisticas')}>
                  Ver estadísticas
                </button>
                <button
                  className="btn-circle btn-circle-light"
                  onClick={() => onNavigate('estadisticas')}
                  aria-label="Ver estadísticas"
                >
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
          <div className="promo-panel">
            <div>
              <strong className="display">{String(stats.attended).padStart(2, '0')}</strong>
              <span>Partidos</span>
            </div>
            <div>
              <strong className="display">{String(stats.wins).padStart(2, '0')}</strong>
              <span>Victorias</span>
            </div>
            <div>
              <strong className="display">{stats.winRate}%</strong>
              <span>De victorias</span>
            </div>
          </div>
        </section>
      </div>
    </>
  )
}

export default HomePage
