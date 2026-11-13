import { useState } from 'react'

const PIECES = 90

// Lluvia de papelitos rojos y blancos para festejar una victoria.
// Cada papelito tiene posición, tamaño, giro y demora al azar;
// la caída la hace la animación "confetti-fall" de index.css.
function Confetti() {
  // Se calculan una sola vez, al aparecer el confeti.
  const [pieces] = useState(() =>
    Array.from({ length: PIECES }, (_, i) => ({
      id: i,
      left: Math.random() * 100,
      delay: Math.random() * 0.6,
      duration: 1.8 + Math.random() * 1.2,
      size: 6 + Math.random() * 8,
      spin: Math.random() * 720 - 360,
      drift: Math.random() * 160 - 80,
      red: i % 2 === 0,
    }))
  )

  return (
    <div className="confetti" aria-hidden="true">
      {pieces.map((p) => (
        <span
          key={p.id}
          className={p.red ? 'confetti-piece red' : 'confetti-piece white'}
          style={{
            left: `${p.left}%`,
            width: `${p.size}px`,
            height: `${p.size * 1.6}px`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
            '--spin': `${p.spin}deg`,
            '--drift': `${p.drift}px`,
          }}
        />
      ))}
    </div>
  )
}

export default Confetti
