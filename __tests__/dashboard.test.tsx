import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Dashboard from "../app/dashboard/page";
import { register, login } from "../lib/auth";

beforeEach(() => {
  jest.clearAllMocks();

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

  const mockDecryptResult = new Uint8Array(
    JSON.stringify({ id: "1", title: "Test" })
      .split("")
      .map((c) => c.charCodeAt(0))
  );
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
    decrypt: jest.fn().mockResolvedValue(mockDecryptResult),
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
});

const setupAuthenticatedUser = async () => {
  await register("testuser", "test@example.com", "password123", "ADMIN");
  await login("test@example.com", "password123");
};

describe("Dashboard Component", () => {
  describe("Authentication", () => {
    it("should show login form when not authenticated", async () => {
      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      });
    });

    it("should allow user to login", async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Jira Clone")).toBeInTheDocument();
      });
    });

    it("should show user role indicator after login", async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("🔒 Admin")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management", () => {
    it('should render the dashboard with title "Jira Clone"', async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        expect(screen.getByText("Jira Clone")).toBeInTheDocument();
      });
    });

    it('should open modal when clicking "New Task" button', async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter title")).toBeInTheDocument();
      });
    });

    it("should create a new task with title and description", async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Task" },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter description"), {
          target: { value: "Test Description" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });
    });
  });

  describe("Tag Functionality", () => {
    it("should allow adding custom tags", async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        const tagInput = screen.getByPlaceholderText("Add a tag...");
        fireEvent.change(tagInput, { target: { value: "frontend" } });
        fireEvent.keyDown(tagInput, { key: "Enter", code: "Enter" });
      });

      await waitFor(() => {
        const tags = screen.getAllByText("#frontend");
        expect(tags.length).toBeGreaterThan(0);
      });
    });
  });

  describe("Local Storage", () => {
    it("should save tasks to localStorage when tasks change", async () => {
      await setupAuthenticatedUser();

      render(<Dashboard />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "LocalStorage Test Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const savedData = window.localStorage.getItem("jira-clone-tasks");
        expect(savedData).not.toBeNull();
      });
    });
  });

  describe("Compliance Features", () => {
    describe("Privacy Policy Consent", () => {
      it("should show privacy policy modal on first visit", async () => {
        await setupAuthenticatedUser();

        render(<Dashboard />);

        await waitFor(() => {
          expect(screen.getByText("Privacy Policy")).toBeInTheDocument();
        });
      });

      it("should hide privacy modal after user accepts", async () => {
        await setupAuthenticatedUser();

        render(<Dashboard />);

        await waitFor(() => {
          fireEvent.click(screen.getByText("I Accept"));
        });

        await waitFor(() => {
          expect(screen.queryByText("Privacy Policy")).not.toBeInTheDocument();
        });
      });

      it("should store consent in localStorage", async () => {
        await setupAuthenticatedUser();

        render(<Dashboard />);

        await waitFor(() => {
          fireEvent.click(screen.getByText("I Accept"));
        });

        const consent = localStorage.getItem("jira-clone-privacy-consent");
        expect(consent).toBe("true");
      });
    });

    describe("Semantic HTML", () => {
      it("should use semantic HTML elements", async () => {
        await setupAuthenticatedUser();

        render(<Dashboard />);

        await waitFor(() => {
          const header = document.querySelector("header");
          const main = document.querySelector("main");

          expect(header).toBeInTheDocument();
          expect(main).toBeInTheDocument();
        });
      });
    });

    describe("ARIA Labels", () => {
      it("should have proper ARIA attributes on modal", async () => {
        await setupAuthenticatedUser();

        render(<Dashboard />);

        await waitFor(() => {
          const dialog = document.querySelector('[role="dialog"]');
          expect(dialog).toBeInTheDocument();
          expect(dialog).toHaveAttribute("aria-modal", "true");
        });
      });
    });
  });

  describe("Data Integrity Validation (r10 ISO/IEC 25010)", () => {
    // Import the validation module dynamically to avoid crypto issues in test setup
    let validateDataIntegrity: typeof import("../lib/validation").validateDataIntegrity;

    beforeAll(async () => {
      const mod = await import("../lib/validation");
      validateDataIntegrity = mod.validateDataIntegrity;
    });

    it("should return isValid=true when all data is valid", () => {
      const validTasks = [
        {
          id: "t1",
          title: "Valid Task",
          description: "A valid task",
          status: "TODO",
          priority: "HIGH",
          dueDate: "2026-06-01",
          tags: ["frontend"],
          assignee: "Tester",
          comments: [],
          createdAt: "2026-06-01",
        },
      ];

      const result = validateDataIntegrity(validTasks, "Task");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.totalCount).toBe(1);
      expect(result.validCount).toBe(1);
    });

    it("should return errors when some data is corrupt", () => {
      const mixedTasks = [
        {
          id: "t1",
          title: "Valid Task",
          description: "A valid task",
          status: "TODO",
          priority: "HIGH",
          dueDate: "2026-06-01",
          tags: ["frontend"],
          assignee: "Tester",
          comments: [],
          createdAt: "2026-06-01",
        },
        {
          id: "",
          title: "",
          status: "INVALID_STATUS",
          priority: "INVALID",
          tags: "not-an-array",
        },
      ];

      const result = validateDataIntegrity(mixedTasks, "Task");
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it("should return isValid=true for empty data array", () => {
      const result = validateDataIntegrity([], "Task");
      expect(result.isValid).toBe(true);
      expect(result.errors.length).toBe(0);
      expect(result.totalCount).toBe(0);
      expect(result.validCount).toBe(0);
    });

    it("should return errors when required fields are missing", () => {
      const missingIdTasks = [
        {
          title: "No ID Task",
          status: "TODO",
          priority: "MEDIUM",
          createdAt: "2026-06-01",
        },
      ];

      const result = validateDataIntegrity(missingIdTasks, "Task");
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "id")).toBe(true);
    });

    it("should detect duplicate IDs", () => {
      const duplicateTasks = [
        {
          id: "t1",
          title: "Task One",
          status: "TODO",
          priority: "HIGH",
          tags: [],
          assignee: "A",
          comments: [],
          createdAt: "2026-06-01",
          dueDate: "2026-06-01",
          description: "First",
        },
        {
          id: "t1",
          title: "Task Two",
          status: "IN_PROGRESS",
          priority: "MEDIUM",
          tags: [],
          assignee: "B",
          comments: [],
          createdAt: "2026-06-01",
          dueDate: "2026-06-01",
          description: "Second",
        },
      ];

      const result = validateDataIntegrity(duplicateTasks, "Task");
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "id" && e.message.includes("Duplicate"))).toBe(true);
    });

    it("should validate Bug data with correct severity and priority", () => {
      const validBug = [
        {
          id: "b1",
          title: "Test Bug",
          description: "A test bug",
          stepsToReproduce: ["Step 1"],
          expectedBehavior: "Expected",
          actualBehavior: "Actual",
          severity: "CRITICAL",
          priority: "URGENT",
          status: "REPORTED",
          reporter: "Tester",
          comments: [],
          createdAt: "2026-06-01T10:00:00Z",
          updatedAt: "2026-06-01T10:00:00Z",
        },
      ];

      const result = validateDataIntegrity(validBug, "Bug");
      expect(result.isValid).toBe(true);
    });

    it("should detect invalid enum values in Bug", () => {
      const invalidBug = [
        {
          id: "b1",
          title: "Bad Bug",
          description: "Bug with invalid values",
          stepsToReproduce: ["Step 1"],
          expectedBehavior: "Expected",
          actualBehavior: "Actual",
          severity: "SUPER_BAD",
          priority: "WHENEVER",
          status: "UNKNOWN",
          reporter: "Tester",
          comments: [],
          createdAt: "2026-06-01T10:00:00Z",
          updatedAt: "2026-06-01T10:00:00Z",
        },
      ];

      const result = validateDataIntegrity(invalidBug, "Bug");
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.field === "severity")).toBe(true);
      expect(result.errors.some((e) => e.field === "priority")).toBe(true);
      expect(result.errors.some((e) => e.field === "status")).toBe(true);
    });
  });
});
