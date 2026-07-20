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
  console.log('[hashPassword] 开始哈希:', { passwordLength: password.length, password });
  const data = utf8Encode(password);

  console.log('[hashPassword] utf8Encode 结果:', {
    type: data.constructor.name,
    length: data.length,
    bufferType: data.buffer.constructor.name,
    bufferByteLength: data.buffer.byteLength,
    first10Bytes: Array.from(data.slice(0, 10)).map(b => b.toString(16).padStart(2, '0')).join(' '),
  });

  let hash: string;
  let usedMethod: string;

  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const hashBuffer = await crypto.subtle.digest("SHA-256", data.buffer as ArrayBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      usedMethod = 'Web Crypto API';
    } catch (webCryptoError) {
      console.log('[hashPassword] Web Crypto API 失败:', webCryptoError);
      const { createHash } = require('crypto');
      hash = createHash('sha256').update(Buffer.from(data.buffer as ArrayBuffer)).digest('hex');
      usedMethod = 'Node.js crypto (fallback)';
    }
  } else {
    const { createHash } = require('crypto');
    hash = createHash('sha256').update(Buffer.from(data.buffer as ArrayBuffer)).digest('hex');
    usedMethod = 'Node.js crypto';
  }

  console.log('[hashPassword] 哈希完成:', { hashLength: hash.length, usedMethod, fullHash: hash });
  return hash;
};

const hashPasswordWithMD5 = async (password: string): Promise<string> => {
  console.log('[hashPasswordWithMD5] 开始MD5哈希:', { passwordLength: password.length });

  let hash: string;

  if (typeof crypto !== 'undefined' && crypto.subtle && typeof crypto.subtle.digest === 'function') {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest("MD5", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      hash = hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
      console.log('[hashPasswordWithMD5] 使用 Web Crypto API MD5');
    } catch {
      const { createHash } = require('crypto');
      hash = createHash('md5').update(password).digest('hex');
      console.log('[hashPasswordWithMD5] 使用 Node.js crypto MD5');
    }
  } else {
    const { createHash } = require('crypto');
    hash = createHash('md5').update(password).digest('hex');
    console.log('[hashPasswordWithMD5] 使用 Node.js crypto MD5');
  }

  console.log('[hashPasswordWithMD5] MD5哈希完成:', { hashLength: hash.length, fullHash: hash });
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
  if (depth > 2) {
    return { success: false, message: "Login failed: maximum recursion depth exceeded" };
  }

  console.log("[login] === 登录请求 ===");
  console.log("[login] 邮箱:", email);
  console.log("[login] 密码长度:", password.length);
  console.log("[login] 当前环境:", typeof window !== "undefined" ? "浏览器" : "Node.js");

  let users = getUsers();
  console.log("[login] 用户列表长度:", users.length);

  if (users.length === 0) {
    console.log("[login] 用户列表为空，创建默认管理员");
    const result = await register("admin", "admin@example.com", "admin123", "ADMIN");
    if (result.success) {
      console.log("[login] 默认管理员创建成功，重新登录");
      return login(email, password, depth + 1);
    }
    return { success: false, message: "Failed to create default admin" };
  }

  const user = users.find((u) => u.email === email);

  if (!user) {
    console.log("[login] 用户不存在:", email);
    return { success: false, message: "User not found" };
  }

  console.log("[login] 找到用户:", {
    id: user.id,
    username: user.username,
    email: user.email,
    storedPasswordHash: user.passwordHash,
    storedHashLength: user.passwordHash.length,
  });

  if (user.passwordHash.length < 32) {
    console.warn("[login] 检测到密码哈希数据损坏（长度不足32字符），重置用户数据");
    localStorage.removeItem(USERS_KEY);
    users = [];
    const result = await register("admin", "admin@example.com", "admin123", "ADMIN");
    if (result.success) {
      console.log("[login] 用户数据已重置，重新登录");
      return login(email, password, depth + 1);
    }
    return { success: false, message: "User data corrupted, failed to reset" };
  }

  const hashedPassword = await hashPassword(password);
  console.log("[login] 输入密码的SHA-256哈希:", hashedPassword);
  console.log("[login] SHA-256哈希匹配:", user.passwordHash === hashedPassword);

  if (user.passwordHash !== hashedPassword) {
    console.log("[login] SHA-256不匹配，尝试MD5...");
    const md5Hash = await hashPasswordWithMD5(password);
    console.log("[login] 输入密码的MD5哈希:", md5Hash);
    console.log("[login] MD5哈希匹配:", user.passwordHash === md5Hash);
    
    if (user.passwordHash !== md5Hash) {
      console.log("[login] 密码不匹配，登录失败");
      return { success: false, message: "Incorrect password" };
    }
    
    console.log("[login] 使用MD5哈希验证成功（旧数据兼容模式）");
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
