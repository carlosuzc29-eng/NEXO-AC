import { firebaseConfig } from '../firebase-config.js';
if (!firebase.apps.length) {
    firebase.initializeApp(firebaseConfig);
}
