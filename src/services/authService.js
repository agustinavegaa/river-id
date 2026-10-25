// Autenticación anónima: Firebase le asigna a cada navegador un usuario
// con un uid único, sin necesidad de registrarse.
import { onAuthStateChanged, signInAnonymously } from 'firebase/auth'
import { auth } from '../firebase/config'

// Escucha los cambios de sesión. Si no hay usuario, inicia sesión anónima.
// Devuelve una función para dejar de escuchar.
export function listenToUser(onUser, onError) {
  return onAuthStateChanged(auth, (user) => {
    if (user) {
      onUser(user)
    } else {
      signInAnonymously(auth).catch(onError)
    }
  })
}
