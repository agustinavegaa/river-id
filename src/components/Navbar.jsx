import { BarChart3, CalendarClock, Home, ListChecks } from 'lucide-react'
import Logo from './Logo'

export const PAGES = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'partidos', label: 'Mis partidos', icon: ListChecks },
  { id: 'proximos', label: 'Próximos', icon: CalendarClock },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
]

// Barra lateral en escritorio; barra inferior en celulares (ver index.css).
function Navbar({ currentPage, onNavigate }) {
  return (
    <nav className="navbar">
      <div className="navbar-brand">
        <Logo size={36} />
        <div>
          <strong>RIVER ID</strong>
          <span>Mi vida como hincha</span>
        </div>
      </div>

      <ul className="navbar-links">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <li key={id}>
            <button
              className={currentPage === id ? 'nav-link active' : 'nav-link'}
              onClick={() => onNavigate(id)}
              aria-current={currentPage === id ? 'page' : undefined}
            >
              <Icon size={20} />
              <span>{label}</span>
            </button>
          </li>
        ))}
      </ul>

      <p className="navbar-note">App no oficial, hecha por hinchas.</p>
    </nav>
  )
}

export default Navbar
