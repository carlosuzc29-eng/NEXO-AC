import { app, db, auth } from './firebase-init.js';
import { collection, getDocs, doc, getDoc, query, where, orderBy, collectionGroup } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

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
            const docRef = doc(db, 'clients', slug);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists() && docSnap.data().status === 'published') {
                return { id: docSnap.id, ...docSnap.data() };
            }
        } catch (e) {
            console.warn("Failed to get client by slug from Firestore, using local fallback", e);
        }
    }
    const local = await getLocalData();
    const client = (local?.clients || []).find(c => (c.slug === slug || c.id === slug) && c.status === 'published');
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
    return [];
}

export async function getHomeHeroPublication() {
    // This function can be optimized in the future. 
    // Right now, since we only want ONE hero video, we fetch all clients and their hero placements.
    // Alternatively, we could maintain a "homeSettings" doc with the direct URL, but this keeps the single source of truth.
    if (db) {
        try {
            const q = query(collectionGroup(db, 'publications'), where('status', '==', 'published'), where('placements', 'array-contains', 'homeHero'));
            const querySnapshot = await getDocs(q);
            if (!querySnapshot.empty) {
                // Get the first one that is also featured or just the first one
                return { id: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
            }
        } catch (e) {
            console.warn("Failed to get hero from Firestore (Requires Collection Group Index). Fallback to local", e);
        }
    }
    return null;
}

export function sanitizeHTML(str) {
    if (!str) return '';
    const temp = document.createElement('div');
    temp.textContent = str;
    return temp.innerHTML;
}
