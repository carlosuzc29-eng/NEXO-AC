import { app, db } from '../../assets/js/firebase-init.js';
// Using compat scripts loaded in HTML
const auth = firebase.auth();

const authView = document.getElementById('auth-view');
const appLayout = document.getElementById('app-layout');
const loginForm = document.getElementById('login-form');
const loginError = document.getElementById('login-error');
const userEmailSpan = document.getElementById('user-email');
const btnLogout = document.getElementById('btn-logout');

let currentUser = null;

// Auth State Observer
auth.onAuthStateChanged(async (user) => {
  if (user) {
    // Check if user is in 'admins' collection
    try {
      const adminDoc = await db.collection('admins').doc(user.uid).get();
      if (adminDoc.exists || user.email === 'carlosuzc29@gmail.com') { // Fallback basic admin validation
        currentUser = user;
        showApp(user);
        
        // Dispatch custom event to notify other scripts that auth is ready
        window.dispatchEvent(new CustomEvent('admin-auth-ready', { detail: { user } }));
      } else {
        throw new Error('No tienes permisos de administrador.');
      }
    } catch (err) {
      console.error(err);
      auth.signOut();
      showError('Acceso denegado. No eres administrador.');
    }
  } else {
    currentUser = null;
    showLogin();
  }
});

// Login Logic
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = document.getElementById('login-email').value;
  const password = document.getElementById('login-password').value;
  
  try {
    loginError.style.display = 'none';
    const btn = loginForm.querySelector('button');
    btn.disabled = true;
    btn.textContent = 'Verificando...';
    
    await auth.signInWithEmailAndPassword(email, password);
    
  } catch (err) {
    showError('Credenciales incorrectas o error de conexión.');
  } finally {
    const btn = loginForm.querySelector('button');
    btn.disabled = false;
    btn.textContent = 'Ingresar';
  }
});

// Logout Logic
btnLogout.addEventListener('click', () => {
  auth.signOut();
});

function showApp(user) {
  authView.style.display = 'none';
  appLayout.style.display = 'flex';
  userEmailSpan.textContent = user.email;
}

function showLogin() {
  appLayout.style.display = 'none';
  authView.style.display = 'flex';
}

function showError(msg) {
  loginError.textContent = msg;
  loginError.style.display = 'block';
}

export { currentUser };
