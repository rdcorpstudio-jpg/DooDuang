import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
  getAuth,
  initializeAuth,
  indexedDBLocalPersistence,
  browserLocalPersistence,
  browserPopupRedirectResolver,
  type Auth,
} from "firebase/auth";

export function isFirebaseClientConfigured() {
  return Boolean(
    process.env.NEXT_PUBLIC_FIREBASE_API_KEY &&
      process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN &&
      process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID
  );
}

/**
 * Use the site hostname in production so Auth helper is same-origin
 * (via next.config rewrite). Keep firebaseapp.com on localhost.
 */
export function resolveFirebaseAuthDomain() {
  if (typeof window !== "undefined") {
    const host = window.location.hostname;
    if (host && host !== "localhost" && host !== "127.0.0.1") {
      return host;
    }
  }
  return process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "";
}

function createFirebaseApp(): FirebaseApp {
  const authDomain = resolveFirebaseAuthDomain();
  return getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });
}

/**
 * Prefer IndexedDB persistence + popup resolver so Safari / partitioned
 * storage does not break Google login (missing redirect initial state).
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
export function getFirebaseAuth(): Auth {
  if (!isFirebaseClientConfigured()) {
    throw new Error("Firebase client is not configured");
  }

  const app = createFirebaseApp();

  try {
    return initializeAuth(app, {
      persistence: [indexedDBLocalPersistence, browserLocalPersistence],
      popupRedirectResolver: browserPopupRedirectResolver,
    });
  } catch {
    // Auth already initialized on this app instance
    return getAuth(app);
  }
}
