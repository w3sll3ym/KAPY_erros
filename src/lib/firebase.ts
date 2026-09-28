import { initializeApp, getApps, getApp } from 'firebase/app';
import { initializeFirestore, getFirestore } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

// Inicialização da instância do Firebase
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

// Inicializa Firestore com suporte a HTTP Long Polling
// Evita falhas de conexão de WebSockets comuns em iframes e ambientes de proxy
let dbInstance;
try {
  dbInstance = initializeFirestore(
    app,
    {
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
export default app;

