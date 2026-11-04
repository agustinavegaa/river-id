import { CalendarClock, Plus } from 'lucide-react'
import Countdown from '../components/Countdown'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import { STATUS, getMatchDateTime, getNextMatch, isPastUpcoming, sortByDate } from '../utils/matchUtils'

// Usa la misma colección de partidos, filtrando los que tienen estado "Próximo".
function UpcomingPage({ matches, actions, busyId }) {
  const upcoming = sortByDate(
    matches.filter((m) => m.status === STATUS.UPCOMING),
    true
  )
  const nextMatch = getNextMatch(matches)
  const pastCount = upcoming.filter(isPastUpcoming).length
  const addUpcoming = () => actions.onAdd({ status: STATUS.UPCOMING })

  return (
    <>
      <PageHeader
        kicker="Agenda"
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
            <Countdown target={getMatchDateTime(nextMatch)} />
          </div>
        )}
      </PageHeader>

      <div className="sheet">
        {pastCount > 0 && (
          <p className="info-banner">
            Tenés {pastCount} {pastCount === 1 ? 'partido que ya se jugó' : 'partidos que ya se jugaron'}. Marcá si
            fuiste para que cuenten en tus estadísticas.
          </p>
        )}

        {upcoming.length === 0 ? (
          <EmptyState
            icon={CalendarClock}
            title="No tenés próximos partidos"
            message="Agendá el próximo partido de River al que pensás ir."
            action={
              <button className="btn btn-primary" onClick={addUpcoming}>
                <Plus size={18} /> Agregar próximo partido
              </button>
            }
          />
        ) : (
          <MatchList matches={upcoming} actions={actions} busyId={busyId} showStatusActions />
        )}
      </div>
    </>
  )
}

export default UpcomingPage
