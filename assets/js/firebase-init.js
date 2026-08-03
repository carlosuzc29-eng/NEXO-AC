import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { getAuth, onAuthStateChanged, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

let app = null;
let db = null;
let auth = null;

try {
    // Intentar importar la configuración real
    const configModule = await import('./firebase-config.js');
    if (configModule && configModule.firebaseConfig) {
        app = initializeApp(configModule.firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        console.log("Firebase inicializado correctamente.");
    }
} catch (error) {
    console.warn("Firebase no configurado o falta firebase-config.js. Usando fallback local.");
}

export { app, db, auth, onAuthStateChanged, signInWithEmailAndPassword, signOut };
