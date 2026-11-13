import { useEffect, useState } from 'react'
import ConfirmDialog from './components/ConfirmDialog'
import Confetti from './components/Confetti'
import Loader from './components/Loader'
import Logo from './components/Logo'
import Header from './components/Header'
import MatchForm from './components/MatchForm'
import PageHeader from './components/PageHeader'
import Toast from './components/Toast'
import WelcomeModal from './components/WelcomeModal'
import { isFirebaseConfigured } from './firebase/config'
import HomePage from './pages/HomePage'
import MatchesPage from './pages/MatchesPage'
import ProfilePage from './pages/ProfilePage'
import StatsPage from './pages/StatsPage'
import UpcomingPage from './pages/UpcomingPage'
import { listenToUser } from './services/authService'
import { addMatch, deleteMatch, getMatches, updateMatch } from './services/matchesService'
import { getProfile, saveProfile } from './services/profileService'
import { getErrorMessage, offlineError } from './utils/errors'
import { STATUS, STATUS_LABELS, getOutcome } from './utils/matchUtils'
import { prefersReducedMotion } from './utils/motion'

// Recordamos en el navegador si el usuario salteó la bienvenida (solo comodidad;
// los datos reales del perfil se guardan en Firestore).
const WELCOME_KEY = 'riverid-welcome-skipped'

function readWelcomeSkipped() {
  try {
    return localStorage.getItem(WELCOME_KEY) === 'yes'
  } catch {
    return false
  }
}

