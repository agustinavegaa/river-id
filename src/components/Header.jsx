import { BarChart3, CalendarClock, Home, ListChecks, Plus } from 'lucide-react'
import Logo from './Logo'

export const PAGES = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'partidos', label: 'Mis partidos', icon: ListChecks },
  { id: 'proximos', label: 'Próximos', icon: CalendarClock },
  { id: 'estadisticas', label: 'Estadísticas', icon: BarChart3 },
]

// Barra superior: logo, menú en "píldora" y botón para agregar.
// En celulares el menú se convierte en una barra fija abajo (ver index.css).
function Header({ currentPage, onNavigate, onAdd }) {
  return (
    <header className="header">
      <button className="header-brand" onClick={() => onNavigate('inicio')} aria-label="Ir al inicio">
        <Logo size={38} />
        <span>RIVER ID</span>
      </button>

      <nav className="header-nav" aria-label="Secciones">
        {PAGES.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            className={currentPage === id ? 'nav-pill active' : 'nav-pill'}
            onClick={() => onNavigate(id)}
            aria-current={currentPage === id ? 'page' : undefined}
          >
            <Icon size={18} />
            <span>{label}</span>
          </button>
        ))}
      </nav>

      <div className="header-actions">
        <button className="btn-pill btn-pill-light" onClick={onAdd}>
          Agregar partido
        </button>
        <button className="btn-circle" onClick={onAdd} aria-label="Agregar partido">
          <Plus size={20} />
        </button>
      </div>
    </header>
  )
}

export default Header
