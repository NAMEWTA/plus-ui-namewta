interface OssResumeRecord {
  fingerprint: string;
  uploadToken: string;
  expiresAt: string;
  fileName: string;
  fileSize: number;
  contentType: string;
}

const DATABASE = 'ruoyi-oss-upload';
const STORE = 'sessions';

function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DATABASE, 1);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(STORE)) {
        request.result.createObjectStore(STORE, { keyPath: 'fingerprint' });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

async function transact<T>(mode: IDBTransactionMode, operation: (store: IDBObjectStore) => IDBRequest<T>) {
  const database = await openDatabase();
  try {
    return await new Promise<T>((resolve, reject) => {
      const request = operation(database.transaction(STORE, mode).objectStore(STORE));
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

export function getOssResumeRecord(fingerprint: string) {
  return transact<OssResumeRecord | undefined>('readonly', store => store.get(fingerprint));
}

export function putOssResumeRecord(record: OssResumeRecord) {
  return transact<IDBValidKey>('readwrite', store => store.put(record));
}

export function removeOssResumeRecord(fingerprint: string) {
  return transact<undefined>('readwrite', store => store.delete(fingerprint));
}
