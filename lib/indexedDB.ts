import { DB_NAME, DB_VERSION, RECORDS_OBJECT_STORE_NAME, SETTINGS_OBJECT_STORE_NAME } from './constants';

export const openDB = (): Promise<IDBDatabase> => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (event) => {
        const db = request.result;
        if (!db.objectStoreNames.contains(RECORDS_OBJECT_STORE_NAME)) {
            db.createObjectStore(RECORDS_OBJECT_STORE_NAME);
        }
        if (!db.objectStoreNames.contains(SETTINGS_OBJECT_STORE_NAME)) {
            db.createObjectStore(SETTINGS_OBJECT_STORE_NAME);
        }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const idbGet = async (storeName: string, key: IDBValidKey): Promise<any> => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(storeName, 'readonly');
    const store = tx.objectStore(storeName);
    const request = store.get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

export const idbSet = async (storeName: string, key: IDBValidKey, value: any): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.put(value, key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const idbDelete = async (storeName: string, key: IDBValidKey): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.delete(key);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};

export const idbClear = async (storeName: string): Promise<void> => {
  const db = await openDB();
  return new Promise<void>((resolve, reject) => {
    const tx = db.transaction(storeName, 'readwrite');
    const store = tx.objectStore(storeName);
    const request = store.clear();
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
};