import { db } from '../firebase-init.js';

const tbody = document.getElementById('publications-tbody');
const modal = document.getElementById('modal-publication');
const form = document.getElementById('form-publication');
const btnNew = document.getElementById('btn-new-publication');
const btnSave = document.getElementById('btn-save-publication');
const statPubs = document.getElementById('stat-publications');
const clientSelect = document.getElementById('pub-client');

let pubsData = [];
let clientsMap = {};

window.addEventListener('admin-auth-ready', () => {
  loadPublications();
});

window.addEventListener('clients-loaded', (e) => {
  const clients = e.detail;
  clientsMap = {};
  clientSelect.innerHTML = '<option value="">Seleccione un cliente...</option>';
  
  clients.forEach(c => {
    clientsMap[c.id] = c.name;
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });
});

btnNew.addEventListener('click', () => {
  form.reset();
  document.getElementById('pub-id').value = '';
  modal.classList.add('active');
});

async function loadPublications() {
  try {
    const snapshot = await db.collection('publications').orderBy('createdAt', 'desc').get();
    pubsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    statPubs.textContent = pubsData.length;
    renderTable();
  } catch (err) {
    console.error('Error loading publications', err);
  }
}

function renderTable() {
  tbody.innerHTML = '';
  pubsData.forEach(pub => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${pub.title || '-'}</strong></td>
      <td>${clientsMap[pub.clientId] || pub.clientId || '-'}</td>
      <td><span class="badge" style="background: rgba(255,255,255,0.1)">${pub.type || 'Desconocido'}</span></td>
      <td>
        <button class="btn btn-sm btn-secondary btn-edit" data-id="${pub.id}">Editar</button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${pub.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => editPublication(e.target.dataset.id));
  });
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deletePublication(e.target.dataset.id));
  });
}

function editPublication(id) {
  const pub = pubsData.find(p => p.id === id);
  if (!pub) return;
  
  document.getElementById('pub-id').value = pub.id;
  document.getElementById('pub-client').value = pub.clientId || '';
  document.getElementById('pub-title').value = pub.title || '';
  document.getElementById('pub-type').value = pub.type || '';
  document.getElementById('pub-url').value = pub.instagramUrl || '';
  document.getElementById('pub-thumbnail').value = pub.thumbnailUrl || '';
  
  modal.classList.add('active');
}

btnSave.addEventListener('click', async (e) => {
  e.preventDefault();
  
  const idInput = document.getElementById('pub-id').value;
  const clientId = document.getElementById('pub-client').value;
  
  if (!clientId) return alert('Debes seleccionar un cliente');
  
  const data = {
    clientId,
    title: document.getElementById('pub-title').value.trim(),
    type: document.getElementById('pub-type').value.trim(),
    instagramUrl: document.getElementById('pub-url').value.trim(),
    thumbnailUrl: document.getElementById('pub-thumbnail').value.trim(),
    status: 'published',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    btnSave.textContent = 'Guardando...';
    btnSave.disabled = true;
    
    if (idInput) {
      await db.collection('publications').doc(idInput).set(data, { merge: true });
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('publications').add(data);
    }
    
    modal.classList.remove('active');
    loadPublications();
  } catch (err) {
    console.error(err);
    alert('Error al guardar: ' + err.message);
  } finally {
    btnSave.textContent = 'Guardar';
    btnSave.disabled = false;
  }
});

async function deletePublication(id) {
  if (confirm(`¿Estás seguro de eliminar esta publicación?`)) {
    try {
      await db.collection('publications').doc(id).delete();
      loadPublications();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  }
}
