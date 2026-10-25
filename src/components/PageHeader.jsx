// Encabezado de cada pantalla: título, descripción y una acción opcional.
function PageHeader({ title, subtitle, action }) {
  return (
    <header className="page-header">
      <div>
        <h1>{title}</h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export default PageHeader
