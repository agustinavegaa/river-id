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

// ---------- Versión 2 ----------

// Fecha de hoy en formato "AAAA-MM-DD" (hora local).
export function todayString() {
  const now = new Date()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  return `${now.getFullYear()}-${month}-${day}`
}

// Arma un Date con la fecha y la hora (opcional) del partido.
export function getMatchDateTime(match) {
  const [year, month, day] = match.date.split('-').map(Number)
  const [hours, minutes] = (match.time || '00:00').split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

// Un "Próximo" cuya fecha ya pasó: hay que indicar si el usuario fue o no.
export function isPastUpcoming(match) {
  return match.status === STATUS.UPCOMING && match.date < todayString()
}

// El próximo partido que todavía no se jugó (el más cercano en el tiempo).
export function getNextMatch(matches) {
  const upcoming = matches.filter((m) => m.status === STATUS.UPCOMING && m.date >= todayString())
  return sortByDate(upcoming, true)[0] || null
}

// Días, horas y minutos que faltan hasta una fecha. Nunca devuelve negativos.
export function getCountdown(target, now = new Date()) {
  const diff = Math.max(0, target - now)
  const totalMinutes = Math.floor(diff / 60000)
  return {
    days: Math.floor(totalMinutes / 1440),
    hours: Math.floor((totalMinutes % 1440) / 60),
    minutes: totalMinutes % 60,
  }
}

// Devuelve el valor que más se repite en un campo, con su cantidad.
function mostCommon(matches, field) {
  const counts = {}
  matches.forEach((m) => {
    const value = (m[field] || '').trim()
    if (value) counts[value] = (counts[value] || 0) + 1
  })
  const [name, count] = Object.entries(counts).sort((a, b) => b[1] - a[1])[0] || []
  return name ? { name, count } : null
}

// Datos curiosos: solo con los partidos a los que el usuario asistió.
export function calculateCuriosities(matches) {
  const attended = matches.filter((m) => m.status === STATUS.ATTENDED)
  return {
    topRival: mostCommon(attended, 'rival'),
    topStadium: mostCommon(attended, 'stadium'),
    topCompetition: mostCommon(attended, 'competition'),
  }
}
