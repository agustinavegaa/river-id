// Banda oscura con el título de cada pantalla (debajo del Header).
// "children" permite agregar contenido extra, como la cuenta regresiva.
function PageHeader({ kicker, title, subtitle, action, children }) {
  return (
    <section className="band band-page">
      <div className="band-media img-ph" aria-hidden="true" />
      <div className="band-content">
        {kicker && <p className="kicker">{kicker}</p>}
        <h1 className="display page-title">{title}</h1>
        {subtitle && <p className="band-subtitle">{subtitle}</p>}
        {action && <div className="band-action">{action}</div>}
      </div>
      {children}
    </section>
  )
}

export default PageHeader
