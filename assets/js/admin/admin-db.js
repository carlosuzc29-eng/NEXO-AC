// Módulo centralizado de Firebase para el Admin Panel
// Todos los scripts del admin importan db, auth y storage desde aquí
import { firebaseConfig } from '../firebase-config.js';

if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

export const db = firebase.firestore();
export const auth = firebase.auth();
export const storage = firebase.storage();
