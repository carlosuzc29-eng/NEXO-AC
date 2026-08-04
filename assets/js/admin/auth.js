const db = firebase.firestore();
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
    try {
      if (user.email === 'carlosuzc29@gmail.com') {
        // Fallback admin: no necesita leer la colección para evitar errores de permisos si las reglas aún no se han desplegado
        currentUser = user;
        showApp(user);
        window.dispatchEvent(new CustomEvent('admin-auth-ready', { detail: { user } }));
      } else {
        const adminDoc = await db.collection('admins').doc(user.uid).get();
        if (adminDoc.exists) {
          currentUser = user;
          showApp(user);
          window.dispatchEvent(new CustomEvent('admin-auth-ready', { detail: { user } }));
        } else {
          throw new Error('No tienes permisos de administrador.');
        }
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
    
    try {
      await auth.signInWithEmailAndPassword(email, password);
    } catch (err) {
      // Si el usuario no existe, intentar crearlo automáticamente (Setup Inicial)
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') {
        try {
          await auth.createUserWithEmailAndPassword(email, password);
          // Se disparará onAuthStateChanged automáticamente, y el correo hardcodeado dará acceso
        } catch (regErr) {
          throw regErr; // Pasar al catch principal si la creación falla (ej: Auth deshabilitado)
        }
      } else {
        throw err;
      }
    }
    
  } catch (err) {
    showError('Error de autenticación: ' + (err.message || 'Credenciales incorrectas.'));
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
