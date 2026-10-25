// Mensaje que se muestra cuando todavía no hay datos para listar.
function EmptyState({ icon: Icon, title, message, action }) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon">
          <Icon size={28} />
        </div>
      )}
      <h3>{title}</h3>
      <p>{message}</p>
      {action}
    </div>
  )
}

export default EmptyState
