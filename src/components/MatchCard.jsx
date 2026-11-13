import { useEffect, useRef, useState } from 'react'
import { CalendarDays, MapPin, MessageSquareQuote, Pencil, Star, Trash2, Trophy, Users } from 'lucide-react'
import {
  OUTCOME_LABELS,
  STATUS,
  STATUS_LABELS,
  canMarkAttendance,
  formatDate,
  formatTime,
  getOutcome,
  joinNames,
  hasResult,
  isPastUpcoming,
} from '../utils/matchUtils'

// Tarjeta que muestra la información de un partido y sus acciones.
function MatchCard({ match, busy, onEdit, onDelete, onToggleFavorite, onChangeStatus }) {
  const outcome = getOutcome(match)
  const isUpcoming = match.status === STATUS.UPCOMING
  // Un próximo que ya se jugó: le preguntamos al usuario si fue.
  const isPast = isPastUpcoming(match)
  // Los botones de asistencia solo aparecen desde el día del partido.
  const showAttendance = isUpcoming && onChangeStatus && canMarkAttendance(match)

  // Animación de la estrella: se activa cuando el partido PASA a ser favorito
  // (después de que Firestore lo guardó), no al cargar la página.
  const [starPop, setStarPop] = useState(false)
  const wasFavorite = useRef(match.favorite)
  useEffect(() => {
    if (match.favorite && !wasFavorite.current) setStarPop(true)
    wasFavorite.current = match.favorite
  }, [match.favorite])

  return (
    <article className={`match-card ${busy ? 'is-busy' : ''} ${isPast ? 'is-past' : ''}`}>
      <div className="match-card-top">
        <span className={`badge badge-${match.status}`}>{STATUS_LABELS[match.status]}</span>
        <button
          className={`icon-btn favorite-btn ${match.favorite ? 'is-favorite' : ''} ${starPop ? 'star-pop' : ''}`}
          onAnimationEnd={() => setStarPop(false)}
          onClick={() => onToggleFavorite(match)}
          disabled={busy}
          aria-label={match.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          title={match.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
        >
          <Star size={20} fill={match.favorite ? 'currentColor' : 'none'} />
        </button>
      </div>

      <div className="match-teams">
        <span className="team">River</span>
        {hasResult(match) ? (
          <span className={`score score-${outcome}`}>
            {match.riverGoals} – {match.rivalGoals}
          </span>
        ) : (
          <span className="score score-empty">vs</span>
        )}
        <span className="team">{match.rival}</span>
      </div>

      {outcome && <p className={`outcome outcome-${outcome}`}>{OUTCOME_LABELS[outcome]}</p>}

      <ul className="match-meta">
        <li>
          <CalendarDays size={16} /> {formatDate(match.date)}
          {(match.time || isUpcoming) && ` · ${formatTime(match)}`}
        </li>
        {match.competition && (
          <li>
            <Trophy size={16} /> {match.competition}
          </li>
        )}
        {match.stadium && (
          <li>
            <MapPin size={16} /> {match.stadium}
          </li>
        )}
        {match.companions?.length > 0 && (
          <li>
            <Users size={16} /> {isUpcoming ? 'Vas con' : 'Con'} {joinNames(match.companions)}
          </li>
        )}
      </ul>

      {match.comment && (
        <p className="match-comment">
          <MessageSquareQuote size={16} />
          <span>{match.comment}</span>
        </p>
      )}

      {/* En "Próximos" se puede marcar si fue o no al partido */}
      {isPast && <p className="past-notice">Este partido ya se jugó. ¿Fuiste?</p>}

      {showAttendance && (
        <div className="status-actions">
          <button
            className="btn btn-small btn-primary"
            onClick={() => onChangeStatus(match, STATUS.ATTENDED)}
            disabled={busy}
          >
            Asistí
          </button>
          <button
            className="btn btn-small btn-secondary"
            onClick={() => onChangeStatus(match, STATUS.NOT_ATTENDED)}
            disabled={busy}
          >
            No asistí
          </button>
        </div>
      )}

      <div className="match-actions">
        <button className="btn btn-ghost" onClick={() => onEdit(match)} disabled={busy}>
          <Pencil size={16} /> Editar
        </button>
        <button className="btn btn-ghost btn-ghost-danger" onClick={() => onDelete(match)} disabled={busy}>
          <Trash2 size={16} /> Eliminar
        </button>
      </div>
    </article>
  )
}

export default MatchCard
