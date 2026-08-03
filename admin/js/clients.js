import { db } from '../../assets/js/firebase-init.js';

const tbody = document.getElementById('clients-tbody');
const modal = document.getElementById('modal-client');
const form = document.getElementById('form-client');
const btnNew = document.getElementById('btn-new-client');
const btnSave = document.getElementById('btn-save-client');
const statClients = document.getElementById('stat-clients');

let clientsData = [];

window.addEventListener('admin-auth-ready', () => {
  loadClients();
});

btnNew.addEventListener('click', () => {
  form.reset();
  document.getElementById('client-id').value = '';
  document.getElementById('client-slug').readOnly = false;
  modal.classList.add('active');
});

async function loadClients() {
  try {
    const snapshot = await db.collection('clients').get();
    clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    statClients.textContent = clientsData.length;
    renderTable();
    updatePubClientSelect(); // In publications.js (will be globally accessible or dispatched)
    window.dispatchEvent(new CustomEvent('clients-loaded', { detail: clientsData }));
  } catch (err) {
    console.error('Error loading clients', err);
  }
}

function renderTable() {
  tbody.innerHTML = '';
  clientsData.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${client.name || 'Sin nombre'}</strong><br><small style="color:var(--text-secondary)">${client.id}</small></td>
      <td>${client.category || '-'}</td>
      <td>
        <span class="badge ${client.status === 'published' ? 'badge-success' : 'badge-warning'}">
          ${client.status === 'published' ? 'Publicado' : 'Borrador'}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary btn-edit" data-id="${client.id}">Editar</button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${client.id}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  // Attach events
  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => editClient(e.target.dataset.id));
  });
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deleteClient(e.target.dataset.id));
  });
}

function editClient(id) {
  const client = clientsData.find(c => c.id === id);
  if (!client) return;
  
  document.getElementById('client-id').value = client.id;
  document.getElementById('client-slug').value = client.id;
  document.getElementById('client-slug').readOnly = true;
  document.getElementById('client-name').value = client.name || '';
  document.getElementById('client-category').value = client.category || '';
  document.getElementById('client-services').value = (client.services || []).join(', ');
  document.getElementById('client-year').value = client.year || '';
  document.getElementById('client-summary').value = client.summary || '';
  document.getElementById('client-work').value = client.workDeveloped || '';
  document.getElementById('client-instagram').value = client.instagramProfileUrl || '';
  document.getElementById('client-cover').value = client.coverImage || '';
  document.getElementById('client-published').checked = client.status === 'published';
  
  modal.classList.add('active');
}

btnSave.addEventListener('click', async (e) => {
  e.preventDefault();
  
  const idInput = document.getElementById('client-id').value;
  const slugInput = document.getElementById('client-slug').value.trim();
  const docId = idInput || slugInput;
  
  if (!docId) return alert('El ID / Slug es requerido');
  
  const data = {
    name: document.getElementById('client-name').value.trim(),
    category: document.getElementById('client-category').value.trim(),
    services: document.getElementById('client-services').value.split(',').map(s => s.trim()).filter(Boolean),
    year: document.getElementById('client-year').value.trim(),
    summary: document.getElementById('client-summary').value.trim(),
    workDeveloped: document.getElementById('client-work').value.trim(),
    instagramProfileUrl: document.getElementById('client-instagram').value.trim(),
    coverImage: document.getElementById('client-cover').value.trim(),
    status: document.getElementById('client-published').checked ? 'published' : 'draft',
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  if (!idInput) {
    data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
  }
  
  try {
    btnSave.textContent = 'Guardando...';
    btnSave.disabled = true;
    await db.collection('clients').doc(docId).set(data, { merge: true });
    modal.classList.remove('active');
    loadClients();
  } catch (err) {
    console.error(err);
    alert('Error al guardar: ' + err.message);
  } finally {
    btnSave.textContent = 'Guardar';
    btnSave.disabled = false;
  }
});

async function deleteClient(id) {
  if (confirm(`¿Estás seguro de eliminar el cliente ${id}? Esto no se puede deshacer.`)) {
    try {
      await db.collection('clients').doc(id).delete();
      loadClients();
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  }
}
