// Funciones auxiliares para trabajar con los partidos.

export const STATUS = {
  UPCOMING: 'proximo',
  ATTENDED: 'asisti',
  NOT_ATTENDED: 'no_asisti',
}

export const STATUS_LABELS = {
  proximo: 'Próximo',
  asisti: 'Asistí',
  no_asisti: 'No asistí',
}

export const COMPETITIONS = [
  'Liga Profesional',
  'Copa de la Liga',
  'Copa Libertadores',
  'Copa Sudamericana',
  'Copa Argentina',
  'Superclásico',
  'Amistoso',
  'Otra',
]

// Un resultado está completo solo si ambos goles son números.
// Así un resultado vacío (null) no se confunde con un 0-0.
export function hasResult(match) {
  return typeof match.riverGoals === 'number' && typeof match.rivalGoals === 'number'
}

// Devuelve 'victoria', 'empate', 'derrota' o null si no hay resultado.
export function getOutcome(match) {
  if (!hasResult(match)) return null
  if (match.riverGoals > match.rivalGoals) return 'victoria'
  if (match.riverGoals < match.rivalGoals) return 'derrota'
  return 'empate'
}

// La fecha se guarda como texto "AAAA-MM-DD". La armamos a mano
// para evitar que la zona horaria la corra un día.
export function formatDate(dateString) {
  if (!dateString) return ''
  const [year, month, day] = dateString.split('-').map(Number)
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-AR', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

// Ordena por fecha: los más recientes primero (o al revés con ascending).
export function sortByDate(matches, ascending = false) {
  return [...matches].sort((a, b) =>
    ascending ? a.date.localeCompare(b.date) : b.date.localeCompare(a.date)
  )
}

// Calcula las estadísticas a partir de los partidos guardados.
export function calculateStats(matches) {
  const attended = matches.filter((m) => m.status === STATUS.ATTENDED)
  // Para V/E/D solo cuentan los partidos a los que asistió con resultado completo.
  const withResult = attended.filter(hasResult)

  const wins = withResult.filter((m) => getOutcome(m) === 'victoria').length
  const draws = withResult.filter((m) => getOutcome(m) === 'empate').length
  const losses = withResult.filter((m) => getOutcome(m) === 'derrota').length

  return {
    total: matches.length,
    attended: attended.length,
    withResult: withResult.length,
    upcoming: matches.filter((m) => m.status === STATUS.UPCOMING).length,
    wins,
    draws,
    losses,
    winRate: withResult.length > 0 ? Math.round((wins / withResult.length) * 100) : 0,
    favorites: matches.filter((m) => m.favorite).length,
  }
}
