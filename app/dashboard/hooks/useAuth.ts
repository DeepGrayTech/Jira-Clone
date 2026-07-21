"use client";

import { useSession, signOut } from "next-auth/react";
import { useEffect, useState } from "react";

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  username?: string;
  role?: string;
}

export function useAuth() {
  const { data: session, status } = useSession();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    if (status === "authenticated" && session?.user) {
      setIsAuthenticated(true);
      const fallbackName = session.user.name || session.user.email || "Unknown";
      setCurrentUser({
        id: session.user.id || "",
        email: session.user.email || "",
        name: session.user.name || undefined,
        username: fallbackName,
        role: (session.user as any).role || "USER",
      });
    } else if (status === "unauthenticated") {
      setIsAuthenticated(false);
      setCurrentUser(null);
    }
  }, [session, status]);

  const handleLoginSuccess = () => {
    // NextAuth session is automatically refreshed after signIn callback
  };

  const handleLogout = () => {
    signOut({ callbackUrl: "/" });
  };

  return {
    isAuthenticated,
    setIsAuthenticated,
    currentUser,
    setCurrentUser,
    handleLoginSuccess,
    handleLogout,
  };
}
