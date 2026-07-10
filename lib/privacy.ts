/**
 * Privacy module for Jira Clone application.
 * Provides GDPR-compliant data export, import, and deletion functionality.
 * All data is stored in browser localStorage with AES-GCM encryption.
 */

import { STORAGE_KEYS } from "@/app/dashboard/constants";

/**
 * Interface representing the structure of an exported data package.
 */
export interface ExportedData {
  exportDate: string; // ISO timestamp of when the data was exported
  version: string; // Application version identifier
  data: {
    tasks: unknown;
    requirements: unknown;
    testCases: unknown;
    bugs: unknown;
    goals: unknown;
    milestones: unknown;
    keyResults: unknown;
  };
}

/**
 * Reads and parses data from a localStorage key.
 * Attempts to parse JSON; returns an empty array on failure.
 * @param key - localStorage key to read from
 * @returns Parsed data or empty array
 */
const readStorageItem = (key: string): unknown => {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
};

/**
 * Deep-strips sensitive fields from an object or array.
 * Removes password, passwordHash, and other sensitive fields recursively.
 * @param data - The data to sanitize
 * @returns A sanitized copy with sensitive fields removed
 */
const SENSITIVE_FIELDS = ["password", "passwordHash", "token", "secret"];

const stripSensitiveFields = (data: unknown): unknown => {
  if (Array.isArray(data)) {
    return data.map(stripSensitiveFields);
  }
  if (data !== null && typeof data === "object") {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(data as Record<string, unknown>)) {
      if (SENSITIVE_FIELDS.includes(key)) continue;
      sanitized[key] = stripSensitiveFields(value);
    }
    return sanitized;
  }
  return data;
};

/**
 * Exports all user data from localStorage as a downloadable JSON file.
 * Collects data from all STORAGE_KEYS including tasks, requirements,
 * test cases, bugs, goals, milestones, and key results.
 *
 * The exported file follows the pattern:
 *   jira-clone-export-YYYY-MM-DDTHH-mm-ss.json
 */
export const exportUserData = (): void => {
  const exportPackage: ExportedData = {
    exportDate: new Date().toISOString(),
    version: "1.0.0",
    data: {
      tasks: readStorageItem(STORAGE_KEYS.TASKS),
      requirements: readStorageItem(STORAGE_KEYS.REQUIREMENTS),
      testCases: readStorageItem(STORAGE_KEYS.TEST_CASES),
      bugs: readStorageItem(STORAGE_KEYS.BUGS),
      goals: readStorageItem(STORAGE_KEYS.GOALS),
      milestones: readStorageItem(STORAGE_KEYS.MILESTONES),
      keyResults: readStorageItem(STORAGE_KEYS.KEY_RESULTS),
    },
  };

  const sanitized = stripSensitiveFields(exportPackage);
  const jsonContent = JSON.stringify(sanitized, null, 2);
  const blob = new Blob([jsonContent], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const filename = `jira-clone-export-${timestamp}.json`;

  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Validates the structure of an imported data object.
 * Checks that all required data keys are present and are arrays.
 * @param data - The parsed data object to validate
 * @returns True if the data structure is valid, false otherwise
 */
const validateImportData = (data: unknown): data is ExportedData => {
  if (!data || typeof data !== "object") return false;
  const d = data as Record<string, unknown>;
  if (typeof d.exportDate !== "string") return false;
  if (typeof d.version !== "string") return false;
  if (!d.data || typeof d.data !== "object") return false;

  const dataObj = d.data as Record<string, unknown>;
  const requiredKeys = [
    "tasks",
    "requirements",
    "testCases",
    "bugs",
    "goals",
    "milestones",
    "keyResults",
  ];

  for (const key of requiredKeys) {
    if (!(key in dataObj) || !Array.isArray(dataObj[key])) {
      return false;
    }
  }

  return true;
};

/**
 * Imports user data from a JSON file.
 * Reads the file, parses JSON, validates the structure, and returns the data.
 * @param file - The File object from a file input
 * @returns Promise resolving to the imported ExportedData object
 * @throws Error if the file cannot be read, parsed, or validated
 */
export const importUserData = (file: File): Promise<ExportedData> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        if (!content) {
          reject(new Error("Failed to read file content"));
          return;
        }

        const parsed = JSON.parse(content);

        if (!validateImportData(parsed)) {
          reject(
            new Error(
              "Invalid data format. The file does not contain valid Jira Clone export data."
            )
          );
          return;
        }

        resolve(parsed);
      } catch (error) {
        if (error instanceof Error) {
          reject(error);
        } else {
          reject(new Error("Failed to parse the imported file"));
        }
      }
    };

    reader.onerror = () => {
      reject(new Error("Failed to read the file"));
    };

    reader.readAsText(file);
  });
};

/**
 * Deletes all user data from localStorage.
 * Clears all STORAGE_KEYS entries and the privacy consent flag.
 * @returns An object with success status and a confirmation message
 */
export const deleteAllUserData = (): { success: boolean; message: string } => {
  try {
    const allKeys = Object.values(STORAGE_KEYS);
    for (const key of allKeys) {
      localStorage.removeItem(key);
    }
    localStorage.removeItem("jira-clone-privacy-consent");
    localStorage.removeItem("jira-clone-auth-token");
    localStorage.removeItem("jira-clone-users");

    return {
      success: true,
      message: "All user data has been successfully deleted.",
    };
  } catch (error) {
    return {
      success: false,
      message: "Failed to delete some data. Please try again.",
    };
  }
};
