import { CalendarDays, MapPin, MessageSquareQuote, Pencil, Star, Trash2, Trophy } from 'lucide-react'
import { STATUS, STATUS_LABELS, formatDate, getOutcome, hasResult, isPastUpcoming } from '../utils/matchUtils'

const OUTCOME_LABELS = { victoria: 'Victoria', empate: 'Empate', derrota: 'Derrota' }

// Tarjeta que muestra la información de un partido y sus acciones.
function MatchCard({ match, busy, onEdit, onDelete, onToggleFavorite, onChangeStatus }) {
  const outcome = getOutcome(match)
  const isUpcoming = match.status === STATUS.UPCOMING
  // Un próximo cuya fecha ya pasó: le preguntamos al usuario si fue.
  const isPast = isPastUpcoming(match)

  return (
    <article className={`match-card ${busy ? 'is-busy' : ''} ${isPast ? 'is-past' : ''}`}>
      <div className="match-card-top">
        <span className={`badge badge-${match.status}`}>{STATUS_LABELS[match.status]}</span>
        <button
          className={`icon-btn favorite-btn ${match.favorite ? 'is-favorite' : ''}`}
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
          {match.time && ` · ${match.time} h`}
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
      </ul>

      {match.comment && (
        <p className="match-comment">
          <MessageSquareQuote size={16} />
          <span>{match.comment}</span>
        </p>
      )}

      {/* En "Próximos" se puede marcar si fue o no al partido */}
      {isPast && <p className="past-notice">Este partido ya se jugó. ¿Fuiste?</p>}

      {isUpcoming && onChangeStatus && (
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
