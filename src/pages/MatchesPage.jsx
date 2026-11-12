import { useState } from 'react'
import { ListChecks, Plus, Search, SearchX, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import MatchList from '../components/MatchList'
import PageHeader from '../components/PageHeader'
import { STATUS, getOutcome, sortByDate } from '../utils/matchUtils'

const STATUS_FILTERS = [
  { id: 'todos', label: 'Todos', test: () => true },
  { id: 'asisti', label: 'Asistí', test: (m) => m.status === STATUS.ATTENDED },
  { id: 'no_asisti', label: 'No asistí', test: (m) => m.status === STATUS.NOT_ATTENDED },
  { id: 'proximo', label: 'Próximos', test: (m) => m.status === STATUS.UPCOMING },
  { id: 'favoritos', label: 'Favoritos', test: (m) => m.favorite },
]

const INITIAL_FILTERS = {
  search: '',
  status: 'todos',
  result: 'todos',
  competition: 'todas',
  order: 'recientes',
}

function MatchesPage({ matches, actions, busyId }) {
  const [filters, setFilters] = useState(INITIAL_FILTERS)

  function updateFilter(name, value) {
    setFilters((prev) => ({ ...prev, [name]: value }))
  }

  function clearFilters() {
    setFilters(INITIAL_FILTERS)
  }

  // Solo ofrecemos las competiciones que el usuario realmente usó.
  const competitions = [...new Set(matches.map((m) => m.competition).filter(Boolean))].sort((a, b) =>
    a.localeCompare(b, 'es')
  )

  // Todos los filtros se combinan entre sí.
  const searchText = filters.search.trim().toLowerCase()
  const statusFilter = STATUS_FILTERS.find((f) => f.id === filters.status)
  const filtered = matches.filter(
    (m) =>
      statusFilter.test(m) &&
      m.rival.toLowerCase().includes(searchText) &&
      (filters.result === 'todos' || getOutcome(m) === filters.result) &&
      (filters.competition === 'todas' || m.competition === filters.competition)
  )
  const visible = sortByDate(filtered, filters.order === 'antiguos')

  const hasActiveFilters =
    filters.search !== '' || filters.status !== 'todos' || filters.result !== 'todos' || filters.competition !== 'todas'

  return (
    <>
      <PageHeader
        kicker="Historial"
        image="/images/hinchada-camisetas.webp"
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
              <div className="toolbar-row">
                <label className="search">
                  <Search size={18} />
                  <input
                    type="search"
                    placeholder="Buscar por rival"
                    value={filters.search}
                    onChange={(e) => updateFilter('search', e.target.value)}
                    aria-label="Buscar por rival"
                  />
                </label>

                <select
                  className="select"
                  value={filters.result}
                  onChange={(e) => updateFilter('result', e.target.value)}
                  aria-label="Filtrar por resultado"
                >
                  <option value="todos">Todos los resultados</option>
                  <option value="victoria">Victorias</option>
                  <option value="empate">Empates</option>
                  <option value="derrota">Derrotas</option>
                </select>

                <select
                  className="select"
                  value={filters.competition}
                  onChange={(e) => updateFilter('competition', e.target.value)}
                  aria-label="Filtrar por competición"
                >
                  <option value="todas">Todas las competiciones</option>
                  {competitions.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>

                <select
                  className="select"
                  value={filters.order}
                  onChange={(e) => updateFilter('order', e.target.value)}
                  aria-label="Ordenar por fecha"
                >
                  <option value="recientes">Más recientes primero</option>
                  <option value="antiguos">Más antiguos primero</option>
                </select>
              </div>

              <div className="filters" role="tablist" aria-label="Filtrar por estado">
                {STATUS_FILTERS.map((f) => (
                  <button
                    key={f.id}
                    role="tab"
                    aria-selected={filters.status === f.id}
                    className={filters.status === f.id ? 'chip active' : 'chip'}
                    onClick={() => updateFilter('status', f.id)}
                  >
                    {f.label} <span className="chip-count">{matches.filter(f.test).length}</span>
                  </button>
                ))}
              </div>

              <div className="results-bar">
                <p>
                  Mostrando <strong>{visible.length}</strong> de {matches.length}{' '}
                  {matches.length === 1 ? 'partido' : 'partidos'}
                </p>
                {hasActiveFilters && (
                  <button className="link-btn" onClick={clearFilters}>
                    <X size={16} /> Limpiar filtros
                  </button>
                )}
              </div>
            </div>

            {visible.length === 0 ? (
              <EmptyState
                icon={SearchX}
                title="No encontramos partidos"
                message={
                  searchText
                    ? `No hay partidos contra “${filters.search.trim()}” con los filtros elegidos.`
                    : 'Ningún partido coincide con los filtros elegidos.'
                }
                action={
                  <button className="btn btn-secondary" onClick={clearFilters}>
                    Limpiar filtros
                  </button>
                }
              />
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
