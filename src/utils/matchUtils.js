// Funciones auxiliares para trabajar con los partidos.

export const STATUS = {
  UPCOMING: 'proximo',
  ATTENDED: 'asisti',
  NOT_ATTENDED: 'no_asisti',
}

export const OUTCOME_LABELS = { victoria: 'Victoria', empate: 'Empate', derrota: 'Derrota' }

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

// Clave para ordenar por fecha y hora. Sin hora, el partido va al final de su día.
function dateTimeKey(match) {
  return `${match.date} ${match.time || '24:00'}`
}

// Ordena por fecha y hora: los más recientes primero (o al revés con ascending).
export function sortByDate(matches, ascending = false) {
  return [...matches].sort((a, b) =>
    ascending ? dateTimeKey(a).localeCompare(dateTimeKey(b)) : dateTimeKey(b).localeCompare(dateTimeKey(a))
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
    // Partidos a los que fue pero sin resultado cargado: no cuentan para V/E/D.
    attendedWithoutResult: attended.length - withResult.length,
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

// Arma un Date con la fecha y la hora del partido.
// Solo se usa cuando el partido tiene hora: nunca inventamos una.
export function getMatchDateTime(match) {
  const [year, month, day] = match.date.split('-').map(Number)
  const [hours, minutes] = match.time.split(':').map(Number)
  return new Date(year, month - 1, day, hours, minutes)
}

// Días de calendario que faltan hasta la fecha del partido (0 = hoy).
export function daysUntil(dateString) {
  const [year, month, day] = dateString.split('-').map(Number)
  const today = new Date()
  const start = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.round((new Date(year, month - 1, day) - start) / 86400000)
}

// ¿El partido ya se jugó? Si es hoy y tiene hora, comparamos con la hora actual.
// Si es hoy y no tiene hora, todavía no lo damos por jugado.
export function hasBeenPlayed(match) {
  const today = todayString()
  if (match.date < today) return true
  if (match.date > today) return false
  return Boolean(match.time) && getMatchDateTime(match) < new Date()
}

// ¿Ya se puede marcar si fue? Desde el día del partido en adelante.
export function canMarkAttendance(match) {
  return match.date <= todayString()
}

// Un "Próximo" que ya se jugó: hay que indicar si el usuario fue o no.
export function isPastUpcoming(match) {
  return match.status === STATUS.UPCOMING && hasBeenPlayed(match)
}

// El próximo partido que todavía no se jugó (el más cercano en el tiempo).
export function getNextMatch(matches) {
  const upcoming = matches.filter((m) => m.status === STATUS.UPCOMING && !hasBeenPlayed(m))
  return sortByDate(upcoming, true)[0] || null
}

// Texto de la hora para mostrar: si no hay, no inventamos una.
export function formatTime(match) {
  return match.time ? `${match.time} h` : 'Hora a confirmar'
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

// Devuelve el o los valores que más se repiten en un campo, con su cantidad.
// Si hay empate, devuelve todos los empatados (no elegimos uno al azar).
function mostCommon(matches, field) {
  const counts = {}
  matches.forEach((m) => {
    const value = (m[field] || '').trim()
    if (value) counts[value] = (counts[value] || 0) + 1
  })
  const max = Math.max(0, ...Object.values(counts))
  if (max === 0) return null
  const names = Object.keys(counts).filter((name) => counts[name] === max)
  return { names, count: max }
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
