import { X } from 'lucide-react'

// Ventana modal reutilizable (la usan el formulario y la confirmación).
function Modal({ title, onClose, children, size = 'md' }) {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal modal-${size}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>
        {children}
      </div>
    </div>
  )
}

export default Modal
