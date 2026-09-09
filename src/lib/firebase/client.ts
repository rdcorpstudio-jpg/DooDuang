import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";

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

export function getFirebaseAuth() {
  if (!isFirebaseClientConfigured()) {
    throw new Error("Firebase client is not configured");
  }

  const authDomain = resolveFirebaseAuthDomain();

  const app = getApps().length
    ? getApp()
    : initializeApp({
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      });

  return getAuth(app);
}
