// Perfil del usuario en Firestore: su nombre y su grupo de cancha.
// Cada perfil es un documento de la colección "profiles" con el uid como id.
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore'
import { db } from '../firebase/config'

// CONSULTAR: devuelve el perfil o null si todavía no tiene uno.
export async function getProfile(uid) {
  const snapshot = await getDoc(doc(db, 'profiles', uid))
  if (!snapshot.exists()) return null
  const data = snapshot.data()
  return { name: data.name || '', companions: data.companions || [] }
}

// CREAR o MODIFICAR: guarda el nombre y la lista de compañeros.
export async function saveProfile(uid, profile) {
  await setDoc(doc(db, 'profiles', uid), {
    name: profile.name,
    companions: profile.companions,
    updatedAt: serverTimestamp(),
  })
}
