import { createRemoteJWKSet, jwtVerify } from "jose";

const FIREBASE_JWKS = createRemoteJWKSet(
  new URL(
    "https://www.googleapis.com/service_accounts/v1/jwk/securetoken@system.gserviceaccount.com"
  )
);

export type FirebaseIdToken = {
  uid: string;
  email: string | null;
  name: string | null;
  picture: string | null;
};

export function getFirebaseProjectId() {
  return (
    process.env.FIREBASE_PROJECT_ID ||
    process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ||
    null
  );
}

export async function verifyFirebaseIdToken(idToken: string): Promise<FirebaseIdToken> {
  const projectId = getFirebaseProjectId();
  if (!projectId) {
    throw new Error("Firebase project is not configured");
  }

  const { payload } = await jwtVerify(idToken, FIREBASE_JWKS, {
    issuer: `https://securetoken.google.com/${projectId}`,
    audience: projectId,
    clockTolerance: 60,
  });

  const uid = typeof payload.sub === "string" ? payload.sub : "";
  if (!uid) {
    throw new Error("Firebase token is missing subject");
  }

  return {
    uid,
    email: typeof payload.email === "string" ? payload.email : null,
    name: typeof payload.name === "string" ? payload.name : null,
    picture: typeof payload.picture === "string" ? payload.picture : null,
  };
}
