"use client";

import { useState, useEffect } from "react";
import { getAuthState, logout, type User } from "@/lib/auth";

/**
 * Authentication hook.
 * Manages authentication state and login/logout handlers.
 * Does NOT record audit logs - the caller should wrap handlers with audit logging.
 */
export function useAuth() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  /**
   * Initialize authentication state on component mount.
   * Checks localStorage for existing auth token and user.
   */
  useEffect(() => {
    const auth = getAuthState();
    setIsAuthenticated(auth.isAuthenticated);
    setCurrentUser(auth.user);
  }, []);

  /**
   * Handle successful login.
   * Updates authentication state after login form submission.
   */
  const handleLoginSuccess = () => {
    const auth = getAuthState();
    console.log("[useAuth] 登录成功:", {
      username: auth.user?.username,
      email: auth.user?.email,
      timestamp: new Date().toISOString(),
    });
    setIsAuthenticated(auth.isAuthenticated);
    setCurrentUser(auth.user);
  };

  /**
   * Handle logout.
   * Clears auth token and resets authentication state.
   */
  const handleLogout = () => {
    console.log("[useAuth] 登出:", {
      username: currentUser?.username,
      email: currentUser?.email,
      timestamp: new Date().toISOString(),
    });
    logout();
    setIsAuthenticated(false);
    setCurrentUser(null);
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
