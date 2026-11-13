// ¿El usuario pidió en su sistema reducir las animaciones?
// En ese caso mostramos todo directo, sin movimiento.
export function prefersReducedMotion() {
  return typeof window !== 'undefined' && window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
}
