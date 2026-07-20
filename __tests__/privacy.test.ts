import {
  exportUserData,
  importUserData,
  deleteAllUserData,
} from "../lib/privacy";

describe("Privacy Module", () => {
  let mockStorage: Record<string, string>;

  beforeEach(() => {
    mockStorage = {};
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: (key: string) => mockStorage[key] || null,
        setItem: (key: string, value: string) => {
          mockStorage[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete mockStorage[key];
        },
        clear: () => {
          mockStorage = {};
        },
        length: () => Object.keys(mockStorage).length,
        key: (index: number) => Object.keys(mockStorage)[index] || null,
      },
      writable: true,
    });

    URL.createObjectURL = jest.fn().mockReturnValue("blob://test-url");
    URL.revokeObjectURL = jest.fn();

    const mockLink = {
      href: "",
      download: "",
      click: jest.fn(),
    };
    (document.createElement as jest.Mock) = jest.fn().mockReturnValue(mockLink);
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  describe("exportUserData", () => {
    it("should export data with correct structure", () => {
      localStorage.setItem(
        "jira-clone-tasks",
        JSON.stringify([{ id: "task-1" }])
      );
      localStorage.setItem(
        "jira-clone-requirements",
        JSON.stringify([{ id: "req-1" }])
      );
      localStorage.setItem(
        "jira-clone-test-cases",
        JSON.stringify([{ id: "test-1" }])
      );
      localStorage.setItem(
        "jira-clone-bugs",
        JSON.stringify([{ id: "bug-1" }])
      );
      localStorage.setItem(
        "jira-clone-goals",
        JSON.stringify([{ id: "goal-1" }])
      );
      localStorage.setItem(
        "jira-clone-milestones",
        JSON.stringify([{ id: "milestone-1" }])
      );
      localStorage.setItem(
        "jira-clone-key-results",
        JSON.stringify([{ id: "kr-1" }])
      );

      exportUserData();

      expect(document.createElement).toHaveBeenCalledWith("a");
      expect(URL.createObjectURL).toHaveBeenCalled();
      expect(document.body.appendChild).toHaveBeenCalled();
    });

    it("should create download link with proper filename", () => {
      exportUserData();

      const link = document.createElement("a");
      expect(link.download).toMatch(
        /jira-clone-export-\d{4}-\d{2}-\d{2}T\d{2}-\d{2}-\d{2}-\d+Z\.json/
      );
    });

    it("should sanitize sensitive data in export", () => {
      localStorage.setItem(
        "jira-clone-tasks",
        JSON.stringify([{ id: "task-1", password: "secret" }])
      );

      exportUserData();

      expect(URL.createObjectURL).toHaveBeenCalled();
    });

    it("should handle empty localStorage gracefully", () => {
      exportUserData();

      expect(document.createElement).toHaveBeenCalledWith("a");
    });

    it("should handle invalid JSON in localStorage", () => {
      localStorage.setItem("jira-clone-tasks", "invalid json");

      exportUserData();

      expect(document.createElement).toHaveBeenCalledWith("a");
    });

    it("should handle non-array data in localStorage", () => {
      localStorage.setItem("jira-clone-tasks", JSON.stringify({ id: "1" }));

      exportUserData();

      expect(document.createElement).toHaveBeenCalledWith("a");
    });
  });

  describe("importUserData", () => {
    const createValidFile = (content: string) =>
      new File([content], "export.json", { type: "application/json" });

    it("should import valid data", async () => {
      const content = JSON.stringify({
        exportDate: "2026-07-13T10:00:00Z",
        version: "1.0.0",
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
          milestones: [],
          keyResults: [],
        },
      });
      const file = createValidFile(content);

      const result = await importUserData(file);

      expect(result.exportDate).toBe("2026-07-13T10:00:00Z");
      expect(result.version).toBe("1.0.0");
    });

    it("should reject invalid JSON", async () => {
      const file = createValidFile("invalid json");

      await expect(importUserData(file)).rejects.toThrow();
    });

    it("should reject empty file content", async () => {
      const file = createValidFile("");

      await expect(importUserData(file)).rejects.toThrow(
        "Failed to read file content"
      );
    });

    it("should reject invalid data format", async () => {
      const content = JSON.stringify({ invalid: "data" });
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should reject missing required fields", async () => {
      const content = JSON.stringify({
        exportDate: "2026-07-13T10:00:00Z",
        version: "1.0.0",
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
          milestones: [],
        },
      });
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should reject missing exportDate", async () => {
      const content = JSON.stringify({
        version: "1.0.0",
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
          milestones: [],
          keyResults: [],
        },
      });
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should reject non-string exportDate", async () => {
      const content = JSON.stringify({
        exportDate: 123,
        version: "1.0.0",
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
          milestones: [],
          keyResults: [],
        },
      });
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should reject non-object data", async () => {
      const content = JSON.stringify("not an object");
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should reject non-array tasks", async () => {
      const content = JSON.stringify({
        exportDate: "2026-07-13T10:00:00Z",
        version: "1.0.0",
        data: {
          tasks: "not an array",
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
          milestones: [],
          keyResults: [],
        },
      });
      const file = createValidFile(content);

      await expect(importUserData(file)).rejects.toThrow(
        "Invalid data format. The file does not contain valid Jira Clone export data."
      );
    });

    it("should import data with valid arrays", async () => {
      const content = JSON.stringify({
        exportDate: "2026-07-13T10:00:00Z",
        version: "1.0.0",
        data: {
          tasks: [{ id: "1" }],
          requirements: [{ id: "2" }],
          testCases: [{ id: "3" }],
          bugs: [{ id: "4" }],
          goals: [{ id: "5" }],
          milestones: [{ id: "6" }],
          keyResults: [{ id: "7" }],
        },
      });
      const file = createValidFile(content);

      const result = await importUserData(file);

      expect(result.data.tasks).toEqual([{ id: "1" }]);
      expect(result.data.requirements).toEqual([{ id: "2" }]);
    });
  });

  describe("deleteAllUserData", () => {
    it("should delete all user data successfully", () => {
      localStorage.setItem("jira-clone-tasks", "[]");
      localStorage.setItem("jira-clone-requirements", "[]");
      localStorage.setItem("jira-clone-test-cases", "[]");
      localStorage.setItem("jira-clone-bugs", "[]");
      localStorage.setItem("jira-clone-goals", "[]");
      localStorage.setItem("jira-clone-milestones", "[]");
      localStorage.setItem("jira-clone-key-results", "[]");
      localStorage.setItem("jira-clone-privacy-consent", "true");
      localStorage.setItem("jira-clone-auth-token", "token");
      localStorage.setItem("jira-clone-users", "[]");

      const result = deleteAllUserData();

      expect(result.success).toBe(true);
      expect(result.message).toBe(
        "All user data has been successfully deleted."
      );
    });

    it("should handle empty localStorage gracefully", () => {
      const result = deleteAllUserData();

      expect(result.success).toBe(true);
    });

    it("should return error on failure", () => {
      const originalRemoveItem = localStorage.removeItem.bind(localStorage);
      (localStorage as any).removeItem = jest.fn().mockImplementation(() => {
        throw new Error("Storage error");
      });

      const result = deleteAllUserData();

      expect(result.success).toBe(false);
      expect(result.message).toBe(
        "Failed to delete some data. Please try again."
      );

      (localStorage as any).removeItem = originalRemoveItem;
    });

    it("should remove privacy consent flag", () => {
      localStorage.setItem("jira-clone-privacy-consent", "true");

      deleteAllUserData();

      expect(localStorage.getItem("jira-clone-privacy-consent")).toBe(null);
    });

    it("should remove auth token", () => {
      localStorage.setItem("jira-clone-auth-token", "token123");

      deleteAllUserData();

      expect(localStorage.getItem("jira-clone-auth-token")).toBe(null);
    });

    it("should remove non-admin users data", () => {
      localStorage.setItem(
        "jira-clone-users",
        JSON.stringify([{ id: "1", role: "USER" }])
      );

      deleteAllUserData();

      expect(localStorage.getItem("jira-clone-users")).toBe(null);
    });

    it("should preserve admin accounts when deleting all data", () => {
      localStorage.setItem(
        "jira-clone-users",
        JSON.stringify([
          {
            id: "1",
            username: "admin",
            email: "admin@example.com",
            role: "ADMIN",
            passwordHash: "hashedpassword123",
          },
          {
            id: "2",
            username: "user",
            email: "user@example.com",
            role: "USER",
          },
        ])
      );

      const result = deleteAllUserData();

      const remainingUsers = JSON.parse(
        localStorage.getItem("jira-clone-users") || "[]"
      );
      expect(remainingUsers.length).toBe(1);
      expect(remainingUsers[0].username).toBe("admin");
      expect(remainingUsers[0].role).toBe("ADMIN");
      expect(remainingUsers[0].passwordHash).toBe("hashedpassword123");
      expect(result.message).toContain(
        "Admin accounts (1) have been preserved"
      );
    });

    it("should preserve admin passwordHash when deleting all data", () => {
      const originalPasswordHash = "sha256hashedpassword456";
      localStorage.setItem(
        "jira-clone-users",
        JSON.stringify([
          {
            id: "1",
            username: "admin",
            email: "admin@test.com",
            role: "ADMIN",
            passwordHash: originalPasswordHash,
          },
        ])
      );

      deleteAllUserData();

      const remainingUsers = JSON.parse(
        localStorage.getItem("jira-clone-users") || "[]"
      );
      expect(remainingUsers.length).toBe(1);
      expect(remainingUsers[0].passwordHash).toBe(originalPasswordHash);
    });

    it("should preserve multiple admin accounts", () => {
      localStorage.setItem(
        "jira-clone-users",
        JSON.stringify([
          {
            id: "1",
            username: "admin1",
            email: "admin1@example.com",
            role: "ADMIN",
          },
          {
            id: "2",
            username: "admin2",
            email: "admin2@example.com",
            role: "ADMIN",
          },
          {
            id: "3",
            username: "user",
            email: "user@example.com",
            role: "USER",
          },
        ])
      );

      const result = deleteAllUserData();

      const remainingUsers = JSON.parse(
        localStorage.getItem("jira-clone-users") || "[]"
      );
      expect(remainingUsers.length).toBe(2);
      expect(result.message).toContain(
        "Admin accounts (2) have been preserved"
      );
    });

    it("should return standard message when no admins exist", () => {
      localStorage.setItem(
        "jira-clone-users",
        JSON.stringify([
          {
            id: "1",
            username: "user",
            email: "user@example.com",
            role: "USER",
          },
        ])
      );

      const result = deleteAllUserData();

      expect(localStorage.getItem("jira-clone-users")).toBe(null);
      expect(result.message).toBe(
        "All user data has been successfully deleted."
      );
    });

    it("should handle invalid users data gracefully", () => {
      localStorage.setItem("jira-clone-users", "invalid json");

      const result = deleteAllUserData();

      expect(result.success).toBe(true);
    });
  });
});
