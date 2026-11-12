import { ArrowRight, BarChart3, CalendarClock, MapPin, Plus, Ticket } from 'lucide-react'
import Carousel from '../components/Carousel'
import Countdown from '../components/Countdown'
import EmptyState from '../components/EmptyState'
import { STATUS, calculateStats, formatDate, formatTime, getNextMatch, isPastUpcoming, sortByDate } from '../utils/matchUtils'

function HomePage({ matches, actions, onNavigate, profile }) {
  const stats = calculateStats(matches)
  const nextMatch = getNextMatch(matches)
  // Próximos: los que todavía no se jugaron y los que falta confirmar si fue.
  const upcoming = matches.filter((m) => m.status === STATUS.UPCOMING)
  const toConfirm = upcoming.filter(isPastUpcoming).length
  const comingUp = upcoming.length - toConfirm
  // En el carrusel: los últimos partidos a los que el usuario fue.
  const latest = sortByDate(matches.filter((m) => m.status === STATUS.ATTENDED)).slice(0, 8)

  return (
    <>
      {/* ---------- Portada oscura ---------- */}
      <section className="band band-home">
        <div className="hero-media" aria-hidden="true" />

        <div className="band-content">
          <p className="kicker">{profile?.name ? `Hola, ${profile.name} · Mi vida como hincha` : 'Mi vida como hincha'}</p>
          <h1 className="display hero-title">
            <span>Mi historia</span>
            <span className="hero-title-indent">en la cancha</span>
          </h1>
        </div>

        <div className="hero-bottom">
          <Countdown match={nextMatch} />

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
                  {formatDate(nextMatch.date)} · {formatTime(nextMatch)}
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

        {/* ---------- Accesos rápidos ---------- */}
        <nav className="quick-actions" aria-label="Accesos rápidos">
          <button className="quick-action quick-action-primary" onClick={() => actions.onAdd()}>
            <Plus size={22} />
            <strong>Agregar partido</strong>
            <span>Sumá uno a tu historia</span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('proximos')}>
            <CalendarClock size={22} />
            <strong>Próximos</strong>
            <span>
              {upcoming.length === 0
                ? 'No tenés partidos agendados'
                : [
                    comingUp > 0 && `${comingUp} por venir`,
                    toConfirm > 0 && `${toConfirm} por confirmar si fuiste`,
                  ]
                    .filter(Boolean)
                    .join(' · ')}
            </span>
          </button>
          <button className="quick-action" onClick={() => onNavigate('estadisticas')}>
            <BarChart3 size={22} />
            <strong>Estadísticas</strong>
            <span>
              {stats.withResult > 0 ? `${stats.winRate}% de victorias con vos` : 'Tu récord en la cancha'}
            </span>
          </button>
        </nav>

        <section className="section-center">
          <h2 className="display section-title">Últimos partidos</h2>
          <p>Los partidos que viviste en la cancha. Tocá una tarjeta para editarla.</p>
        </section>

        {latest.length > 0 ? (
          <Carousel matches={latest} onOpen={actions.onEdit} />
        ) : (
          <EmptyState
            icon={Ticket}
            title={matches.length === 0 ? 'Todavía no registraste partidos' : 'Todavía no marcaste partidos como “Asistí”'}
            message={
              matches.length === 0
                ? 'Empezá tu diario de hincha agregando el primer partido al que fuiste.'
                : 'Acá van a aparecer los partidos a los que fuiste. Agregá uno o marcá tu asistencia en Próximos.'
            }
            action={
              <button className="btn btn-primary" onClick={() => actions.onAdd()}>
                <Plus size={18} /> Agregar partido
              </button>
            }
          />
        )}

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
