/**
 * Authentication module for Jira Clone application.
 * Provides user registration, login, logout, and permission checking functionality.
 * Data is stored in browser localStorage with password hashing for security.
 */

import { STORAGE_KEYS } from "@/app/dashboard/constants";

/**
 * User role types for role-based access control (RBAC).
 */
export type UserRole = "ADMIN" | "USER";

/**
 * User interface representing a registered user.
 */
export interface User {
  id: string;          // Unique user identifier (timestamp-based)
  username: string;    // Display name for the user
  email: string;       // Unique email address (used for login)
  passwordHash: string; // Hashed password for authentication
  role: UserRole;      // Role determining access permissions
  createdAt: string;   // ISO timestamp of account creation
}

/**
 * Authentication state interface representing current login status.
 */
export interface AuthState {
  isAuthenticated: boolean; // Whether user is currently logged in
  user: User | null;        // Current user object (null if not authenticated)
  token: string | null;     // Authentication token (stored in localStorage)
}

// localStorage keys for authentication data
const USERS_KEY = "jira-clone-users";
const AUTH_TOKEN_KEY = "jira-clone-auth-token";

/**
 * Generates a cryptographically secure authentication token.
 * Combines timestamp with random bytes from crypto.getRandomValues().
 * @returns Generated token string
 */
const generateToken = (): string => {
  const array = new Uint8Array(16);
  crypto.getRandomValues(array);
  const hex = Array.from(array, (b) => b.toString(16).padStart(2, "0")).join("");
  return `${Date.now()}-${hex}`;
};

import { utf8Encode } from "./encoding";

/**
 * Hashes a password using SHA-256 via Web Crypto API.
 * @param password - Plain text password to hash
 * @returns Promise resolving to hex-encoded hash string
 */
const hashPassword = async (password: string): Promise<string> => {
  console.log('[hashPassword] 开始哈希:', { passwordLength: password.length });
  const data = utf8Encode(password);

  let hash: string;
  try {
    const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  } catch {
    const { createHash } = require('crypto');
    hash = createHash('sha256').update(Buffer.from(data.buffer as ArrayBuffer)).digest('hex');
    console.log('[hashPassword] 使用 Node.js crypto 回退');
  }

  console.log('[hashPassword] 哈希完成:', { hashLength: hash.length });
  return hash;
};

/**
 * Retrieves all registered users from localStorage.
 * @returns Array of User objects, empty array if none exist or error occurs
 */
export const getUsers = (): User[] => {
  try {
    const data = localStorage.getItem(USERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
};

/**
 * Saves users array to localStorage.
 * @param users - Array of User objects to save
 */
export const saveUsers = (users: User[]): void => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

/**
 * Registers a new user with the provided credentials.
 * Validates email format, password strength, and username/email uniqueness.
 * @param username - User's display name
 * @param email - User's email address
 * @param password - User's password (minimum 6 characters)
 * @param role - User role (default: "USER")
 * @returns Promise resolving to object with success status and message
 */
export const register = async (
  username: string,
  email: string,
  password: string,
  role: UserRole = "USER"
): Promise<{ success: boolean; message: string }> => {
  const users = getUsers();

  // Check if email already exists
  if (users.some((u) => u.email === email)) {
    return { success: false, message: "Email already exists" };
  }

  // Check if username already exists
  if (users.some((u) => u.username === username)) {
    return { success: false, message: "Username already exists" };
  }

  // Validate required fields
  if (!username || !email || !password) {
    return { success: false, message: "All fields are required" };
  }

  // Validate email format
  if (!email.includes("@")) {
    return { success: false, message: "Invalid email format" };
  }

  // Validate password strength
  if (password.length < 6) {
    return { success: false, message: "Password must be at least 6 characters" };
  }

  // Create new user object
  const newUser: User = {
    id: Date.now().toString(),
    username,
    email,
    passwordHash: await hashPassword(password),
    role,
    createdAt: new Date().toISOString(),
  };

  // Save user to localStorage
  users.push(newUser);
  saveUsers(users);

  return { success: true, message: "Registration successful" };
};

/**
 * Authenticates a user with email and password.
 * If no users exist, automatically creates a default admin account.
 * @param email - User's email address
 * @param password - User's password
 * @param depth - Internal recursion depth guard (do not pass manually)
 * @returns Promise resolving to object with authentication result and user data
 */
export const login = async (
  email: string,
  password: string,
  depth: number = 0
): Promise<{ success: boolean; message: string; token?: string; user?: User }> => {
  // Prevent infinite recursion
  if (depth > 2) {
    return { success: false, message: "Login failed: maximum recursion depth exceeded" };
  }

  const users = getUsers();

  // Auto-create default admin if no users exist
  if (users.length === 0) {
    const result = await register("admin", "admin@example.com", "admin123", "ADMIN");
    if (result.success) {
      return login(email, password, depth + 1);
    }
    return { success: false, message: "Failed to create default admin" };
  }

  // Find user by email
  const user = users.find((u) => u.email === email);

  if (!user) {
    return { success: false, message: "User not found" };
  }

  // Verify password hash
  const hashedPassword = await hashPassword(password);
  if (user.passwordHash !== hashedPassword) {
    return { success: false, message: "Incorrect password" };
  }

  // Generate and store auth token with userId for accurate state retrieval
  const token = generateToken();
  localStorage.setItem(AUTH_TOKEN_KEY, JSON.stringify({ token, userId: user.id }));

  return { success: true, message: "Login successful", token, user };
};

/**
 * Logs out the current user by removing the authentication token.
 */
export const logout = (): void => {
  localStorage.removeItem(AUTH_TOKEN_KEY);
};

/**
 * Logs out the current user and clears all application data.
 * This function is used for GDPR "Right to be Forgotten" compliance.
 * It removes the auth token, all users, and all application data.
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

/**
 * Retrieves the current authentication state.
 * Parses the stored token+userId and looks up the correct user by ID.
 * @returns AuthState object with authentication status
 */
export const getAuthState = (): AuthState => {
  const stored = localStorage.getItem(AUTH_TOKEN_KEY);

  // No token means not authenticated
  if (!stored) {
    return { isAuthenticated: false, user: null, token: null };
  }

  try {
    const authData = JSON.parse(stored);
    const users = getUsers();
    const user = users.find((u) => u.id === authData.userId);

    if (user) {
      return { isAuthenticated: true, user, token: authData.token };
    }
  } catch {
    // Invalid stored data — clear and return unauthenticated
    localStorage.removeItem(AUTH_TOKEN_KEY);
  }

  return { isAuthenticated: false, user: null, token: null };
};

/**
 * Gets the current authenticated user directly.
 * A safer alternative to reading from localStorage directly.
 * Uses getAuthState to look up the user by the stored token's userId.
 * @returns The current User object, or null if not authenticated
 */
export const getCurrentUser = (): User | null => {
  return getAuthState().user;
};

/**
 * Checks if a user has the required role permission.
 * ADMIN role has access to all permissions.
 * @param user - User object to check
 * @param requiredRole - Role required for access
 * @returns true if user has permission, false otherwise
 */
export const hasPermission = (
  user: User | null,
  requiredRole: UserRole
): boolean => {
  if (!user) return false;
  if (user.role === "ADMIN") return true; // Admin has all permissions
  return user.role === requiredRole;
};
