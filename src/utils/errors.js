// Traduce los errores de Firebase a mensajes claros para el usuario.
// "fallback" es el mensaje general si el error no es de un tipo conocido.
export function getErrorMessage(error, fallback) {
  const code = error?.code || ''

  if (code === 'unavailable' || code === 'deadline-exceeded' || code === 'auth/network-request-failed') {
    return 'No hay conexión con el servidor. Revisá tu internet e intentá de nuevo.'
  }
  if (code === 'permission-denied' || code === 'unauthenticated') {
    return 'No tenés permiso para hacer esto. Recargá la página para volver a iniciar sesión.'
  }
  if (code === 'auth/operation-not-allowed' || code === 'auth/admin-restricted-operation') {
    return 'El acceso anónimo no está habilitado en Firebase (Authentication → Anónimo).'
  }
  return fallback
}

// Error para cuando el navegador ya sabe que no hay internet.
// Así no dejamos al usuario esperando un guardado que no va a llegar.
export function offlineError() {
  const error = new Error('offline')
  error.code = 'unavailable'
  return error
}
