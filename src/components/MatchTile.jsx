import { Star } from 'lucide-react'
import Logo from './Logo'
import { OUTCOME_LABELS, formatDate, getOutcome, hasResult } from '../utils/matchUtils'

// Tarjeta vertical para el carrusel del inicio. Al tocarla se edita el partido.
// La parte de arriba es un bloque de color que más adelante será una foto.
function MatchTile({ match, onOpen }) {
  const outcome = getOutcome(match)

  return (
    <button className={`match-tile tile-${outcome || match.status}`} onClick={() => onOpen(match)}>
      <div className="tile-media img-ph" aria-hidden="true" />
      <div className="tile-top">
        <span className="tile-logo">
          <Logo size={24} />
        </span>
        {match.competition && <span className="tag">{match.competition}</span>}
      </div>
      <div className="tile-bottom">
        {match.favorite && <Star size={16} fill="currentColor" className="tile-star" />}
        <strong>vs {match.rival}</strong>
        <span>
          {hasResult(match) ? `${match.riverGoals} – ${match.rivalGoals} · ${OUTCOME_LABELS[outcome]}` : 'Sin resultado'}
        </span>
        <small>{formatDate(match.date)}</small>
      </div>
    </button>
  )
}

export default MatchTile
