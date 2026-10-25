import MatchCard from './MatchCard'

// Grilla de tarjetas de partidos.
// "actions" agrupa las funciones de editar, eliminar, favorito y cambio de estado.
function MatchList({ matches, actions, busyId, showStatusActions = false }) {
  return (
    <div className="match-grid">
      {matches.map((match) => (
        <MatchCard
          key={match.id}
          match={match}
          busy={busyId === match.id}
          onEdit={actions.onEdit}
          onDelete={actions.onDelete}
          onToggleFavorite={actions.onToggleFavorite}
          onChangeStatus={showStatusActions ? actions.onChangeStatus : undefined}
        />
      ))}
    </div>
  )
}

export default MatchList
