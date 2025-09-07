import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase web config provided by user
const firebaseConfig = {
  apiKey: "AIzaSyDyiVPRnlVwSeZdu6PYyfcF7CKtQkMTBX4",
  authDomain: "farmguard-8d62f.firebaseapp.com",
  projectId: "farmguard-8d62f",
  storageBucket: "farmguard-8d62f.firebasestorage.app",
  messagingSenderId: "192671960199",
  appId: "1:192671960199:web:b0ad864b0bb7b94b74fc22",
  measurementId: "G-RZ6ML87HGG"
};

const app = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
