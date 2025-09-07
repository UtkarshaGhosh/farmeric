import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { initializeAppCheck, ReCaptchaV3Provider } from 'firebase/app-check';

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

// Initialize App Check (reCAPTCHA v3) if a site key is provided via env
try {
  const env = (import.meta as any).env || {};
  const siteKey = env.VITE_FIREBASE_RECAPTCHA_V3_SITE_KEY as string | undefined;
  const debugToken = env.VITE_FIREBASE_APPCHECK_DEBUG_TOKEN as string | undefined;

  if (debugToken) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (self as any).FIREBASE_APPCHECK_DEBUG_TOKEN = debugToken;
  }

  if (siteKey) {
    initializeAppCheck(app, {
      provider: new ReCaptchaV3Provider(siteKey),
      isTokenAutoRefreshEnabled: true,
    });
  }
} catch {
  // App Check is optional; fail silently if env is missing or not available
}

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
