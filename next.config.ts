import type { NextConfig } from "next";

/**
 * Proxy Firebase Auth helper onto our domain so Safari/Chrome can complete
 * signInWithRedirect without third-party storage (ITP).
 * @see https://firebase.google.com/docs/auth/web/redirect-best-practices
 */
const firebaseProjectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
const firebaseAuthProxyHost =
  process.env.FIREBASE_AUTH_PROXY_HOST ||
  (firebaseProjectId ? `${firebaseProjectId}.firebaseapp.com` : "");

const nextConfig: NextConfig = {
  serverExternalPackages: ["firebase-admin"],
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
    ],
  },
  async redirects() {
    return [
      // Old static-hosting habit / ads typos — no real index.html in Next.js
      { source: "/index.html", destination: "/", permanent: true },
      { source: "/index.htm", destination: "/", permanent: true },
      { source: "/loout", destination: "/logout", permanent: false },
      { source: "/logut", destination: "/logout", permanent: false },
      { source: "/signout", destination: "/logout", permanent: false },
      // Common /home2 typos
      { source: "/hone2", destination: "/home2", permanent: false },
      { source: "/hom2", destination: "/home2", permanent: false },
      { source: "/homee2", destination: "/home2", permanent: false },
      { source: "/hmoe2", destination: "/home2", permanent: false },
    ];
  },
  async rewrites() {
    const home2 = [
      { source: "/home2", destination: "/home2/index.html" },
      { source: "/home2/", destination: "/home2/index.html" },
    ];
    if (!firebaseAuthProxyHost) return home2;
    return [
      ...home2,
      {
        source: "/__/auth/:path*",
        destination: `https://${firebaseAuthProxyHost}/__/auth/:path*`,
      },
      {
        source: "/__/firebase/:path*",
        destination: `https://${firebaseAuthProxyHost}/__/firebase/:path*`,
      },
    ];
  },
};

export default nextConfig;
