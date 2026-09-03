import type { Auth } from "firebase-admin/auth";

let authInstance: Auth | null = null;

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

function normalizePrivateKey(value: string) {
  return value.replace(/\\n/g, "\n").replace(/^["']|["']$/g, "").trim();
}

export async function getFirebaseAdminAuth() {
  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured");
  }

  if (authInstance) return authInstance;

  const { cert, getApps, initializeApp } = await import("firebase-admin/app");
  const { getAuth } = await import("firebase-admin/auth");

  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? ""),
      }),
    });
  }

  authInstance = getAuth();
  return authInstance;
}
