import "next-auth";
import "next-auth/jwt";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      credits: number;
    };
  }

  interface User {
    credits: number;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    credits?: number;
  }
}

declare module "@auth/core/adapters" {
  interface AdapterUser {
    credits: number;
  }
}
