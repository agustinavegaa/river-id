import { useRef } from 'react'
import MatchTile from './MatchTile'

// Fotos para las tarjetas. Se reparten en orden, así dos tarjetas
// seguidas nunca tienen la misma foto.
const PHOTOS = [
  '/images/partidos/monumental-aereo.jpg',
  '/images/partidos/bandera.jpg',
  '/images/partidos/estadio-noche.jpg',
  '/images/partidos/globos.jpg',
  '/images/partidos/festejo-gol.jpg',
]

// Carrusel horizontal. En celular se desliza con el dedo;
// en computadora también se puede arrastrar con el mouse.
function Carousel({ matches, onOpen }) {
  const trackRef = useRef(null)
  const drag = useRef({ active: false, startX: 0, scrollLeft: 0, moved: false })

  function handlePointerDown(e) {
    if (e.pointerType !== 'mouse') return
    drag.current = { active: true, startX: e.clientX, scrollLeft: trackRef.current.scrollLeft, moved: false }
  }

  function handlePointerMove(e) {
    if (!drag.current.active) return
    const distance = e.clientX - drag.current.startX
    if (Math.abs(distance) > 5) drag.current.moved = true
    trackRef.current.scrollLeft = drag.current.scrollLeft - distance
  }

  function stopDrag() {
    drag.current.active = false
  }

  // Si el usuario arrastró, no abrimos la tarjeta al soltar.
  function handleOpen(match) {
    if (drag.current.moved) return
    onOpen(match)
  }

  return (
    <div
      className="carousel"
      ref={trackRef}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={stopDrag}
      onPointerLeave={stopDrag}
    >
      {matches.map((match, index) => (
        <MatchTile key={match.id} match={match} photo={PHOTOS[index % PHOTOS.length]} onOpen={handleOpen} />
      ))}
    </div>
  )
}

export default Carousel
