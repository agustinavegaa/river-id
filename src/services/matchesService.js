// Operaciones CRUD sobre la colección "matches" de Cloud Firestore.
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  where,
} from 'firebase/firestore'
import { db } from '../firebase/config'

const COLLECTION = 'matches'

// CONSULTAR: trae solo los partidos del usuario (filtrando por su uid).
export async function getMatches(uid) {
  const q = query(collection(db, COLLECTION), where('uid', '==', uid))
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }))
}

// CREAR: agrega un partido nuevo asociado al uid del usuario.
export async function addMatch(uid, match) {
  const docRef = await addDoc(collection(db, COLLECTION), {
    ...match,
    uid,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return docRef.id
}

// MODIFICAR: actualiza solo los campos que se le pasan.
export async function updateMatch(id, changes) {
  await updateDoc(doc(db, COLLECTION, id), {
    ...changes,
    updatedAt: serverTimestamp(),
  })
}

// ELIMINAR: borra el documento del partido.
export async function deleteMatch(id) {
  await deleteDoc(doc(db, COLLECTION, id))
}
