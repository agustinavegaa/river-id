import { useRef, useState } from 'react'
import Modal from './Modal'
import { COMPETITIONS, STATUS, STATUS_LABELS, formatDate, normalizeName, todayString } from '../utils/matchUtils'

const MAX_RIVAL = 40
const MAX_GOALS = 30
const MAX_COMMENT = 500

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
  companions: [],
}

// Pasa un partido guardado al formato del formulario (los goles como texto).
// "defaults" pisa algunos valores: por ejemplo, el estado "Asistí" al marcar asistencia.
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
    companions: match.companions || [],
    ...defaults,
  }
}

// Un gol válido es un entero entre 0 y MAX_GOALS. El campo vacío también es válido.
function goalError(value) {
  if (value === '') return null
  if (!/^\d+$/.test(String(value))) return 'Los goles tienen que ser un número entero, 0 o mayor.'
  if (Number(value) > MAX_GOALS) return `Revisá los goles: el máximo es ${MAX_GOALS}.`
  return null
}

// Orden de los campos en pantalla: se usa para llevar el cursor al primer error.
const FIELD_ORDER = ['rival', 'date', 'status', 'riverGoals', 'rivalGoals']

function validate(values, matches, editingId) {
  const errors = {}
  const rival = values.rival.trim()
  const isUpcoming = values.status === STATUS.UPCOMING

  if (!rival) errors.rival = 'Ingresá el nombre del rival.'
  else if (rival.length > MAX_RIVAL) errors.rival = `El nombre del rival puede tener hasta ${MAX_RIVAL} caracteres.`

  if (!values.date) errors.date = 'Elegí la fecha del partido.'
  else if (!isUpcoming && values.date > todayString()) {
    errors.status = 'Este partido todavía no se jugó: marcalo como “Próximo”.'
  }

  // El resultado solo se valida si el partido ya se jugó.
  if (!isUpcoming) {
    const riverError = goalError(values.riverGoals)
    const rivalError = goalError(values.rivalGoals)
    if (riverError) errors.riverGoals = riverError
    if (rivalError) errors.rivalGoals = rivalError
    const oneEmpty = (values.riverGoals === '') !== (values.rivalGoals === '')
    if (!riverError && !rivalError && oneEmpty) {
      errors[values.riverGoals === '' ? 'riverGoals' : 'rivalGoals'] =
        'Completá los goles de ambos equipos o dejá los dos vacíos.'
    }
  }

  // Duplicados: mismo rival en la misma fecha (sin contar el partido que se está editando).
  if (!errors.rival && values.date) {
    const duplicate = matches.find(
      (m) => m.id !== editingId && m.date === values.date && normalizeName(m.rival) === normalizeName(rival)
    )
    if (duplicate) {
      errors.rival = `Ya registraste River vs ${duplicate.rival} el ${formatDate(values.date)}.`
    }
  }

  return errors
}

