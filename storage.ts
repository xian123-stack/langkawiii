import { MediaItem, TravelReel } from '../types';

const DB_NAME = 'LangkawiTravelGlobeDB';
const DB_VERSION = 2;
const STORE_NAME = 'user_media';
const REEL_STORE_NAME = 'travel_reel';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains(REEL_STORE_NAME)) {
        db.createObjectStore(REEL_STORE_NAME, { keyPath: 'id' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveUserMediaItem(item: MediaItem): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.put(item);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveAllUserMedia(items: MediaItem[]): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    for (const item of items) {
      if (item.isUserUploaded) {
        store.put(item);
      }
    }
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getUserMediaItems(): Promise<MediaItem[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();
      request.onsuccess = () => {
        const rawItems = (request.result as MediaItem[]) || [];
        const items = rawItems.map((item) => {
          if (item.fileBlob) {
            try {
              item.url = URL.createObjectURL(item.fileBlob);
            } catch (err) {
              console.warn("Could not create object URL for stored blob:", err);
            }
          }
          return item;
        });
        resolve(items);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error reading IndexedDB user media:", e);
    return [];
  }
}

export async function deleteUserMediaItem(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function clearAllUserMedia(): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    const store = tx.objectStore(STORE_NAME);
    store.clear();
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function saveTravelReel(reel: TravelReel): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(REEL_STORE_NAME, 'readwrite');
    const store = tx.objectStore(REEL_STORE_NAME);
    store.put(reel);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getTravelReel(): Promise<TravelReel | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(REEL_STORE_NAME, 'readonly');
      const store = tx.objectStore(REEL_STORE_NAME);
      const request = store.get('main_travel_reel');
      request.onsuccess = () => {
        const reel = request.result as TravelReel | undefined;
        if (reel && reel.fileBlob) {
          try {
            reel.url = URL.createObjectURL(reel.fileBlob);
          } catch (e) {
            console.warn("Could not restore reel object URL:", e);
          }
        }
        resolve(reel || null);
      };
      request.onerror = () => reject(request.error);
    });
  } catch (e) {
    console.error("Error loading travel reel from IndexedDB:", e);
    return null;
  }
}

