import { app, db, auth } from './firebase-init.js';
import { collection, getDocs, doc, getDoc, query, where, orderBy } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

let localDataCache = null;

async function getLocalData() {
    if (localDataCache) return localDataCache;
    try {
        const response = await fetch('/NEXO-AC/assets/data/default-content.json');
        if (!response.ok) throw new Error('Failed to fetch local data');
        localDataCache = await response.json();
        return localDataCache;
    } catch (e) {
        console.error("Error loading local fallback data:", e);
        return null;
    }
}

export async function getSiteSettings() {
    if (db) {
        try {
            const settingsDoc = await getDoc(doc(db, 'siteSettings', 'public'));
            if (settingsDoc.exists()) {
                return settingsDoc.data();
            }
        } catch (e) {
            console.warn("Failed to get settings from Firestore, using local fallback", e);
        }
    }
    const local = await getLocalData();
    return local?.siteSettings?.public || {};
}

export async function getPublishedClients() {
    if (db) {
        try {
            const q = query(collection(db, 'clients'), where('status', '==', 'published'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            const clients = [];
            querySnapshot.forEach((doc) => {
                clients.push({ id: doc.id, ...doc.data() });
            });
            if (clients.length > 0) return clients;
        } catch (e) {
            console.warn("Failed to get clients from Firestore, using local fallback", e);
        }
    }
    const local = await getLocalData();
    return (local?.clients || []).filter(c => c.status === 'published').sort((a, b) => (a.order || 0) - (b.order || 0));
}

export async function getClientBySlug(slug) {
    if (db) {
        try {
            const q = query(collection(db, 'clients'), where('slug', '==', slug), where('status', '==', 'published'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                const docSnap = querySnapshot.docs[0];
                return { id: docSnap.id, ...docSnap.data() };
            }
        } catch (e) {
            console.warn("Failed to get client by slug from Firestore, using local fallback", e);
        }
    }
    const local = await getLocalData();
    const client = (local?.clients || []).find(c => c.slug === slug && c.status === 'published');
    return client || null;
}

export async function getClientPublications(clientId) {
    if (db) {
        try {
            const q = query(collection(db, `clients/${clientId}/publications`), where('status', '==', 'published'), orderBy('order', 'asc'));
            const querySnapshot = await getDocs(q);
            const publications = [];
            querySnapshot.forEach((doc) => {
                publications.push({ id: doc.id, ...doc.data() });
            });
            return publications;
        } catch (e) {
            console.warn("Failed to get publications from Firestore, using local fallback", e);
        }
    }
    // No local publications are required initially according to prompt ("Las colecciones de publicaciones deben comenzar vacías.")
    return [];
}

export function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
