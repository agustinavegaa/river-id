import Modal from './Modal'

// Pide confirmación antes de una acción irreversible (eliminar).
function ConfirmDialog({ title, message, confirmText = 'Eliminar', loading, onConfirm, onCancel }) {
  return (
    <Modal title={title} onClose={loading ? () => {} : onCancel} size="sm">
      <p className="confirm-message">{message}</p>
      <div className="modal-actions">
        <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>
          Cancelar
        </button>
        <button className="btn btn-danger" onClick={onConfirm} disabled={loading}>
          {loading ? 'Eliminando...' : confirmText}
        </button>
      </div>
    </Modal>
  )
}

export default ConfirmDialog
