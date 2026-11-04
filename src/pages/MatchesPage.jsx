import { useState } from 'react'
import { ListChecks, Plus, Search } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import { STATUS, sortByDate } from '../utils/matchUtils'

const FILTERS = [
  { id: 'todos', label: 'Todos', test: () => true },
  { id: 'asisti', label: 'Asistí', test: (m) => m.status === STATUS.ATTENDED },
  { id: 'no_asisti', label: 'No asistí', test: (m) => m.status === STATUS.NOT_ATTENDED },
  { id: 'proximo', label: 'Próximos', test: (m) => m.status === STATUS.UPCOMING },
  { id: 'favoritos', label: 'Favoritos', test: (m) => m.favorite },
]

function MatchesPage({ matches, actions, busyId }) {
  const [filter, setFilter] = useState('todos')
  const [search, setSearch] = useState('')

  const activeFilter = FILTERS.find((f) => f.id === filter)
  // La búsqueda compara el texto sin importar mayúsculas.
  const searchText = search.trim().toLowerCase()
  const visible = sortByDate(
    matches.filter((m) => activeFilter.test(m) && m.rival.toLowerCase().includes(searchText))
  )

  return (
    <>
      <PageHeader
        kicker="Historial"
        title="Mis partidos"
        subtitle="Tu historia completa como hincha, partido por partido."
        action={
          <button className="btn-pill btn-pill-light" onClick={() => actions.onAdd()}>
            <Plus size={18} /> Agregar partido
          </button>
        }
      />

      <div className="sheet">
        {matches.length === 0 ? (
          <EmptyState
            icon={ListChecks}
            title="Tu historial está vacío"
            message="Agregá un partido para empezar a construir tu historia como hincha."
            action={
              <button className="btn btn-primary" onClick={() => actions.onAdd()}>
                <Plus size={18} /> Agregar partido
              </button>
            }
          />
        ) : (
          <>
            <div className="toolbar">
              <label className="search">
                <Search size={18} />
                <input
                  type="search"
                  placeholder="Buscar por rival"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  aria-label="Buscar por rival"
                />
              </label>

              <div className="filters" role="tablist">
                {FILTERS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={filter === f.id}
                    className={filter === f.id ? 'chip active' : 'chip'}
                    onClick={() => setFilter(f.id)}
                  >
                    {f.label} <span className="chip-count">{matches.filter(f.test).length}</span>
                  </button>
                ))}
              </div>
            </div>

            {visible.length === 0 ? (
              <p className="muted">
                {searchText ? `No hay partidos contra "${search.trim()}" en esta categoría.` : 'No hay partidos en esta categoría.'}
              </p>
            ) : (
              <MatchList matches={visible} actions={actions} busyId={busyId} />
            )}
          </>
        )}
      </div>
    </>
  )
}

export default MatchesPage
