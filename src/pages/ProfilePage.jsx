import { useState } from 'react'
import { Plus, Users, X } from 'lucide-react'
import EmptyState from '../components/EmptyState'
import PageHeader from '../components/PageHeader'
import { STATUS, normalizeName } from '../utils/matchUtils'

const MAX_NAME = 30
const MAX_COMPANIONS = 20

// "Mi perfil": el nombre del hincha y su grupo de cancha
// (las personas con las que va a ver a River).
function ProfilePage({ matches, profile, profileError, onSaveProfile, onRetryProfile }) {
  const companions = profile?.companions || []

  const [name, setName] = useState(profile?.name || '')
  const [nameError, setNameError] = useState('')
  const [newCompanion, setNewCompanion] = useState('')
  const [companionError, setCompanionError] = useState('')
  const [saving, setSaving] = useState(false)

  // Cuántos partidos fue con cada compañero (solo "Asistí").
  function matchesWith(person) {
    return matches.filter((m) => m.status === STATUS.ATTENDED && (m.companions || []).includes(person)).length
  }

  async function save(changes) {
    setSaving(true)
    const ok = await onSaveProfile(changes)
    setSaving(false)
    return ok
  }

  async function handleSaveName(e) {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setNameError('Escribí tu nombre.')
    if (trimmed === profile?.name) return setNameError('Es el mismo nombre que ya tenías guardado.')
    await save({ name: trimmed })
  }

  async function handleAddCompanion(e) {
    e.preventDefault()
    const trimmed = newCompanion.trim().replace(/\s+/g, ' ')
    if (!trimmed) return setCompanionError('Escribí el nombre de quien va con vos.')
    if (trimmed.length > MAX_NAME) return setCompanionError(`El nombre puede tener hasta ${MAX_NAME} caracteres.`)
    const existing = companions.find((c) => normalizeName(c) === normalizeName(trimmed))
    if (existing) return setCompanionError(`${existing} ya está en tu grupo.`)
    if (companions.length >= MAX_COMPANIONS) {
      return setCompanionError(`Tu grupo puede tener hasta ${MAX_COMPANIONS} personas.`)
    }
    const ok = await save({ companions: [...companions, trimmed] })
    if (ok) setNewCompanion('')
  }

  async function handleRemove(person) {
    await save({ companions: companions.filter((c) => c !== person) })
  }

  return (
    <>
      <PageHeader
        kicker="Perfil del hincha"
        image="/images/hinchada-banderas.webp"
        title={profile?.name ? `Hola, ${profile.name}` : 'Mi perfil'}
        subtitle="Tu nombre y tu grupo de cancha: las personas con las que vas a ver a River."
      />

      <div className="sheet">
        {profileError ? (
          <div className="error-box" role="alert">
            <h2>No pudimos cargar tu perfil</h2>
            <p>{profileError}</p>
            <button className="btn btn-primary" onClick={onRetryProfile}>
              Reintentar
            </button>
          </div>
        ) : (
          <>
            {/* ---------- Nombre ---------- */}
            <section className="profile-card">
              <div className="list-heading">
                <h2 className="display">Tu nombre</h2>
                <p>Lo usamos para saludarte en la app.</p>
              </div>
              <form className="inline-form" onSubmit={handleSaveName} noValidate>
                <label className="field">
                  <span>Nombre</span>
                  <input
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value)
                      setNameError('')
                    }}
                    placeholder="Ej: Agustina"
                    maxLength={MAX_NAME}
                    aria-invalid={Boolean(nameError)}
                  />
                  {nameError && <small className="field-error">{nameError}</small>}
                </label>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? 'Guardando...' : 'Guardar nombre'}
                </button>
              </form>
            </section>

            {/* ---------- Grupo de cancha ---------- */}
            <section className="profile-card">
              <div className="list-heading">
                <h2 className="display">Mi grupo de cancha</h2>
                <p>
                  Sumá a las personas con las que vas a la cancha. Después, en cada partido, marcás con quién fuiste.
                </p>
              </div>

              <form className="inline-form" onSubmit={handleAddCompanion} noValidate>
                <label className="field">
                  <span>Agregar al grupo</span>
                  <input
                    value={newCompanion}
                    onChange={(e) => {
                      setNewCompanion(e.target.value)
                      setCompanionError('')
                    }}
                    placeholder="Ej: Papá, Juli, Martín"
                    maxLength={MAX_NAME}
                    aria-invalid={Boolean(companionError)}
                  />
                  {companionError && <small className="field-error">{companionError}</small>}
                </label>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  <Plus size={18} /> Agregar
                </button>
              </form>

              {companions.length === 0 ? (
                <EmptyState
                  icon={Users}
                  title="Tu grupo está vacío"
                  message="Agregá a tu familia, a tus amigos o a quien te acompañe al Monumental."
                />
              ) : (
                <>
                  <ul className="companion-list">
                    {companions.map((person) => (
                      <li key={person} className="companion">
                        <span className="companion-initial">{person.charAt(0).toUpperCase()}</span>
                        <span className="companion-text">
                          <strong>{person}</strong>
                          <small>
                            {matchesWith(person) === 1
                              ? '1 partido juntos'
                              : `${matchesWith(person)} partidos juntos`}
                          </small>
                        </span>
                        <button
                          className="icon-btn"
                          onClick={() => handleRemove(person)}
                          disabled={saving}
                          aria-label={`Sacar a ${person} del grupo`}
                          title={`Sacar a ${person} del grupo`}
                        >
                          <X size={18} />
                        </button>
                      </li>
                    ))}
                  </ul>
                  <p className="stats-note">
                    {companions.length} de {MAX_COMPANIONS} personas. Si sacás a alguien del grupo, los partidos donde
                    lo marcaste lo siguen mostrando.
                  </p>
                </>
              )}
            </section>
          </>
        )}
      </div>
    </>
  )
}

export default ProfilePage
