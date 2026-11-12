import { useRef, useState } from 'react'
import Logo from './Logo'
import Modal from './Modal'

const MAX_NAME = 30

// Bienvenida: la primera vez le preguntamos el nombre al hincha.
// Se puede saltear; después se carga desde "Mi perfil".
function WelcomeModal({ onSave, onSkip }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const submittingRef = useRef(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (submittingRef.current) return
    const trimmed = name.trim()
    if (!trimmed) {
      setError('Escribí tu nombre o tocá “Ahora no”.')
      return
    }
    submittingRef.current = true
    setSaving(true)
    const ok = await onSave({ name: trimmed })
    if (!ok) {
      submittingRef.current = false
      setSaving(false)
    }
  }

  return (
    <Modal title="¡Bienvenido, hincha!" onClose={saving ? () => {} : onSkip} size="sm">
      <form className="welcome" onSubmit={handleSubmit} noValidate>
        <Logo size={56} />
        <p>River ID es tu diario de hincha. ¿Cómo te llamás? Lo usamos para personalizar la app.</p>
        <label className="field">
          <span>Tu nombre</span>
          <input
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              setError('')
            }}
            placeholder="Ej: Agustina"
            maxLength={MAX_NAME}
            aria-invalid={Boolean(error)}
            autoFocus
          />
          {error && <small className="field-error">{error}</small>}
        </label>
        <div className="modal-actions">
          <button type="button" className="btn btn-secondary" onClick={onSkip} disabled={saving}>
            Ahora no
          </button>
          <button type="submit" className="btn btn-primary" disabled={saving}>
            {saving ? 'Guardando...' : 'Empezar'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default WelcomeModal
