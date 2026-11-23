// Datos de fútbol con la API pública de TheSportsDB (https://www.thesportsdb.com).
// "123" es la clave de prueba gratuita y pública que da TheSportsDB (no es secreta).
// Límites del plan gratis: 30 consultas por minuto y, en "últimos partidos",
// solo 1 resultado y solo de local.
import { normalizeName } from '../utils/matchUtils'

const API_URL = 'https://www.thesportsdb.com/api/v1/json/123'
const RIVER_ID = '135171' // id de River Plate en TheSportsDB

// Guardamos la respuesta en memoria para no repetir la consulta cada vez que se vuelve al Inicio.
let cached = null

// Pasamos el nombre de la competición de la API a las opciones de nuestro formulario.
// Si no la reconocemos, la dejamos vacía en lugar de inventar.
function toCompetition(league = '') {
  const name = normalizeName(league)
  if (name.includes('primera division')) return 'Liga Profesional'
  if (name.includes('copa de la liga')) return 'Copa de la Liga'
  if (name.includes('copa argentina')) return 'Copa Argentina'
  if (name.includes('libertadores')) return 'Copa Libertadores'
  if (name.includes('sudamericana')) return 'Copa Sudamericana'
  return ''
}

const toNumber = (value) => (value === null || value === '' || value === undefined ? null : Number(value))

// Devuelve el último partido de River que tiene la API, o null si no hay datos.
export async function getLastRiverMatch() {
  if (cached) return cached

  const response = await fetch(`${API_URL}/eventslast.php?id=${RIVER_ID}`)
  if (response.status === 429) throw new Error('football-limit')
  if (!response.ok) throw new Error('football-request')
  const data = await response.json()

  const event = data.results?.[0]
  if (!event) return null

  const riverIsHome = event.idHomeTeam === RIVER_ID
  const finished = event.strStatus === 'FT'
  const homeGoals = toNumber(event.intHomeScore)
  const awayGoals = toNumber(event.intAwayScore)

  cached = {
    rival: riverIsHome ? event.strAwayTeam : event.strHomeTeam,
    // Fecha y hora de Argentina (la API también trae la hora en UTC).
    date: event.dateEventLocal || event.dateEvent,
    time: (event.strTimeLocal || '').slice(0, 5),
    stadium: event.strVenue || '',
    league: event.strLeague || '',
    competition: toCompetition(event.strLeague),
    riverGoals: finished ? (riverIsHome ? homeGoals : awayGoals) : null,
    rivalGoals: finished ? (riverIsHome ? awayGoals : homeGoals) : null,
  }
  return cached
}
