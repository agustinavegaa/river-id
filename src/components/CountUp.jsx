import { useEffect, useRef, useState } from 'react'
import { prefersReducedMotion } from '../utils/motion'

const DURATION = 900 // milisegundos

// Muestra un número que "cuenta" desde el valor anterior hasta el nuevo.
// Empieza recién cuando el número aparece en pantalla (por ejemplo, al bajar hasta el banner).
// pad: cantidad mínima de dígitos (ej: 2 → "05"). suffix: texto al final (ej: "%").
function CountUp({ value, pad = 0, suffix = '' }) {
  const reduced = prefersReducedMotion()
  const [shown, setShown] = useState(reduced ? value : 0)
  const [visible, setVisible] = useState(false)
  const fromRef = useRef(shown)
  const elementRef = useRef(null)

  // 1. Detectamos cuándo el número entra en pantalla.
  useEffect(() => {
    if (reduced || !('IntersectionObserver' in window)) {
      setVisible(true)
      return
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setVisible(true)
        observer.disconnect()
      }
    })
    observer.observe(elementRef.current)
    return () => observer.disconnect()
  }, [reduced])

  // 2. Cuando está visible (o cambia el valor), contamos hasta el valor nuevo.
  useEffect(() => {
    if (!visible) return
    if (reduced) {
      setShown(value)
      return
    }
    const from = fromRef.current
    const start = performance.now()
    let frame

    function step(now) {
      const progress = Math.min((now - start) / DURATION, 1)
      // Arranca rápido y frena al final ("ease-out")
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = Math.round(from + (value - from) * eased)
      setShown(current)
      fromRef.current = current
      if (progress < 1) frame = requestAnimationFrame(step)
    }

    frame = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frame)
  }, [value, visible, reduced])

  return (
    <span ref={elementRef}>
      {String(shown).padStart(pad, '0')}
      {suffix}
    </span>
  )
}

export default CountUp