function App() {
  const [user, setUser] = useState(null)
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [loadError, setLoadError] = useState('')
  const [currentPage, setCurrentPage] = useState('inicio')
  const [toast, setToast] = useState(null)
  // Formulario: null = cerrado; { match, defaults } = abierto
  const [form, setForm] = useState(null)
  const [matchToDelete, setMatchToDelete] = useState(null)
  const [deleting, setDeleting] = useState(false)
  // id del partido que se está actualizando (favorito / estado)
  const [busyId, setBusyId] = useState(null)
  // Perfil (versión 4): nombre y grupo de cancha. null = todavía no tiene perfil.
  const [profile, setProfile] = useState(null)
  const [profileLoaded, setProfileLoaded] = useState(false)
  const [profileError, setProfileError] = useState('')
  const [welcomeSkipped, setWelcomeSkipped] = useState(() => readWelcomeSkipped())
  // Confeti al cargar una victoria (versión final)
  const [celebrating, setCelebrating] = useState(false)

  // 1. Al iniciar, Firebase Authentication nos da un usuario anónimo.
  useEffect(() => {
    if (!isFirebaseConfigured) return
    const unsubscribe = listenToUser(
      (firebaseUser) => setUser(firebaseUser),
      (error) => {
        console.error(error)
        setLoadError(getErrorMessage(error, 'No se pudo iniciar sesión. Recargá la página para intentar de nuevo.'))
        setLoading(false)
      }
    )
    return unsubscribe
  }, [])

  // 2. Cuando tenemos usuario, consultamos sus partidos y su perfil en Firestore.
  useEffect(() => {
    if (user) {
      loadMatches(user.uid)
      loadProfile(user.uid)
    }
  }, [user])

  // Al cambiar de pantalla, volvemos al principio de la página.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [currentPage])

  // El confeti se va solo a los 3,5 segundos.
  useEffect(() => {
    if (!celebrating) return
    const timer = setTimeout(() => setCelebrating(false), 3500)
    return () => clearTimeout(timer)
  }, [celebrating])

  // Los mensajes desaparecen solos después de unos segundos.
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 3500)
    return () => clearTimeout(timer)
  }, [toast])

  async function loadMatches(uid) {
    try {
      const data = await getMatches(uid)
      setMatches(data)
      setLoadError('')
    } catch (error) {
      console.error(error)
      setLoadError(getErrorMessage(error, 'No se pudieron cargar tus partidos. Intentá de nuevo en unos segundos.'))
    } finally {
      setLoading(false)
    }
  }

  // El perfil se carga aparte: si falla, el resto de la app sigue funcionando.
  async function loadProfile(uid) {
    try {
      setProfile(await getProfile(uid))
      setProfileError('')
    } catch (error) {
      console.error(error)
      setProfileError(getErrorMessage(error, 'No se pudo cargar tu perfil. Intentá de nuevo.'))
    } finally {
      setProfileLoaded(true)
    }
  }

  // Guarda el nombre y/o el grupo. Devuelve true si se guardó.
  async function handleSaveProfile(changes) {
    const updated = { name: profile?.name || '', companions: profile?.companions || [], ...changes }
    try {
      checkOnline()
      await saveProfile(user.uid, updated)
      // Volvemos a leer para mostrar lo que realmente quedó guardado.
      await loadProfile(user.uid)
      showToast(changes.name ? `¡Listo, ${changes.name}!` : 'Grupo de cancha actualizado.')
      return true
    } catch (error) {
      console.error(error)
      showToast(getErrorMessage(error, 'No se pudo guardar tu perfil. Intentá de nuevo.'), 'error')
      return false
    }
  }

  // "Ahora no" en la bienvenida: lo recordamos en este navegador para no insistir.
  function skipWelcome() {
    try {
      localStorage.setItem(WELCOME_KEY, 'yes')
    } catch {
      // Si el navegador no deja guardar, solo se vuelve a mostrar la próxima vez.
    }
    setWelcomeSkipped(true)
  }

  function showToast(message, type = 'success') {
    setToast({ message, type })
  }

  // Si el navegador sabe que no hay internet, avisamos enseguida
  // en vez de dejar al usuario esperando un guardado que no va a llegar.
  function checkOnline() {
    if (!navigator.onLine) throw offlineError()
  }

  // ¿Hay que festejar? Solo si queda guardada una victoria a la que fue
  // y antes no lo era (así no festeja cada vez que edita el comentario).
  function isNewWin(data, previous) {
    const isWin = data.status === STATUS.ATTENDED && getOutcome(data) === 'victoria'
    const wasWin = previous && previous.status === STATUS.ATTENDED && getOutcome(previous) === 'victoria'
    return isWin && !wasWin
  }

  // Crear o editar. Devuelve true si se guardó, false si falló.
  async function handleSave(data) {
    const celebrate = isNewWin(data, form.match)
    try {
      checkOnline()
      if (form.match) {
        await updateMatch(form.match.id, data)
        showToast(celebrate ? '¡Victoria! Partido actualizado.' : 'Partido actualizado.')
      } else {
        await addMatch(user.uid, data)
        showToast(celebrate ? '¡Victoria! Partido guardado en tu historial.' : 'Partido guardado en tu historial.')
      }
      // El confeti sale recién después de que Firestore confirmó el guardado.
      if (celebrate && !prefersReducedMotion()) setCelebrating(true)
      // Volvemos a leer de Firestore para mostrar lo que realmente quedó guardado.
      await loadMatches(user.uid)
      setForm(null)
      return true
    } catch (error) {
      console.error(error)
      showToast(getErrorMessage(error, 'No se pudo guardar el partido. Intentá de nuevo.'), 'error')
      return false
    }
  }

  async function handleConfirmDelete() {
    setDeleting(true)
    try {
      checkOnline()
      await deleteMatch(matchToDelete.id)
      await loadMatches(user.uid)
      showToast('Partido eliminado.')
      setMatchToDelete(null)
    } catch (error) {
      console.error(error)
      showToast(getErrorMessage(error, 'No se pudo eliminar el partido. Intentá de nuevo.'), 'error')
    } finally {
      setDeleting(false)
    }
  }

  // Modificación rápida de un solo campo (favorito o estado).
  async function quickUpdate(match, changes, successMessage) {
    setBusyId(match.id)
    try {
      checkOnline()
      await updateMatch(match.id, changes)
      await loadMatches(user.uid)
      showToast(successMessage)
    } catch (error) {
      console.error(error)
      showToast(getErrorMessage(error, 'No se pudo actualizar el partido. Intentá de nuevo.'), 'error')
    } finally {
      setBusyId(null)
    }
  }

  // Acciones que reciben las pantallas y las tarjetas.
  const actions = {
    onAdd: (defaults = {}) => setForm({ match: null, defaults }),
    onEdit: (match) => setForm({ match, defaults: {} }),
    onDelete: (match) => setMatchToDelete(match),
    onToggleFavorite: (match) =>
      quickUpdate(
        match,
        { favorite: !match.favorite },
        match.favorite ? 'Quitado de favoritos.' : 'Agregado a favoritos.'
      ),
    // "Asistí" abre el formulario para cargar el resultado en el momento.
    // "No asistí" se guarda directo.
    onChangeStatus: (match, status) =>
      status === STATUS.ATTENDED
        ? setForm({ match, defaults: { status } })
        : quickUpdate(match, { status }, `Partido marcado como "${STATUS_LABELS[status]}".`),
  }

  if (!isFirebaseConfigured) {
    return (
      <div className="setup-screen">
        <Logo size={56} />
        <h1>Falta configurar Firebase</h1>
        <p>
          Creá un archivo <code>.env</code> en la raíz del proyecto (podés copiar <code>.env.example</code>), completá
          las variables <code>VITE_FIREBASE_*</code> y reiniciá el servidor con <code>npm run dev</code>.
        </p>
      </div>
    )
  }

  function renderPage() {
    const props = { matches, actions, busyId, onNavigate: setCurrentPage, profile }
    if (currentPage === 'perfil')
      return (
        <ProfilePage
          {...props}
          profileError={profileError}
          onSaveProfile={handleSaveProfile}
          onRetryProfile={() => loadProfile(user.uid)}
        />
      )
    if (currentPage === 'partidos') return <MatchesPage {...props} />
    if (currentPage === 'proximos') return <UpcomingPage {...props} />
    if (currentPage === 'estadisticas') return <StatsPage {...props} />
    return <HomePage {...props} />
  }

  return (
    <div className="app">
      <Header
        currentPage={currentPage}
        onNavigate={setCurrentPage}
        onAdd={() => actions.onAdd()}
        profileName={profile?.name}
      />

      <main className="main">
        {loading || !profileLoaded || loadError ? (
          <>
            <PageHeader kicker="Mi vida como hincha" title="River ID" image="/images/monumental-noche.webp" />
            <div className="sheet">
              {loading ? (
                <Loader text="Cargando tu historial de hincha..." />
              ) : (
                <div className="error-box" role="alert">
                  <h2>No pudimos cargar tu historial</h2>
                  <p>{loadError}</p>
                  {user && (
                    <button className="btn btn-primary" onClick={() => loadMatches(user.uid)}>
                      Reintentar
                    </button>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          // La "key" hace que la pantalla se vuelva a montar al navegar,
          // así se repite la animación de entrada (ver .page-enter en index.css).
          <div key={currentPage} className="page-enter">
            {renderPage()}
          </div>
        )}
      </main>

      <footer className="footer">
        <p>Realizado por Agustina Vega para la materia Desarrollo Frontend II en 2026.</p>
        <p>
          River ID es un proyecto universitario no oficial, hecho por y para hinchas. El escudo y las fotos pertenecen
          al Club Atlético River Plate y a sus autores.
        </p>
        <p className="footer-tech">Hecho con React, Firebase y Vercel</p>
      </footer>

      {form && (
        <MatchForm
          match={form.match}
          defaults={form.defaults}
          matches={matches}
          companions={profile?.companions || []}
          onSave={handleSave}
          onClose={() => setForm(null)}
          onOpenProfile={() => {
            setForm(null)
            setCurrentPage('perfil')
          }}
        />
      )}

      {/* Bienvenida: si todavía no tiene perfil y no la salteó */}
      {profileLoaded && !profileError && !profile && !welcomeSkipped && !loading && !loadError && (
        <WelcomeModal onSave={handleSaveProfile} onSkip={skipWelcome} />
      )}

      {matchToDelete && (
        <ConfirmDialog
          title="Eliminar partido"
          message={`¿Seguro que querés eliminar River vs ${matchToDelete.rival}? Esta acción no se puede deshacer.`}
          loading={deleting}
          onConfirm={handleConfirmDelete}
          onCancel={() => setMatchToDelete(null)}
        />
      )}

      {celebrating && <Confetti />}

      <Toast toast={toast} onClose={() => setToast(null)} />
    </div>
  )
}

export default App
