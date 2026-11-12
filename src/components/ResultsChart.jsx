// Gráfico de anillo con victorias, empates y derrotas.
// Se dibuja solo con CSS (conic-gradient), sin librerías externas.
function ResultsChart({ wins, draws, losses }) {
  const total = wins + draws + losses
  const percent = (n) => Math.round((n / total) * 100)

  // Cada porción ocupa una parte de los 360 grados del círculo.
  const winsEnd = (wins / total) * 360
  const drawsEnd = winsEnd + (draws / total) * 360
  const background = `conic-gradient(
    var(--red) 0deg ${winsEnd}deg,
    var(--gray-mid) ${winsEnd}deg ${drawsEnd}deg,
    var(--black) ${drawsEnd}deg 360deg
  )`

  const items = [
    { label: 'Victorias', value: wins, className: 'dot-win' },
    { label: 'Empates', value: draws, className: 'dot-draw' },
    { label: 'Derrotas', value: losses, className: 'dot-loss' },
  ]

  return (
    <div className="results-chart">
      <div
        className="donut"
        style={{ background }}
        role="img"
        aria-label={`${wins} victorias, ${draws} empates y ${losses} derrotas`}
      >
        <div className="donut-center">
          <strong className="display">{total}</strong>
          <span>{total === 1 ? 'partido' : 'partidos'}</span>
        </div>
      </div>

      <ul className="chart-legend">
        {items.map((item) => (
          <li key={item.label}>
            <span className={`dot ${item.className}`} />
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{percent(item.value)}%</small>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default ResultsChart
