import { db, storage } from './admin-db.js';

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
  // We wait for clients to load before loading publications
});

window.addEventListener('clients-loaded', async (e) => {
  const clients = e.detail;
  clientsMap = {};
  clientSelect.innerHTML = '<option value="">Seleccione un cliente...</option>';
  
  clients.forEach(c => {
    clientsMap[c.slug || c.id] = c.name;
    const opt = document.createElement('option');
    opt.value = c.slug || c.id;
    opt.textContent = c.name;
    clientSelect.appendChild(opt);
  });
  
  await loadPublications(clients);
});

btnNew.addEventListener('click', () => {
  form.reset();
  document.getElementById('pub-id').value = '';
  // Checkboxes deben resetearse manualmente a veces, pero form.reset() ayuda
  modal.classList.add('active');
});

// === Subida de Archivos a Firebase Storage ===
async function uploadFile(file, path, progressEl, urlInputId) {
  if (!file) return;
  progressEl.style.display = 'block';
  progressEl.textContent = 'Subiendo... 0%';
  
  const storageRef = storage.ref(`uploads/${path}/${Date.now()}_${file.name}`);
  const task = storageRef.put(file);
  
  task.on('state_changed', 
    (snapshot) => {
      const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
      progressEl.textContent = `Subiendo... ${Math.round(progress)}%`;
    },
    (error) => {
      console.error(error);
      progressEl.textContent = 'Error al subir';
      progressEl.style.color = 'var(--danger)';
    },
    async () => {
      const downloadURL = await task.snapshot.ref.getDownloadURL();
      document.getElementById(urlInputId).value = downloadURL;
      progressEl.textContent = '¡Completado!';
      setTimeout(() => progressEl.style.display = 'none', 3000);
    }
  );
}

document.getElementById('pub-video-file')?.addEventListener('change', (e) => {
  uploadFile(e.target.files[0], 'videos', document.getElementById('pub-video-progress'), 'pub-video-url');
});
document.getElementById('pub-image-file')?.addEventListener('change', (e) => {
  uploadFile(e.target.files[0], 'images', document.getElementById('pub-image-progress'), 'pub-image-url');
});
document.getElementById('pub-poster-file')?.addEventListener('change', (e) => {
  uploadFile(e.target.files[0], 'images', document.getElementById('pub-poster-progress'), 'pub-poster-url');
});
// =============================================

