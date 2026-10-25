// Indicador de carga.
function Loader({ text = 'Cargando...' }) {
  return (
    <div className="loader" role="status">
      <span className="spinner" />
      <p>{text}</p>
    </div>
  )
}

export default Loader
