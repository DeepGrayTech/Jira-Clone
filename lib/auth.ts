/**
 * Authentication module for Jira Clone application.
 *
 * Since v1.4.0, authentication is handled by NextAuth.js (see lib/auth-config.ts).
 * This module only retains the shared UserRole type and the localStorage
 * cleanup helper used on logout and privacy-consent revocation.
 */

import { STORAGE_KEYS } from "@/app/dashboard/constants";

/**
 * User role types for role-based access control (RBAC).
 */
export type UserRole = "ADMIN" | "USER";

// Legacy localStorage auth keys (pre-NextAuth), cleared on logout/clear.
const USERS_KEY = "jira-clone-users";
const AUTH_TOKEN_KEY = "jira-clone-auth-token";

/**
 * Clears the legacy auth keys and all application data from localStorage.
 * Used for logout cleanup and GDPR "Right to be Forgotten" compliance:
 * removes the auth token, all users, the privacy consent flag, and all
 * application data storage keys.
 */
export const logoutAndClear = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
  localStorage.removeItem(USERS_KEY);
  localStorage.removeItem("jira-clone-privacy-consent");

  // Clear all application data storage keys
  const appKeys = Object.values(STORAGE_KEYS);

  for (const key of appKeys) {
    localStorage.removeItem(key);
  }
};
