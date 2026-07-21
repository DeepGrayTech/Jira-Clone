import type { DefaultUser } from "next-auth";
import type { UserRole } from "@/lib/auth";

declare module "next-auth" {
  interface User extends DefaultUser {
    id: string;
    role: UserRole;
  }

  interface Session {
    user: User;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    role?: UserRole;
  }
}
