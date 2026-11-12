import { CalendarClock, Plus } from 'lucide-react'
import Countdown from '../components/Countdown'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import { STATUS, getNextMatch, isPastUpcoming, sortByDate } from '../utils/matchUtils'

// Usa la misma colección de partidos, filtrando los que tienen estado "Próximo".
// Se separan en dos grupos: los que ya se jugaron (falta decir si fue) y los que vienen.
function UpcomingPage({ matches, actions, busyId }) {
  const upcoming = matches.filter((m) => m.status === STATUS.UPCOMING)
  const pending = sortByDate(upcoming.filter(isPastUpcoming), true)
  const future = sortByDate(
    upcoming.filter((m) => !isPastUpcoming(m)),
    true
  )
  const nextMatch = getNextMatch(matches)
  const addUpcoming = () => actions.onAdd({ status: STATUS.UPCOMING })

  return (
    <>
      <PageHeader
        kicker="Agenda"
        image="/images/hinchada-banderas.webp"
        title="Próximos partidos"
        subtitle={
          nextMatch ? `Lo que falta para River vs ${nextMatch.rival}.` : 'Organizá los partidos a los que pensás ir.'
        }
        action={
          <button className="btn-pill btn-pill-light" onClick={addUpcoming}>
            <Plus size={18} /> Agregar próximo
          </button>
        }
      >
        {nextMatch && (
          <div className="band-countdown">
            <Countdown match={nextMatch} />
          </div>
        )}
      </PageHeader>

      <div className="sheet">
        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No tenés próximos partidos"
            message="Agendá el próximo partido de River al que pensás ir y activá la cuenta regresiva."
            action={
              <button className="btn btn-primary" onClick={addUpcoming}>
                <Plus size={18} /> Agregar próximo partido
              </button>
            }
          />
        ) : (
          <>
            {pending.length > 0 && (
              <section className="list-section">
                <div className="list-heading">
                  <h2 className="display">¿Fuiste?</h2>
                  <p>
                    {pending.length === 1 ? 'Este partido ya se jugó' : `Estos ${pending.length} partidos ya se jugaron`}.
                    Marcá si fuiste para que cuente en tus estadísticas.
                  </p>
                </div>
                <MatchList matches={pending} actions={actions} busyId={busyId} showStatusActions />
              </section>
            )}

            <section className="list-section">
              <div className="list-heading">
                <h2 className="display">Se vienen</h2>
                <p>En orden, del más cercano al más lejano.</p>
              </div>
              {future.length > 0 ? (
                <MatchList matches={future} actions={actions} busyId={busyId} showStatusActions />
              ) : (
                <EmptyState
                  icon={CalendarClock}
                  title="No hay partidos por venir"
                  message="Agendá el próximo partido al que pensás ir."
                  action={
                    <button className="btn btn-primary" onClick={addUpcoming}>
                      <Plus size={18} /> Agregar próximo partido
                    </button>
                  }
                />
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}

export default UpcomingPage
