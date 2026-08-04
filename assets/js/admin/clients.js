import { db } from './admin-db.js';

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
    
    // Auto-Migración si está vacío
    if (snapshot.empty) {
      console.log('Firestore vacío. Intentando auto-migración...');
      await autoMigrate();
      return; // autoMigrate llamará loadClients de nuevo al terminar
    }

    clientsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    // Ordenar por el campo order, si no, alfabéticamente
    clientsData.sort((a, b) => {
        if (a.order !== undefined && b.order !== undefined) return a.order - b.order;
        return (a.name || '').localeCompare(b.name || '');
    });

    statClients.textContent = clientsData.length;
    renderTable();
    window.dispatchEvent(new CustomEvent('clients-loaded', { detail: clientsData }));
  } catch (err) {
    console.error('Error loading clients', err);
  }
}

async function autoMigrate() {
  try {
    const response = await fetch('/NEXO-AC/assets/data/default-content.json');
    if (!response.ok) throw new Error('No se pudo cargar default-content.json');
    const localData = await response.json();
    
    if (localData.clients && localData.clients.length > 0) {
      for (const client of localData.clients) {
        const slug = client.slug || client.id;
        
        // Mapear campos legacy al nuevo modelo
        const clientData = {
          slug: slug,
          name: client.name || '',
          category: client.category || '',
          industry: '', // Nuevo
          shortDescription: client.summary || '',
          longDescription: client.workDeveloped || '',
          services: client.services || [],
          instagramUrl: client.instagramProfileUrl || '',
          websiteUrl: '',
          logoUrl: '',
          coverImageUrl: client.coverImage || '',
          primaryColor: '',
          secondaryColor: '',
          accentColor: '',
          textColor: '',
          backgroundColor: '',
          status: client.status || 'published',
          featured: client.featured || false,
          order: client.order || 99,
          createdAt: firebase.firestore.FieldValue.serverTimestamp(),
          updatedAt: firebase.firestore.FieldValue.serverTimestamp()
        };

        // Guardar en firestore con ID = slug
        await db.collection('clients').doc(slug).set(clientData, { merge: true });
        console.log(`Cliente ${client.name} migrado con éxito.`);
      }
      console.log('Migración completada.');
      loadClients();
    }
  } catch (error) {
    console.error('Error en auto-migración:', error);
  }
}

function renderTable() {
  tbody.innerHTML = '';
  clientsData.forEach(client => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td><strong>${client.name || 'Sin nombre'}</strong><br><small style="color:var(--text-secondary)">${client.slug}</small></td>
      <td>${client.category || '-'}</td>
      <td>
        <span class="badge ${client.status === 'published' ? 'badge-success' : (client.status === 'archived' ? 'badge-danger' : 'badge-warning')}">
          ${client.status === 'published' ? 'Publicado' : (client.status === 'archived' ? 'Archivado' : 'Borrador')}
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
  document.getElementById('client-slug').value = client.slug || client.id;
  document.getElementById('client-slug').readOnly = true;
  document.getElementById('client-name').value = client.name || '';
  document.getElementById('client-category').value = client.category || '';
  document.getElementById('client-industry').value = client.industry || '';
  
  document.getElementById('client-services').value = (client.services || []).join(', ');
  
  document.getElementById('client-short-desc').value = client.shortDescription || '';
  document.getElementById('client-long-desc').value = client.longDescription || '';
  
  document.getElementById('client-instagram').value = client.instagramUrl || '';
  document.getElementById('client-website').value = client.websiteUrl || '';
  document.getElementById('client-logo').value = client.logoUrl || '';
  document.getElementById('client-cover').value = client.coverImageUrl || '';
  
  // Colors
  document.getElementById('client-primary-color').value = client.primaryColor || '';
  document.getElementById('client-secondary-color').value = client.secondaryColor || '';
  document.getElementById('client-accent-color').value = client.accentColor || '';
  document.getElementById('client-text-color').value = client.textColor || '';
  document.getElementById('client-bg-color').value = client.backgroundColor || '';
  
  document.getElementById('client-status').value = client.status || 'draft';
  document.getElementById('client-featured').checked = !!client.featured;
  document.getElementById('client-order').value = client.order !== undefined ? client.order : 99;
  
  modal.classList.add('active');
}

btnSave.addEventListener('click', async (e) => {
  e.preventDefault();
  
  const idInput = document.getElementById('client-id').value;
  const slugInput = document.getElementById('client-slug').value.trim();
  const docId = idInput || slugInput; // Siempre usaremos el slug como document ID si es nuevo
  
  if (!docId) return alert('El Slug es requerido');
  
  const data = {
    slug: slugInput,
    name: document.getElementById('client-name').value.trim(),
    category: document.getElementById('client-category').value.trim(),
    industry: document.getElementById('client-industry').value.trim(),
    services: document.getElementById('client-services').value.split(',').map(s => s.trim()).filter(Boolean),
    shortDescription: document.getElementById('client-short-desc').value.trim(),
    longDescription: document.getElementById('client-long-desc').value.trim(),
    instagramUrl: document.getElementById('client-instagram').value.trim(),
    websiteUrl: document.getElementById('client-website').value.trim(),
    logoUrl: document.getElementById('client-logo').value.trim(),
    coverImageUrl: document.getElementById('client-cover').value.trim(),
    
    primaryColor: document.getElementById('client-primary-color').value.trim(),
    secondaryColor: document.getElementById('client-secondary-color').value.trim(),
    accentColor: document.getElementById('client-accent-color').value.trim(),
    textColor: document.getElementById('client-text-color').value.trim(),
    backgroundColor: document.getElementById('client-bg-color').value.trim(),
    
    status: document.getElementById('client-status').value,
    featured: document.getElementById('client-featured').checked,
    order: parseInt(document.getElementById('client-order').value) || 99,
    
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
