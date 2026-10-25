import { CheckCircle2, XCircle } from 'lucide-react'

// Mensaje flotante de éxito o error.
function Toast({ toast, onClose }) {
  if (!toast) return null
  const Icon = toast.type === 'error' ? XCircle : CheckCircle2

  return (
    <div className={`toast toast-${toast.type}`} role="alert">
      <Icon size={20} />
      <span>{toast.message}</span>
      <button className="toast-close" onClick={onClose} aria-label="Cerrar mensaje">
        ×
      </button>
    </div>
  )
}

export default Toast
