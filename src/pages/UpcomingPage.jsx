import { CalendarClock, Plus } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import { STATUS, sortByDate } from '../utils/matchUtils'

// Usa la misma colección de partidos, filtrando los que tienen estado "Próximo".
function UpcomingPage({ matches, actions, busyId }) {
  const upcoming = sortByDate(
    matches.filter((m) => m.status === STATUS.UPCOMING),
    true
  )
  const addUpcoming = () => actions.onAdd({ status: STATUS.UPCOMING })

  return (
    <div className="page">
      <PageHeader
        title="Próximos partidos"
        subtitle="Organizá los partidos que se vienen. Después del partido, marcá si fuiste."
        action={
          <button className="btn btn-primary" onClick={addUpcoming}>
            <Plus size={18} /> Agregar próximo
          </button>
        }
      />

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
  )
}

export default UpcomingPage