// Formulario para crear o editar un partido.
function MatchForm({ match, defaults, matches, companions, onSave, onClose, onOpenProfile }) {
  const isEditing = Boolean(match)
  const [values, setValues] = useState(() => toFormValues(match, defaults))
  const [errors, setErrors] = useState({})
  const [saving, setSaving] = useState(false)
  const formRef = useRef(null)
  // Evita guardar dos veces si se aprieta "Guardar" o Enter muy rápido.
  const submittingRef = useRef(false)

  const isUpcoming = values.status === STATUS.UPCOMING
  // Opciones: el grupo actual + quienes ya estaban marcados en este partido
  // (por si después los sacó del grupo, no se pierden).
  const companionOptions = [...companions, ...values.companions.filter((c) => !companions.includes(c))]

  function toggleCompanion(person) {
    setValues((prev) => ({
      ...prev,
      companions: prev.companions.includes(person)
        ? prev.companions.filter((c) => c !== person)
        : [...prev.companions, person],
    }))
  }

  function handleChange(e) {
    const { name, value, type, checked } = e.target
    setValues((prev) => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    // Al corregir un campo, sacamos su error.
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittingRef.current) return

    const newErrors = validate(values, matches, match?.id)
    setErrors(newErrors)
    const firstError = FIELD_ORDER.find((field) => newErrors[field])
    if (firstError) {
      formRef.current.elements[firstError]?.focus?.()
      return
    }

    // Los goles vacíos se guardan como null (sin resultado), no como 0.
    // Un partido "Próximo" no tiene resultado todavía.
    const data = {
      rival: values.rival.trim(),
      date: values.date,
      time: values.time,
      competition: values.competition,
      stadium: values.stadium.trim(),
      riverGoals: isUpcoming || values.riverGoals === '' ? null : Number(values.riverGoals),
      rivalGoals: isUpcoming || values.rivalGoals === '' ? null : Number(values.rivalGoals),
      status: values.status,
      comment: values.comment.trim(),
      favorite: values.favorite,
      // Se guardan en el mismo orden que el grupo.
      companions: companionOptions.filter((c) => values.companions.includes(c)),
    }

    submittingRef.current = true
    setSaving(true)
    const ok = await onSave(data)
    // Si falló, el formulario queda abierto para reintentar.
    if (!ok) {
      submittingRef.current = false
      setSaving(false)
    }
  }

  const title = defaults?.status === STATUS.ATTENDED && isEditing ? '¿Cómo salió?' : isEditing ? 'Editar partido' : 'Agregar partido'
  const goalsError = errors.riverGoals || errors.rivalGoals

  return (
    <Modal title={title} onClose={saving ? () => {} : onClose}>
      <form className="match-form" onSubmit={handleSubmit} noValidate ref={formRef}>
        <p className="form-note">
          Los campos con <span className="required">*</span> son obligatorios.
        </p>

        {/* ---------- Datos del partido ---------- */}
        <section className="form-section">
          <h3>Datos del partido</h3>

          <label className="field">
            <span>
              Rival <span className="required">*</span>
            </span>
            <input
              name="rival"
              value={values.rival}
              onChange={handleChange}
              placeholder="Ej: Boca Juniors"
              maxLength={MAX_RIVAL}
              aria-invalid={Boolean(errors.rival)}
              autoFocus={!isEditing}
            />
            {errors.rival && <small className="field-error">{errors.rival}</small>}
          </label>

          <div className="form-row">
            <label className="field">
              <span>
                Fecha <span className="required">*</span>
              </span>
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
              <small className="field-hint">Opcional. Si no la sabés, dejala vacía.</small>
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
                maxLength={60}
              />
            </label>
          </div>
        </section>

        {/* ---------- Estado y resultado ---------- */}
        <section className="form-section">
          <h3>Estado y resultado</h3>

          <fieldset className="field">
            <legend>
              ¿Fuiste? <span className="required">*</span>
            </legend>
            <div className="segmented" aria-invalid={Boolean(errors.status)}>
              {Object.values(STATUS).map((s) => (
                <label key={s} className={values.status === s ? 'segment active' : 'segment'}>
                  <input type="radio" name="status" value={s} checked={values.status === s} onChange={handleChange} />
                  {STATUS_LABELS[s]}
                </label>
              ))}
            </div>
            {errors.status && <small className="field-error">{errors.status}</small>}
          </fieldset>

          {isUpcoming ? (
            <p className="field-hint form-info">El resultado se carga después del partido, cuando marques si fuiste.</p>
          ) : (
            <fieldset className="field">
              <legend>Resultado</legend>
              <div className="score-inputs">
                <label>
                  <span>River</span>
                  <input
                    type="number"
                    min="0"
                    max={MAX_GOALS}
                    step="1"
                    inputMode="numeric"
                    name="riverGoals"
                    value={values.riverGoals}
                    onChange={handleChange}
                    placeholder="–"
                    aria-invalid={Boolean(errors.riverGoals)}
                  />
                </label>
                <span className="score-divider">–</span>
                <label>
                  <span>Rival</span>
                  <input
                    type="number"
                    min="0"
                    max={MAX_GOALS}
                    step="1"
                    inputMode="numeric"
                    name="rivalGoals"
                    value={values.rivalGoals}
                    onChange={handleChange}
                    placeholder="–"
                    aria-invalid={Boolean(errors.rivalGoals)}
                  />
                </label>
              </div>
              <small className="field-hint">Opcional. Si no te acordás, dejalo vacío: no cuenta como 0 a 0.</small>
              {goalsError && <small className="field-error">{goalsError}</small>}
            </fieldset>
          )}
        </section>

        {/* ---------- Tu recuerdo ---------- */}
        <section className="form-section">
          <h3>Tu recuerdo</h3>

          <label className="field">
            <span>Comentario</span>
            <textarea
              name="comment"
              value={values.comment}
              onChange={handleChange}
              rows={3}
              maxLength={MAX_COMMENT}
              placeholder="¿Qué te acordás de ese partido? ¿Con quién fuiste?"
            />
            <small className="field-hint field-counter">
              {values.comment.length}/{MAX_COMMENT}
            </small>
          </label>

          <fieldset className="field">
            <legend>{isUpcoming ? '¿Con quién vas?' : '¿Con quién fuiste?'}</legend>
            {companionOptions.length > 0 ? (
              <div className="companion-picker">
                {companionOptions.map((person) => (
                  <label
                    key={person}
                    className={values.companions.includes(person) ? 'pick-chip active' : 'pick-chip'}
                  >
                    <input
                      type="checkbox"
                      checked={values.companions.includes(person)}
                      onChange={() => toggleCompanion(person)}
                    />
                    {person}
                  </label>
                ))}
              </div>
            ) : (
              <p className="field-hint form-info">
                Todavía no armaste tu grupo de cancha.{' '}
                <button type="button" className="link-btn" onClick={onOpenProfile}>
                  Armarlo en Mi perfil
                </button>
              </p>
            )}
          </fieldset>

          <label className="checkbox">
            <input type="checkbox" name="favorite" checked={values.favorite} onChange={handleChange} />
            <span>Marcar como partido favorito</span>
          </label>
        </section>

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
