import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  memoryLocalCache,
} from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import firebaseConfig from '@/firebase-applet-config.json';

// Inicialização da instância do Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializa Firestore com detecção automática de transporte e cache adequado para o ambiente
let dbInstance;
try {
  const isBrowser = typeof window !== 'undefined';
  dbInstance = initializeFirestore(
    app,
    {
      localCache: isBrowser
        ? persistentLocalCache({
            tabManager: persistentMultipleTabManager(),
          })
        : memoryLocalCache(),
      experimentalForceLongPolling: true,
    },
    firebaseConfig.firestoreDatabaseId || undefined
  );
} catch {
  dbInstance = firebaseConfig.firestoreDatabaseId
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
}

export const db = dbInstance;
export const auth = getAuth(app);
export default app;
