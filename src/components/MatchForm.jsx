import { useState } from 'react'
import Modal from './Modal'
import { COMPETITIONS, STATUS, STATUS_LABELS } from '../utils/matchUtils'

const EMPTY_FORM = {
  rival: '',
  date: '',
  time: '',
  competition: '',
  stadium: '',
  riverGoals: '',
  rivalGoals: '',
  status: STATUS.ATTENDED,
  comment: '',
  favorite: false,
}

// Pasa un partido guardado al formato del formulario (los goles como texto).
function toFormValues(match, defaults) {
  if (!match) return { ...EMPTY_FORM, ...defaults }
  return {
    rival: match.rival ?? '',
    date: match.date ?? '',
    time: match.time ?? '',
    competition: match.competition ?? '',
    stadium: match.stadium ?? '',
    riverGoals: match.riverGoals ?? '',
    rivalGoals: match.rivalGoals ?? '',
    status: match.status ?? STATUS.ATTENDED,
    comment: match.comment ?? '',
    favorite: Boolean(match.favorite),
  }
}

// Un gol válido es un entero >= 0. El campo vacío también es válido.
function isValidGoal(value) {
  return value === '' || /^\d+$/.test(String(value))
}

function validate(values) {
  const errors = {}
  if (!values.rival.trim()) errors.rival = 'Ingresá el nombre del rival.'
  if (!values.date) errors.date = 'Elegí la fecha del partido.'
  if (!isValidGoal(values.riverGoals)) errors.riverGoals = 'Tiene que ser un número entero, 0 o mayor.'
  if (!isValidGoal(values.rivalGoals)) errors.rivalGoals = 'Tiene que ser un número entero, 0 o mayor.'

  // Si se carga un resultado, tienen que estar los dos goles.
  const oneEmpty = (values.riverGoals === '') !== (values.rivalGoals === '')
  if (!errors.riverGoals && !errors.rivalGoals && oneEmpty) {
    errors.result = 'Completá los goles de ambos equipos o dejá los dos vacíos.'
  }
  return errors
}

// Formulario para crear o editar un partido.
function MatchForm({ match, defaults, onSave, onClose }) {
  const isEditing = Boolean(match)
  const [values, setValues] = useState(() => toFormValues(match, defaults))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const newErrors = validate(values)
    setErrors(newErrors)
    if (Object.keys(newErrors).length > 0) return

    // Los goles vacíos se guardan como null (sin resultado), no como 0.
    const data = {
      rival: values.rival.trim(),
      date: values.date,
      time: values.time,
      competition: values.competition,
      stadium: values.stadium.trim(),
      riverGoals: values.riverGoals === '' ? null : Number(values.riverGoals),
      rivalGoals: values.rivalGoals === '' ? null : Number(values.rivalGoals),
      status: values.status,
      comment: values.comment.trim(),
      favorite: values.favorite,
    }

    setSaving(true)
    const ok = await onSave(data)
    // Si falló, el formulario queda abierto para reintentar.
    if (!ok) setSaving(false)
  }

  return (
    <Modal title={isEditing ? 'Editar partido' : 'Agregar partido'} onClose={saving ? () => {} : onClose}>
      <form className="match-form" onSubmit={handleSubmit} noValidate>
        <label className="field">
          <span>Rival *</span>
          <input
            name="rival"
            value={values.rival}
            onChange={handleChange}
            placeholder="Ej: Boca Juniors"
            aria-invalid={Boolean(errors.rival)}
            autoFocus
          />
          {errors.rival && <small className="field-error">{errors.rival}</small>}
        </label>

        <div className="form-row">
          <label className="field">
            <span>Fecha *</span>
            <input
              type="date"
              name="date"
              value={values.date}
              onChange={handleChange}
              aria-invalid={Boolean(errors.date)}
            />
            {errors.date && <small className="field-error">{errors.date}</small>}
          </label>

          <label className="field">
            <span>Hora</span>
            <input type="time" name="time" value={values.time} onChange={handleChange} />
            <small className="field-hint">Opcional. Se usa en la cuenta regresiva.</small>
          </label>
        </div>

        <div className="form-row">
          <label className="field">
            <span>Competición</span>
            <select name="competition" value={values.competition} onChange={handleChange}>
              <option value="">Sin especificar</option>
              {COMPETITIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Estadio o ubicación</span>
            <input
              name="stadium"
              value={values.stadium}
              onChange={handleChange}
              placeholder="Ej: Estadio Monumental"
            />
          </label>
        </div>

        <fieldset className="field">
          <legend>Estado</legend>
          <div className="segmented">
            {Object.values(STATUS).map((s) => (
              <label key={s} className={values.status === s ? 'segment active' : 'segment'}>
                <input type="radio" name="status" value={s} checked={values.status === s} onChange={handleChange} />
                {STATUS_LABELS[s]}
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="field">
          <legend>Resultado</legend>
          <div className="score-inputs">
            <label>
              <span>River</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                name="riverGoals"
                value={values.riverGoals}
                onChange={handleChange}
                placeholder="–"
                aria-invalid={Boolean(errors.riverGoals || errors.result)}
              />
            </label>
            <span className="score-divider">–</span>
            <label>
              <span>Rival</span>
              <input
                type="number"
                min="0"
                step="1"
                inputMode="numeric"
                name="rivalGoals"
                value={values.rivalGoals}
                onChange={handleChange}
                placeholder="–"
                aria-invalid={Boolean(errors.rivalGoals || errors.result)}
              />
            </label>
          </div>
          <small className="field-hint">Dejalo vacío si el partido todavía no se jugó.</small>
          {(errors.riverGoals || errors.rivalGoals || errors.result) && (
            <small className="field-error">{errors.riverGoals || errors.rivalGoals || errors.result}</small>
          )}
        </fieldset>

        <label className="field">
          <span>Comentario o recuerdo</span>
          <textarea
            name="comment"
            value={values.comment}
            onChange={handleChange}
            rows={3}
            maxLength={500}
            placeholder="¿Qué te acordás de ese partido? ¿Con quién fuiste?"
          />
        </label>

        <label className="checkbox">
          <input type="checkbox" name="favorite" checked={values.favorite} onChange={handleChange} />
          <span>Marcar como partido favorito</span>
        </label>

        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onClose} disabled={saving}>
            Cancelar
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default MatchForm
