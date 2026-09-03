import type { Auth } from "firebase-admin/auth";

let authInstance: Auth | null = null;
let initError: Error | null = null;

export function isFirebaseAdminConfigured() {
  return Boolean(
    process.env.FIREBASE_PROJECT_ID &&
      process.env.FIREBASE_CLIENT_EMAIL &&
      process.env.FIREBASE_PRIVATE_KEY
  );
}

export function getFirebaseAdminProjectId() {
  return process.env.FIREBASE_PROJECT_ID || null;
}

function normalizePrivateKey(value: string) {
  let key = value.trim().replace(/^\uFEFF/, "");
  if (key.startsWith("{")) {
    try {
      const parsed = JSON.parse(key) as { private_key?: string };
      if (parsed.private_key) key = parsed.private_key;
    } catch {
      const extracted = key.match(
        /-----BEGIN PRIVATE KEY-----[\s\S]+?-----END PRIVATE KEY-----/
      );
      if (extracted) key = extracted[0];
    }
  }
  key = key.replace(/^["']|["']$/g, "").replace(/\\n/g, "\n").replace(/\r/g, "").trim();
  if (key.includes("BEGIN PRIVATE KEY") && !key.includes("\n")) {
    key = key
      .replace("-----BEGIN PRIVATE KEY-----", "-----BEGIN PRIVATE KEY-----\n")
      .replace("-----END PRIVATE KEY-----", "\n-----END PRIVATE KEY-----\n");
  }
  return key;
}

export async function getFirebaseAdminAuth() {
  if (authInstance) return authInstance;
  if (initError) throw initError;

  if (!isFirebaseAdminConfigured()) {
    throw new Error("Firebase Admin is not configured");
  }

  try {
    const { cert, getApps, initializeApp } = await import("firebase-admin/app");
    const { getAuth } = await import("firebase-admin/auth");

    if (!getApps().length) {
      initializeApp({
        credential: cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: normalizePrivateKey(process.env.FIREBASE_PRIVATE_KEY ?? ""),
        }),
        projectId: process.env.FIREBASE_PROJECT_ID,
      });
    }

    authInstance = getAuth();
    return authInstance;
  } catch (err) {
    initError = err instanceof Error ? err : new Error("Firebase Admin init failed");
    throw initError;
  }
}
