import { db } from '../../assets/js/firebase-init.js';

const btnExport = document.getElementById('btn-export-backup');

btnExport.addEventListener('click', async () => {
  try {
    btnExport.textContent = 'Generando...';
    btnExport.disabled = true;

    const data = {
      clients: [],
      publications: []
    };

    const clientsSnap = await db.collection('clients').get();
    data.clients = clientsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    const pubsSnap = await db.collection('publications').get();
    data.publications = pubsSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    // Cleanup dates for JSON format (Firebase timestamps to ISO string)
    const sanitizeData = (items) => {
      return items.map(item => {
        const clean = { ...item };
        if (clean.createdAt && typeof clean.createdAt.toDate === 'function') {
          clean.createdAt = clean.createdAt.toDate().toISOString();
        }
        if (clean.updatedAt && typeof clean.updatedAt.toDate === 'function') {
          clean.updatedAt = clean.updatedAt.toDate().toISOString();
        }
        return clean;
      });
    };

    data.clients = sanitizeData(data.clients);
    data.publications = sanitizeData(data.publications);

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `nexo-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
  } catch (err) {
    console.error(err);
    alert('Error al generar respaldo: ' + err.message);
  } finally {
    btnExport.textContent = 'Generar Backup Local';
    btnExport.disabled = false;
  }
});
