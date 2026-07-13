/**
 * Encryption module for Jira Clone application.
 * Provides AES-GCM 256-bit encryption and decryption using Web Crypto API.
 * All sensitive data stored in localStorage is encrypted using these functions.
 */

/**
 * localStorage key for storing the encryption key.
 * The key is stored as base64-encoded string.
 */
import { utf8Encode, utf8Decode } from "./encoding";

const ENCRYPTION_KEY_STORAGE_KEY = "jira-clone-encryption-key";

/**
 * Converts a Uint8Array to a base64-encoded string.
 * Uses a binary string intermediary to ensure correct byte-level encoding.
 */
function uint8ArrayToBase64(bytes: Uint8Array): string {
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Converts a base64-encoded string back to a Uint8Array.
 */
function base64ToUint8Array(base64: string): Uint8Array {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

/**
 * Generates or retrieves the AES-GCM encryption key.
 * If a key already exists in localStorage, it imports and returns it.
 * Otherwise, it generates a new 256-bit AES-GCM key.
 * @returns Promise resolving to CryptoKey for encryption/decryption
 */
export const generateKey = async (): Promise<CryptoKey> => {
  const storedKey = localStorage.getItem(ENCRYPTION_KEY_STORAGE_KEY);
  if (storedKey) {
    const keyData = base64ToUint8Array(storedKey);
    return crypto.subtle.importKey(
      "raw",
      keyData as BufferSource,
      { name: "AES-GCM" },
      true,
      ["encrypt", "decrypt"]
    );
  }
  // Generate new AES-GCM key with 256-bit length
  const key = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"]
  );
  // Export key and store in localStorage
  const exportedKey = await crypto.subtle.exportKey("raw", key);
  const base64Key = uint8ArrayToBase64(new Uint8Array(exportedKey));
  localStorage.setItem(ENCRYPTION_KEY_STORAGE_KEY, base64Key);
  return key;
};

/**
 * Encrypts data using AES-GCM encryption.
 * Generates a random 12-byte IV for each encryption.
 * @param data - Serializable data to encrypt
 * @returns Promise resolving to base64-encoded encrypted string
 */
export const encryptData = async <T,>(data: T): Promise<string | null> => {
  try {
    const key = await generateKey();
    // Generate random 12-byte initialization vector (IV)
    const iv = crypto.getRandomValues(new Uint8Array(12));
    // Encode data to UTF-8 bytes
    const encoded = utf8Encode(JSON.stringify(data));
    // Encrypt using AES-GCM
    const encrypted = await crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      key,
      encoded.buffer as ArrayBuffer
    );
    const encryptedArray = new Uint8Array(encrypted);
    // Combine IV and ciphertext
    const combined = new Uint8Array(iv.length + encryptedArray.length);
    combined.set(iv, 0);
    combined.set(encryptedArray, iv.length);
    return uint8ArrayToBase64(combined);
  } catch {
    return null;
  }
};

/**
 * Decrypts data that was encrypted with encryptData.
 * Extracts the IV from the beginning of the encrypted data.
 * @param data - Base64-encoded encrypted string
 * @returns Promise resolving to decrypted data or null if decryption fails
 */
export const decryptData = async <T,>(data: string): Promise<T | null> => {
  try {
    const key = await generateKey();
    const decoded = base64ToUint8Array(data);
    // Extract IV (first 12 bytes) and ciphertext (remaining)
    const iv = decoded.slice(0, 12);
    const encrypted = decoded.slice(12);
    // Decrypt using AES-GCM
    const decrypted = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv },
      key,
      encrypted
    );
    // Convert to string and parse JSON
    const decodedData = utf8Decode(new Uint8Array(decrypted));
    if (decodedData === null) return null;
    return JSON.parse(decodedData);
  } catch {
    // Return null on any decryption failure (corrupted data, wrong key, etc.)
    return null;
  }
};
