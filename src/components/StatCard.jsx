// Tarjeta para mostrar un número destacado con su etiqueta.
function StatCard({ label, value, icon: Icon, variant = 'default', hint }) {
  return (
    <div className={`stat-card stat-${variant}`}>
      <div className="stat-top">
        <span className="stat-label">{label}</span>
        {Icon && <Icon size={18} />}
      </div>
      <strong className="stat-value">{value}</strong>
      {hint && <span className="stat-hint">{hint}</span>}
    </div>
  )
}

export default StatCard
