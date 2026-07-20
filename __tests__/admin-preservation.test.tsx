import { register, login, getAuthState } from "../lib/auth";
import { deleteAllUserData } from "../lib/privacy";

describe("Admin Account Preservation Integration Test", () => {
  beforeEach(() => {
    const localStorageMock = (() => {
      let store: Record<string, string> = {};
      return {
        getItem: (key: string) => store[key] || null,
        setItem: (key: string, value: string) => {
          store[key] = value.toString();
        },
        removeItem: (key: string) => {
          delete store[key];
        },
        clear: () => {
          store = {};
        },
        length: () => Object.keys(store).length,
        key: (index: number) => Object.keys(store)[index] || null,
      };
    })();
    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    const mockSubtle = {
      generateKey: jest.fn().mockResolvedValue({
        type: "secret",
        algorithm: { name: "AES-GCM", length: 256 },
        extractable: true,
      }),
      importKey: jest.fn().mockResolvedValue({
        type: "secret",
        algorithm: { name: "AES-GCM", length: 256 },
        extractable: true,
      }),
      exportKey: jest.fn().mockResolvedValue(new Uint8Array(32)),
      encrypt: jest.fn().mockResolvedValue(new Uint8Array([1, 2, 3, 4])),
      decrypt: jest.fn().mockResolvedValue(new Uint8Array([])),
    };

    Object.defineProperty(globalThis, "crypto", {
      value: {
        subtle: mockSubtle,
        getRandomValues: (arr: Uint8Array) => {
          for (let i = 0; i < arr.length; i++) {
            arr[i] = i;
          }
          return arr;
        },
      },
      writable: true,
    });

    Object.defineProperty(globalThis, "TextEncoder", {
      value: class TextEncoder {
        encode(str: string) {
          return new Uint8Array(str.split("").map((c) => c.charCodeAt(0)));
        }
      },
      writable: true,
    });

    Object.defineProperty(globalThis, "TextDecoder", {
      value: class TextDecoder {
        decode(bytes: Uint8Array) {
          return Array.from(bytes)
            .map((b) => String.fromCharCode(b))
            .join("");
        }
      },
      writable: true,
    });

    URL.createObjectURL = jest.fn().mockReturnValue("blob://test-url");
    URL.revokeObjectURL = jest.fn();
  });

  const setupAdminUser = async () => {
    await register("admin", "admin@example.com", "adminpassword123", "ADMIN");
    await login("admin@example.com", "adminpassword123");
    localStorage.setItem("jira-clone-privacy-consent", "true");
  };

  const setupRegularUser = async () => {
    await register("user", "user@example.com", "userpassword123", "USER");
  };

  it("should preserve admin account when deleting all data", async () => {
    await setupAdminUser();
    await setupRegularUser();

    const usersBefore = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersBefore.length).toBe(2);
    expect(usersBefore.some((u: any) => u.username === "admin" && u.role === "ADMIN")).toBe(true);
    expect(usersBefore.some((u: any) => u.username === "user" && u.role === "USER")).toBe(true);

    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1", title: "Test Task" }]));
    localStorage.setItem("jira-clone-requirements", JSON.stringify([{ id: "req-1", title: "Test Requirement" }]));
    localStorage.setItem("jira-clone-bugs", JSON.stringify([{ id: "bug-1", title: "Test Bug" }]));

    expect(localStorage.getItem("jira-clone-tasks")).not.toBeNull();
    expect(localStorage.getItem("jira-clone-requirements")).not.toBeNull();
    expect(localStorage.getItem("jira-clone-bugs")).not.toBeNull();

    deleteAllUserData();

    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-requirements")).toBeNull();
    expect(localStorage.getItem("jira-clone-bugs")).toBeNull();

    const usersAfter = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersAfter.length).toBe(1);
    expect(usersAfter[0].username).toBe("admin");
    expect(usersAfter[0].role).toBe("ADMIN");
    expect(usersAfter[0].email).toBe("admin@example.com");
    expect(usersAfter[0].passwordHash).toBeDefined();
    expect(usersAfter.some((u: any) => u.username === "user")).toBe(false);
  });

  it("should allow admin to login after data deletion", async () => {
    await setupAdminUser();

    expect(localStorage.getItem("jira-clone-users")).not.toBeNull();

    deleteAllUserData();

    expect(localStorage.getItem("jira-clone-auth-token")).toBeNull();

    await login("admin@example.com", "adminpassword123");

    const authState = getAuthState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.username).toBe("admin");
    expect(authState.user?.role).toBe("ADMIN");
  });

  it("should preserve admin with passwordHash after deleteAllUserData", async () => {
    await setupAdminUser();

    const usersBefore = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    const adminBefore = usersBefore.find((u: any) => u.username === "admin");
    const originalPasswordHash = adminBefore.passwordHash;

    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));
    localStorage.setItem("jira-clone-requirements", JSON.stringify([{ id: "req-1" }]));

    deleteAllUserData();

    const usersAfter = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersAfter.length).toBe(1);
    expect(usersAfter[0].username).toBe("admin");
    expect(usersAfter[0].passwordHash).toBe(originalPasswordHash);

    await login("admin@example.com", "adminpassword123");

    const authState = getAuthState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.username).toBe("admin");
  });

  it("should not preserve regular users when deleting all data", async () => {
    await setupRegularUser();

    const usersBefore = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersBefore.length).toBe(1);
    expect(usersBefore[0].username).toBe("user");
    expect(usersBefore[0].role).toBe("USER");

    deleteAllUserData();

    const usersAfter = localStorage.getItem("jira-clone-users");
    expect(usersAfter).toBeNull();
  });

  it("should handle empty users data gracefully", async () => {
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should preserve multiple admin accounts", async () => {
    await register("admin1", "admin1@example.com", "password1", "ADMIN");
    await register("admin2", "admin2@example.com", "password2", "ADMIN");
    await register("user1", "user1@example.com", "password3", "USER");

    const usersBefore = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersBefore.length).toBe(3);

    deleteAllUserData();

    const usersAfter = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersAfter.length).toBe(2);
    expect(usersAfter.every((u: any) => u.role === "ADMIN")).toBe(true);
    expect(usersAfter.some((u: any) => u.username === "admin1")).toBe(true);
    expect(usersAfter.some((u: any) => u.username === "admin2")).toBe(true);
  });

  it("should handle case when no admin accounts exist", async () => {
    await register("user1", "user1@example.com", "password1", "USER");
    await register("user2", "user2@example.com", "password2", "USER");

    const usersBefore = JSON.parse(localStorage.getItem("jira-clone-users") || "[]");
    expect(usersBefore.length).toBe(2);
    expect(usersBefore.every((u: any) => u.role === "USER")).toBe(true);

    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(result.message).toBe("All user data has been successfully deleted.");
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should handle null users data", async () => {
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));
    localStorage.removeItem("jira-clone-users");

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should handle invalid JSON users data", async () => {
    localStorage.setItem("jira-clone-users", "invalid json data");
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should handle non-array users data", async () => {
    localStorage.setItem("jira-clone-users", JSON.stringify({ id: "1", name: "not an array" }));
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should handle users with missing role field", async () => {
    localStorage.setItem(
      "jira-clone-users",
      JSON.stringify([
        { id: "1", username: "admin", email: "admin@example.com", passwordHash: "hash" },
        { id: "2", username: "user", email: "user@example.com", role: "USER", passwordHash: "hash" },
      ])
    );
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should be case-sensitive for ADMIN role", async () => {
    localStorage.setItem(
      "jira-clone-users",
      JSON.stringify([
        { id: "1", username: "admin", email: "admin@example.com", role: "admin", passwordHash: "hash" },
      ])
    );
    localStorage.setItem("jira-clone-tasks", JSON.stringify([{ id: "task-1" }]));

    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(localStorage.getItem("jira-clone-tasks")).toBeNull();
    expect(localStorage.getItem("jira-clone-users")).toBeNull();
  });

  it("should allow re-creating admin after deletion when no admins existed", async () => {
    await register("user", "user@example.com", "password1", "USER");

    deleteAllUserData();

    expect(localStorage.getItem("jira-clone-users")).toBeNull();

    await register("new-admin", "new-admin@example.com", "newpassword123", "ADMIN");
    await login("new-admin@example.com", "newpassword123");

    const authState = getAuthState();
    expect(authState.isAuthenticated).toBe(true);
    expect(authState.user?.username).toBe("new-admin");
    expect(authState.user?.role).toBe("ADMIN");
  });

  it("should return error when localStorage throws exception", async () => {
    const originalRemoveItem = localStorage.removeItem.bind(localStorage);
    (localStorage as any).removeItem = jest.fn().mockImplementation(() => {
      throw new Error("Storage quota exceeded");
    });

    const result = deleteAllUserData();

    expect(result.success).toBe(false);
    expect(result.message).toBe("Failed to delete some data. Please try again.");

    (localStorage as any).removeItem = originalRemoveItem;
  });

  it("should handle empty localStorage gracefully", async () => {
    const result = deleteAllUserData();

    expect(result.success).toBe(true);
    expect(result.message).toBe("All user data has been successfully deleted.");
  });
});