async function loadPublications(clients) {
  try {
    pubsData = [];
    
    // Fetch publications for each client directly to avoid Collection Group index requirement
    for (const client of clients) {
      const clientId = client.slug || client.id;
      const snapshot = await db.collection(`clients/${clientId}/publications`).get();
      snapshot.forEach(doc => {
        pubsData.push({ id: doc.id, clientId, ...doc.data() });
      });
    }
    
    // Sort descending by creation date if exists, or just fallback
    pubsData.sort((a, b) => {
      const orderA = a.order || 99;
      const orderB = b.order || 99;
      return orderA - orderB;
    });

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
      <td>
        <span class="badge" style="background: rgba(255,255,255,0.1)">
          ${pub.sourceType || 'Desconocido'} - ${pub.mediaType || 'N/A'}
        </span>
      </td>
      <td>
        <span class="badge ${pub.status === 'published' ? 'badge-success' : (pub.status === 'archived' ? 'badge-danger' : 'badge-warning')}">
          ${pub.status === 'published' ? 'Publicado' : (pub.status === 'archived' ? 'Archivado' : 'Borrador')}
        </span>
      </td>
      <td>
        <button class="btn btn-sm btn-secondary btn-preview" data-id="${pub.id}" data-client="${pub.clientId}">Vista Previa</button>
        <button class="btn btn-sm btn-secondary btn-edit" data-id="${pub.id}" data-client="${pub.clientId}">Editar</button>
        <button class="btn btn-sm btn-danger btn-delete" data-id="${pub.id}" data-client="${pub.clientId}">Eliminar</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
  
  tbody.querySelectorAll('.btn-edit').forEach(btn => {
    btn.addEventListener('click', (e) => editPublication(e.target.dataset.id, e.target.dataset.client));
  });
  tbody.querySelectorAll('.btn-delete').forEach(btn => {
    btn.addEventListener('click', (e) => deletePublication(e.target.dataset.id, e.target.dataset.client));
  });
  tbody.querySelectorAll('.btn-preview').forEach(btn => {
    btn.addEventListener('click', (e) => previewPublication(e.target.dataset.id, e.target.dataset.client));
  });
}

async function previewPublication(pubId, clientId) {
  const pub = pubsData.find(p => p.id === pubId && p.clientId === clientId);
  if (!pub) return;
  
  // Extraer el color del cliente o uno genérico
  const clientRef = await db.doc(`clients/${clientId}`).get();
  const clientData = clientRef.exists ? clientRef.data() : { primaryColor: 'var(--accent-green)' };
  
  try {
    const { renderMediaFrame, bindVideoControls } = await import('../media-frame.js');
    const container = document.getElementById('preview-container');
    container.innerHTML = renderMediaFrame(pub, clientData);
    bindVideoControls();
    document.getElementById('modal-preview').classList.add('active');
  } catch (err) {
    console.error("Error cargando media-frame para preview", err);
    alert("Error al cargar la vista previa.");
  }
}

function editPublication(id, clientId) {
  const pub = pubsData.find(p => p.id === id && p.clientId === clientId);
  if (!pub) return;
  
  document.getElementById('pub-id').value = pub.id;
  document.getElementById('pub-client').value = pub.clientId || '';
  
  document.getElementById('pub-title').value = pub.title || '';
  document.getElementById('pub-description').value = pub.description || '';
  
  document.getElementById('pub-source-type').value = pub.sourceType || '';
  document.getElementById('pub-media-type').value = pub.mediaType || '';
  
  document.getElementById('pub-video-url').value = pub.videoUrl || '';
  document.getElementById('pub-image-url').value = pub.imageUrl || '';
  document.getElementById('pub-instagram-url').value = pub.instagramUrl || '';
  document.getElementById('pub-poster-url').value = pub.posterUrl || '';
  document.getElementById('pub-thumbnail-url').value = pub.thumbnailUrl || '';
  
  document.getElementById('pub-alt-text').value = pub.altText || '';
  document.getElementById('pub-aspect-ratio').value = pub.aspectRatio || 'auto';
  document.getElementById('pub-object-fit').value = pub.objectFit || 'cover';
  document.getElementById('pub-focal-position').value = pub.focalPosition || 'center';
  
  document.getElementById('pub-order').value = pub.order !== undefined ? pub.order : 99;
  document.getElementById('pub-featured').checked = !!pub.featured;
  document.getElementById('pub-status').value = pub.status || 'draft';
  document.getElementById('pub-autoplay').checked = !!pub.autoplayAllowed;
  
  // Placements
  const placements = pub.placements || [];
  document.querySelectorAll('input[name="pub-placements"]').forEach(cb => {
    cb.checked = placements.includes(cb.value);
  });
  
  modal.classList.add('active');
}

btnSave.addEventListener('click', async (e) => {
  e.preventDefault();
  
  const idInput = document.getElementById('pub-id').value;
  const clientId = document.getElementById('pub-client').value;
  
  if (!clientId) return alert('Debes seleccionar un cliente');
  
  const placements = Array.from(document.querySelectorAll('input[name="pub-placements"]:checked')).map(cb => cb.value);
  
  const data = {
    title: document.getElementById('pub-title').value.trim(),
    description: document.getElementById('pub-description').value.trim(),
    
    sourceType: document.getElementById('pub-source-type').value,
    mediaType: document.getElementById('pub-media-type').value,
    
    videoUrl: document.getElementById('pub-video-url').value.trim(),
    imageUrl: document.getElementById('pub-image-url').value.trim(),
    instagramUrl: document.getElementById('pub-instagram-url').value.trim(),
    posterUrl: document.getElementById('pub-poster-url').value.trim(),
    thumbnailUrl: document.getElementById('pub-thumbnail-url').value.trim(),
    
    altText: document.getElementById('pub-alt-text').value.trim(),
    aspectRatio: document.getElementById('pub-aspect-ratio').value,
    objectFit: document.getElementById('pub-object-fit').value,
    focalPosition: document.getElementById('pub-focal-position').value.trim(),
    
    order: parseInt(document.getElementById('pub-order').value) || 99,
    featured: document.getElementById('pub-featured').checked,
    status: document.getElementById('pub-status').value,
    autoplayAllowed: document.getElementById('pub-autoplay').checked,
    
    placements: placements,
    
    updatedAt: firebase.firestore.FieldValue.serverTimestamp()
  };
  
  try {
    btnSave.textContent = 'Guardando...';
    btnSave.disabled = true;
    
    const clientRef = db.collection('clients').doc(clientId);
    const pubRef = idInput ? clientRef.collection('publications').doc(idInput) : clientRef.collection('publications').doc();
    
    if (!idInput) {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
    }
    
    await pubRef.set(data, { merge: true });
    
    modal.classList.remove('active');
    
    // Recargar todo (podríamos optimizar y recargar solo este cliente, pero para simplificar...)
    window.dispatchEvent(new Event('admin-auth-ready')); // trigger reload sequence
  } catch (err) {
    console.error(err);
    alert('Error al guardar: ' + err.message);
  } finally {
    btnSave.textContent = 'Guardar';
    btnSave.disabled = false;
  }
});

async function deletePublication(id, clientId) {
  if (confirm(`¿Estás seguro de eliminar esta publicación?`)) {
    try {
      await db.collection(`clients/${clientId}/publications`).doc(id).delete();
      window.dispatchEvent(new Event('admin-auth-ready'));
    } catch (err) {
      console.error(err);
      alert('Error al eliminar: ' + err.message);
    }
  }
}
