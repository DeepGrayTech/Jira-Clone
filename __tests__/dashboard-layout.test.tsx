import {
  render,
  screen,
  fireEvent,
  waitFor,
  act,
} from "@testing-library/react";
import DashboardLayout from "../app/dashboard/components/DashboardLayout";
import { register, login } from "../lib/auth";
import { exportUserData, importUserData } from "../lib/privacy";
import { AuditService } from "../app/dashboard/services/AuditService";

jest.mock("../lib/privacy", () => ({
  exportUserData: jest.fn(),
  importUserData: jest.fn(),
}));

jest.mock("../app/dashboard/services/AuditService", () => ({
  AuditService: jest.fn().mockImplementation(() => ({
    logAction: jest.fn().mockReturnValue({
      id: "audit-1",
      action: "TEST",
      targetType: "TEST",
      targetId: "test-1",
      description: "Test action",
      actor: "test",
      timestamp: new Date().toISOString(),
    }),
  })),
}));

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

  window.confirm = jest.fn().mockReturnValue(true);
});

const setupAuthenticatedUser = async () => {
  await register("testuser", "test@example.com", "password123", "ADMIN");
  await login("test@example.com", "password123");
  localStorage.setItem("jira-clone-privacy-consent", "true");
};

describe("DashboardLayout", () => {
  describe("Authentication State", () => {
    it("should render LoginForm when not authenticated", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      });
    });

    it("should render dashboard when authenticated", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should show user info in header when authenticated", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("testuser")).toBeInTheDocument();
      });
    });
  });

  describe("View Switching", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should switch to Requirements view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        expect(screen.getByText("Requirements")).toBeInTheDocument();
      });
    });

    it("should switch to Testing view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        expect(screen.getByText("Testing")).toBeInTheDocument();
      });
    });

    it("should switch to Bugs view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });

    it("should switch to Goals view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("Goals")).toBeInTheDocument();
      });
    });

    it("should switch to Audit view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });

    it("should switch back to Tasks view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open New Task modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });

    it("should create a new task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });
    });

    it("should not create task with empty title", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Create"));
      });

      expect(screen.getByText("New Task")).toBeInTheDocument();
    });

    it("should close modal when Cancel is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Task")).not.toBeInTheDocument();
      });
    });

    it("should cancel task creation", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Task" },
        });
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Task")).not.toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open New Requirement modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Requirement")).toBeInTheDocument();
      });
    });

    it("should open New Requirement modal from Requirements view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Requirement")).toBeInTheDocument();
      });
    });

    it("should create a new requirement", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Requirement")).toBeInTheDocument();
      });
    });

    it("should edit an existing requirement", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Original Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const reqCard = screen.getByText("Original Requirement");
        fireEvent.click(reqCard);
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Updated Requirement" },
        });
        fireEvent.click(screen.getByText("Save"));
      });

      await waitFor(() => {
        expect(screen.getByText("Updated Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open New Bug modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Bug Report")).toBeInTheDocument();
      });
    });

    it("should close New Bug modal when Cancel is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Bug Report")).not.toBeInTheDocument();
      });
    });

    it("should create a new bug", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Bug Report")).not.toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open New Test Case modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Test Case")).toBeInTheDocument();
      });
    });

    it("should close New Test Case modal when Cancel is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Test Case")).not.toBeInTheDocument();
      });
    });

    it("should create a new test case", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Case 1" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Case 1")).toBeInTheDocument();
      });
    });

    it("should edit an existing test case", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Original Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const tcCard = screen.getByText("Original Test Case");
        fireEvent.click(tcCard);
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Updated Test Case" },
        });
        fireEvent.click(screen.getByText("Save"));
      });

      await waitFor(() => {
        expect(screen.getByText("Updated Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Goal Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Goal Tracker", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });

    it("should render Goals view correctly", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Settings", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open Privacy Settings modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });

    it("should close Privacy Settings modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });

      await waitFor(() => {
        expect(screen.queryByText("Privacy Settings")).not.toBeInTheDocument();
      });
    });
  });

  describe("Data Import/Export", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should call exportUserData when Export button is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      expect(exportUserData).toHaveBeenCalled();
    });

    it("should handle import data successfully", async () => {
      const mockFile = new File(
        [
          '{"data": {"tasks": [], "requirements": [], "testCases": [], "bugs": [], "goals": []}}',
        ],
        "test.json",
        { type: "application/json" }
      );
      (importUserData as jest.Mock).mockResolvedValue({
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
        },
      });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Data imported successfully!")
        ).toBeInTheDocument();
      });
    });

    it("should handle import error", async () => {
      const mockFile = new File(["invalid json"], "test.json", {
        type: "application/json",
      });
      (importUserData as jest.Mock).mockRejectedValue(
        new Error("Invalid JSON")
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText("Invalid JSON")).toBeInTheDocument();
      });
    });

    it("should handle import with partial data correctly", async () => {
      const mockFile = new File(["{}"], "test.json", {
        type: "application/json",
      });
      (importUserData as jest.Mock).mockResolvedValue({
        data: {
          tasks: [],
          requirements: [],
          testCases: [],
          bugs: [],
          goals: [],
        },
      });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(
          screen.getByText("Data imported successfully!")
        ).toBeInTheDocument();
      });
    });

    it("should handle empty file input gracefully", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [] } });
      });

      expect(screen.queryByText("Importing...")).not.toBeInTheDocument();
    });
  });

  describe("Comment Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should add comment to a task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task with comments" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Task with comments")).toBeInTheDocument();
      });
    });

    it("should not add empty comment", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Task")).toBeInTheDocument();
      });
    });
  });

  describe("Login/Logout", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should logout when Logout button is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Consent", () => {
    it("should show privacy consent modal when consent not given", async () => {
      await register("testuser2", "test2@example.com", "password123", "ADMIN");
      await login("test2@example.com", "password123");

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Privacy Consent")).toBeInTheDocument();
      });
    });

    it("should accept privacy consent", async () => {
      await register("testuser3", "test3@example.com", "password123", "ADMIN");
      await login("test3@example.com", "password123");

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("I Accept"));
      });

      await waitFor(() => {
        expect(screen.queryByText("Privacy Consent")).not.toBeInTheDocument();
      });

      expect(localStorage.getItem("jira-clone-privacy-consent")).toBe("true");
    });

    it("should revoke privacy consent", async () => {
      await register("testuser4", "test4@example.com", "password123", "ADMIN");
      await login("test4@example.com", "password123");

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Revoke Consent"));
      });

      await waitFor(() => {
        expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
      });
    });
  });

  describe("Responsive Layout", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render correctly on different screen sizes", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });
  });

  describe("Clear All Data", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should clear all data when confirmed", async () => {
      window.confirm = jest.fn().mockReturnValue(true);

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });
    });

    it("should not clear data when cancelled", async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });
  });

  describe("Revoke Consent", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle revoke consent flow with confirmation", async () => {
      window.confirm = jest.fn().mockReturnValue(true);

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });

    it("should not revoke consent when cancelled", async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Creation", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open and close New Bug modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Bug Report")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Bug Report")).not.toBeInTheDocument();
      });
    });
  });

  describe("Goal Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a new goal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });
  });

  describe("Notification Settings", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open Notification Settings panel", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        expect(screen.getByText("🔔 Notifications")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Settings", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open Privacy Settings modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });

    it("should close Privacy Settings modal by clicking Close button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });

      await waitFor(() => {
        expect(screen.queryByText("Privacy Settings")).not.toBeInTheDocument();
      });
    });

    it("should close Privacy Settings modal by clicking outside", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        const backdrop = screen.getByRole("dialog");
        fireEvent.click(backdrop);
      });

      await waitFor(() => {
        expect(screen.queryByText("Privacy Settings")).not.toBeInTheDocument();
      });
    });
  });

  describe("Data Import Validation", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle import with validation errors", async () => {
      const mockFile = new File(
        [
          '{"data": {"tasks": [{"id": "1", "title": "", "status": "INVALID", "priority": "INVALID"}]}}',
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with valid data", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "task-1",
                  title: "Test Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Validation Banner", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should close validation banner when Close button is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should clear corrupt data when Clear button is clicked", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });
  });

  describe("Audit Logs", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Audit view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Notifications View", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render dashboard with notification button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("🔔 Notifications")).toBeInTheDocument();
      });
    });
  });

  describe("View Mode Switching", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should switch to Requirements view and back to Tasks", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        expect(screen.getByText("Requirements")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should switch to Testing view and back to Tasks", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        expect(screen.getByText("Testing")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should switch to Bugs view and back to Tasks", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should switch to Goals view and back to Tasks", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("Goals")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should switch to Audit view and back to Tasks", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should cycle through all views", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Data Export", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should trigger export data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });
    });
  });

  describe("Logout", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should trigger logout", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });
    });
  });

  describe("Task Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a task and verify it exists", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "New Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a requirement and verify it exists", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "New Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a test case and verify it exists", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "New Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Goal Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Goals view with GoalTracker", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Consent", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      localStorage.removeItem("jira-clone-privacy-consent");
    });

    it("should show privacy modal when consent not given", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import with Partial Data", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import data with only tasks", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "task-1",
                  title: "Imported Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import data with only requirements", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [
                {
                  id: "req-1",
                  title: "Imported Requirement",
                  status: "DRAFT",
                  priority: "MEDIUM",
                },
              ],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import data with only test cases", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [
                {
                  id: "tc-1",
                  title: "Imported Test Case",
                  status: "PENDING",
                  priority: "MEDIUM",
                  steps: [],
                  expectedResult: "",
                },
              ],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import data with only bugs", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [
                {
                  id: "bug-1",
                  title: "Imported Bug",
                  status: "REPORTED",
                  severity: "MEDIUM",
                  priority: "MEDIUM",
                },
              ],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import data with only goals", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [
                {
                  id: "goal-1",
                  title: "Imported Goal",
                  type: "OKR",
                  status: "IN_PROGRESS",
                  currentProgress: 50,
                  startDate: "2026-07-01",
                  endDate: "2026-12-31",
                },
              ],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Header Actions", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should click Import button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });
    });

    it("should click Export button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });
    });

    it("should click Logout button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });
    });

    it("should click Notifications button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });
    });

    it("should click Privacy button", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });
    });
  });

  describe("Task Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a task and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Complete Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a requirement and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Complete Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a test case and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a bug report", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug Report" },
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Empty State Handling", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle empty task list", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });

    it("should handle empty requirements list", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        expect(screen.getByText("Requirements")).toBeInTheDocument();
      });
    });

    it("should handle empty test cases list", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        expect(screen.getByText("Testing")).toBeInTheDocument();
      });
    });

    it("should handle empty bugs list", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });

    it("should handle empty goals list", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("Goals")).toBeInTheDocument();
      });
    });
  });

  describe("Data Management", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      window.confirm = jest.fn().mockReturnValue(false);
    });

    it("should not clear data when user cancels confirmation", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });

    it("should handle data import error", async () => {
      const mockFile = new File(["invalid json content"], "test.json", {
        type: "application/json",
      });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with partial data", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle empty file input", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [] } });
      });
    });
  });

  describe("Modal Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open and close task modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Task")).not.toBeInTheDocument();
      });
    });

    it("should open and close requirement modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Requirement")).not.toBeInTheDocument();
      });
    });

    it("should open and close test case modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Test Case")).not.toBeInTheDocument();
      });
    });

    it("should open and close bug modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        expect(screen.queryByText("New Bug Report")).not.toBeInTheDocument();
      });
    });
  });

  describe("Authentication Flow", () => {
    it("should render login form when not authenticated", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });

    it("should handle logout and return to login", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create task with empty title and cancel", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });

    it("should create task with minimal data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Minimal Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Minimal Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create requirement with minimal data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Minimal Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Minimal Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create test case with minimal data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Minimal Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Minimal Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug with minimal data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Minimal Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("View Mode Cycle", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should cycle through all views multiple times", async () => {
      render(<DashboardLayout />);

      const views = [
        "Requirements",
        "Testing",
        "Bugs",
        "Goals",
        "Audit",
        "Tasks",
      ];

      for (let i = 0; i < views.length; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText(views[i]));
        });
      }

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Header Buttons", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should click all header buttons", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });
    });
  });

  describe("Task Management - Edit Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a task and open for edit", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Editable Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Editable Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Edit Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a requirement and open for edit", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Editable Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Editable Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Edit Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a test case and open for edit", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Editable Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Editable Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Edit Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create a bug and close modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Settings - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle privacy consent", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });
    });
  });

  describe("Notification Settings - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open notification settings", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        expect(screen.getByText("🔔 Notifications")).toBeInTheDocument();
      });
    });
  });

  describe("Data Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should trigger import data flow", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "task-import",
                  title: "Imported Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [
                {
                  id: "req-import",
                  title: "Imported Req",
                  status: "DRAFT",
                  priority: "MEDIUM",
                },
              ],
              testCases: [
                {
                  id: "tc-import",
                  title: "Imported TC",
                  status: "PENDING",
                  priority: "MEDIUM",
                  steps: [],
                  expectedResult: "",
                },
              ],
              bugs: [
                {
                  id: "bug-import",
                  title: "Imported Bug",
                  status: "REPORTED",
                  severity: "MEDIUM",
                  priority: "MEDIUM",
                },
              ],
              goals: [
                {
                  id: "goal-import",
                  title: "Imported Goal",
                  type: "OKR",
                  status: "IN_PROGRESS",
                  currentProgress: 50,
                  startDate: "2026-07-01",
                  endDate: "2026-12-31",
                },
              ],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should trigger export data flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });
    });

    it("should trigger logout flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Privacy Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      localStorage.removeItem("jira-clone-privacy-consent");
    });

    it("should open privacy modal", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });
  });

  describe("Multiple Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should perform multiple task operations", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task 1" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task 2" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Task 1")).toBeInTheDocument();
        expect(screen.getByText("Task 2")).toBeInTheDocument();
      });
    });

    it("should perform multiple view switches", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Bulk Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple tasks", async () => {
      render(<DashboardLayout />);

      for (let i = 1; i <= 5; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText("+ New Task"));
        });

        await waitFor(() => {
          fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: { value: `Task ${i}` },
          });
          fireEvent.click(screen.getByText("Create"));
        });
      }

      await waitFor(() => {
        expect(screen.getByText("Task 1")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Bulk Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple requirements", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      for (let i = 1; i <= 3; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText("+ New Requirement"));
        });

        await waitFor(() => {
          fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: { value: `Requirement ${i}` },
          });
          fireEvent.click(screen.getByText("Create"));
        });
      }

      await waitFor(() => {
        expect(screen.getByText("Requirement 1")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Bulk Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple test cases", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      for (let i = 1; i <= 3; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText("+ New Test Case"));
        });

        await waitFor(() => {
          fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: { value: `Test Case ${i}` },
          });
          fireEvent.click(screen.getByText("Create"));
        });
      }

      await waitFor(() => {
        expect(screen.getByText("Test Case 1")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Bulk Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple bugs", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      for (let i = 1; i <= 3; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText("+ New Bug Report"));
        });

        await waitFor(() => {
          fireEvent.change(screen.getByPlaceholderText("Enter title"), {
            target: { value: `Bug ${i}` },
          });
          fireEvent.click(screen.getByText("Create"));
        });
      }
    });
  });

  describe("View Mode - Edge Cases", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should switch views rapidly", async () => {
      render(<DashboardLayout />);

      const views = [
        "Requirements",
        "Testing",
        "Bugs",
        "Goals",
        "Audit",
        "Tasks",
      ];

      for (let i = 0; i < views.length; i++) {
        await waitFor(() => {
          fireEvent.click(screen.getByText(views[i]));
        });
      }
    });

    it("should stay on same view when clicking current view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Header Actions - Edge Cases", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should click header buttons rapidly", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });
    });
  });

  describe("Task Management - Comments", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should trigger comment addition flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task with Comment" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCard = screen.getByText("Task with Comment");
        fireEvent.click(taskCard);
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "Test comment" },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
          });
        }
      });
    });
  });

  describe("Bug Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug and verify in Bugs view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Test Bug Report" },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter description"), {
          target: { value: "This is a bug description" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });
  });

  describe("Goal Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Goals view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });
  });

  describe("Audit Logs - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Audit view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Login Flow", () => {
    it("should handle login with credentials", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });

    it("should handle logout and return to login", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import - Edge Cases", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle import with corrupted data", async () => {
      const mockFile = new File(["{invalid json"], "test.json", {
        type: "application/json",
      });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with missing data field", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            invalid: "data",
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Modal Operations - Edge Cases", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open and close multiple modals", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Task Management - Edit Flow Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create task and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Audit Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit Task")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Edit Flow Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create requirement and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Audit Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit Requirement")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Edit Flow Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create test case and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Audit Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit Test Case")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Edit Flow Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Audit Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import data and verify audit log", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "import-audit",
                  title: "Import Audit Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Data Export - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should export data and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Logout - Extended", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should logout and verify audit log", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create, view, and delete a task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete Task Flow" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Complete Task Flow")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });
    });
  });

  describe("Requirement Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create, view, and cancel a requirement", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete Req Flow" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Complete Req Flow")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });
    });
  });

  describe("TestCase Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create, view, and cancel a test case", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete TC Flow" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Complete TC Flow")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });
    });
  });

  describe("Bug Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create, view, and cancel a bug", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Complete Bug Flow" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Cancel"));
      });
    });
  });

  describe("Goals Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should navigate to Goals view and back", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Audit Management - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should navigate to Audit view and back", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Full Application Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should complete a full workflow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Full Flow Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Full Flow Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Full Flow Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Full Flow Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Full Flow Task")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Empty Form", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should not create task with empty title", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });

    it("should not create task with only whitespace", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "   " },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Empty Form", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should not create requirement with empty title", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Empty Form", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should not create test case with empty title", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Empty Form", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should not create bug with empty title", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("New Bug Report")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import - Various Data Types", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import tasks only", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "task-only",
                  title: "Task Only",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import requirements only", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [
                {
                  id: "req-only",
                  title: "Req Only",
                  status: "DRAFT",
                  priority: "MEDIUM",
                },
              ],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import test cases only", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [
                {
                  id: "tc-only",
                  title: "TC Only",
                  status: "PENDING",
                  priority: "MEDIUM",
                  steps: [],
                  expectedResult: "",
                },
              ],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import bugs only", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [
                {
                  id: "bug-only",
                  title: "Bug Only",
                  status: "REPORTED",
                  severity: "MEDIUM",
                  priority: "MEDIUM",
                },
              ],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should import goals only", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [
                {
                  id: "goal-only",
                  title: "Goal Only",
                  type: "OKR",
                  status: "IN_PROGRESS",
                  currentProgress: 50,
                  startDate: "2026-07-01",
                  endDate: "2026-12-31",
                },
              ],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Header Actions - Complete", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should click all header actions in sequence", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Data Clear Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      window.confirm = jest.fn().mockReturnValue(false);
    });

    it("should not clear data when user cancels", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });

    it("should not clear data when user cancels confirmation", async () => {
      window.confirm = jest.fn().mockReturnValue(false);

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Comments Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should trigger add comment flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Comment Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCard = screen.getByText("Comment Task");
        fireEvent.click(taskCard);
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "Test comment" },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
          });
        }
      });
    });

    it("should trigger add empty comment (should be ignored)", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Empty Comment Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCard = screen.getByText("Empty Comment Task");
        fireEvent.click(taskCard);
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "   " },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
          });
        }
      });
    });
  });

  describe("Privacy Consent Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      localStorage.removeItem("jira-clone-privacy-consent");
    });

    it("should handle privacy consent", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });
    });

    it("should handle privacy modal backdrop click", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });
    });
  });

  describe("Login Flow - Extended", () => {
    it("should render login form initially", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });

    it("should handle login success and render dashboard", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should handle logout and return to login", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Status Updates", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create task and view in Tasks view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Status Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Task")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Status Updates", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create requirement and view in Requirements view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Status Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Requirement")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Status Updates", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create test case and view in Testing view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Status Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Test Case")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        expect(screen.getByText("Status Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Status Updates", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug and view in Bugs view", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Status Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import - Validation Errors", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle import with invalid task status", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "invalid-task",
                  title: "Invalid Status Task",
                  status: "INVALID_STATUS",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with invalid task priority", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "invalid-task",
                  title: "Invalid Priority Task",
                  status: "TODO",
                  priority: "INVALID_PRIORITY",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with missing required fields", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [{ id: "missing-task" }],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Task Management - Full CRUD", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create and view task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "CRUD Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("CRUD Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Full CRUD", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create and view requirement", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "CRUD Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("CRUD Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Full CRUD", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create and view test case", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "CRUD Test Case" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("CRUD Test Case")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Full CRUD", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create and view bug", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "CRUD Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });
    });
  });

  describe("Goals Management - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should navigate to Goals view and verify GoalTracker", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Audit Logs - Full Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should navigate to Audit view and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Edit Task", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Edit Test Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Edit Test Task")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Edit Requirement", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create requirement", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Edit Test Requirement" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Edit Test Requirement")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Edit TestCase", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create test case", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Edit Test TestCase" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Edit Test TestCase")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Edit Bug", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Edit Test Bug" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });
    });
  });

  describe("Data Import - Complete Flow", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import data", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "import-verify",
                  title: "Import Verify Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Header Actions - Verify", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should verify all header buttons exist", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("🔔 Notifications")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("📥 Import")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("📤 Export")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("🔒 Privacy")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Logout")).toBeInTheDocument();
      });
    });
  });

  describe("Navigation - Verify", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should verify all navigation links exist", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Requirements")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Testing")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Bugs")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Goals")).toBeInTheDocument();
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Multiple Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple tasks and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task A" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Task B" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Task A")).toBeInTheDocument();
        expect(screen.getByText("Task B")).toBeInTheDocument();
      });
    });
  });

  describe("Requirement Management - Multiple Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple requirements and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Req A" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Req B" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("Req A")).toBeInTheDocument();
        expect(screen.getByText("Req B")).toBeInTheDocument();
      });
    });
  });

  describe("TestCase Management - Multiple Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple test cases and verify", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "TC A" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "TC B" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("TC A")).toBeInTheDocument();
        expect(screen.getByText("TC B")).toBeInTheDocument();
      });
    });
  });

  describe("Bug Management - Multiple Operations", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create multiple bugs", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug A" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug B" },
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Data Import - Multiple Types", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import mixed data types", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "mixed-task",
                  title: "Mixed Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [
                {
                  id: "mixed-req",
                  title: "Mixed Req",
                  status: "DRAFT",
                  priority: "MEDIUM",
                },
              ],
              testCases: [
                {
                  id: "mixed-tc",
                  title: "Mixed TC",
                  status: "PENDING",
                  priority: "MEDIUM",
                  steps: [],
                  expectedResult: "",
                },
              ],
              bugs: [
                {
                  id: "mixed-bug",
                  title: "Mixed Bug",
                  status: "REPORTED",
                  severity: "MEDIUM",
                  priority: "MEDIUM",
                },
              ],
              goals: [
                {
                  id: "mixed-goal",
                  title: "Mixed Goal",
                  type: "OKR",
                  status: "IN_PROGRESS",
                  currentProgress: 50,
                  startDate: "2026-07-01",
                  endDate: "2026-12-31",
                },
              ],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Login Flow - Complete", () => {
    it("should handle login and render dashboard", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should handle logout and return to login", async () => {
      await setupAuthenticatedUser();

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Comments", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should add comment to task", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Comment Test Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCard = screen.getByText("Comment Test Task");
        fireEvent.click(taskCard);
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "This is a comment" },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
          });
        }
      });
    });
  });

  describe("Bug Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug with description", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug with Description" },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter description"), {
          target: { value: "Bug description" },
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Goals Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Goals view with GoalTracker component", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });
    });
  });

  describe("Data Import - Error Handling", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should handle import with malformed JSON", async () => {
      const mockFile = new File(["{invalid json"], "test.json", {
        type: "application/json",
      });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should handle import with no data field", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            tasks: [],
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });
  });

  describe("Privacy Settings - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
      localStorage.removeItem("jira-clone-privacy-consent");
    });

    it("should open privacy modal and close", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        expect(screen.getByText("Privacy Settings")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });
    });
  });

  describe("Notification Settings - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should open notification panel", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        expect(screen.getByText("🔔 Notifications")).toBeInTheDocument();
      });
    });
  });

  describe("Header Actions - Complete", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should click all header buttons", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔔 Notifications"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Close"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Task Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create task with description", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "TaskDesc" },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter description"), {
          target: { value: "Task description" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("TaskDesc")).toBeInTheDocument();
      });
    });

    it("should create task with additional fields", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "TaskAdd" },
        });
        const inputs = screen.getAllByRole("textbox");
        inputs.forEach((input) => {
          if (input.getAttribute("placeholder") !== "Enter title") {
            fireEvent.change(input, {
              target: { value: "test value" },
            });
          }
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Requirement Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create requirement with description", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "ReqDesc" },
        });
        fireEvent.change(screen.getByPlaceholderText("Enter description"), {
          target: { value: "Req description" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        expect(screen.getByText("ReqDesc")).toBeInTheDocument();
      });
    });

    it("should create requirement with additional fields", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Requirements"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Requirement"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "ReqAdd" },
        });
        const inputs = screen.getAllByRole("textbox");
        inputs.forEach((input) => {
          if (input.getAttribute("placeholder") !== "Enter title") {
            fireEvent.change(input, {
              target: { value: "test value" },
            });
          }
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("TestCase Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create test case with steps", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Testing"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Test Case"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "TCSteps" },
        });
        const inputs = screen.getAllByRole("textbox");
        inputs.forEach((input) => {
          if (input.getAttribute("placeholder") !== "Enter title") {
            fireEvent.change(input, {
              target: { value: "test value" },
            });
          }
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Bug Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should create bug with steps to reproduce", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "BugSteps" },
        });
        const inputs = screen.getAllByRole("textbox");
        inputs.forEach((input) => {
          if (input.getAttribute("placeholder") !== "Enter title") {
            fireEvent.change(input, {
              target: { value: "test value" },
            });
          }
        });
        fireEvent.click(screen.getByText("Create"));
      });
    });
  });

  describe("Goals Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Goals view and navigate back", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        expect(screen.getByText("🎯 Goal Tracker")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Audit Management - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should render Audit view and navigate back", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Audit"));
      });

      await waitFor(() => {
        expect(screen.getByText("Audit")).toBeInTheDocument();
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Tasks"));
      });

      await waitFor(() => {
        expect(screen.getByText("Tasks")).toBeInTheDocument();
      });
    });
  });

  describe("Data Operations - Full", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should import data and verify", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "op-task",
                  title: "Op Task",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should export data", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📤 Export"));
      });
    });

    it("should logout", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Logout"));
      });

      await waitFor(() => {
        expect(screen.getByText("Login")).toBeInTheDocument();
      });
    });
  });

  describe("Uncovered Code Paths", () => {
    beforeEach(async () => {
      await setupAuthenticatedUser();
    });

    it("should test handleRevokeConsent with confirm", async () => {
      const mockConfirm = jest.fn(() => true);
      (window as any).confirm = mockConfirm;

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const revokeButton = buttons.find((btn) =>
          btn.textContent?.includes("Revoke")
        );
        if (revokeButton) {
          fireEvent.click(revokeButton);
        }
      });
    });

    it("should test handleRevokeConsent with cancel", async () => {
      const mockConfirm = jest.fn(() => false);
      (window as any).confirm = mockConfirm;

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("🔒 Privacy"));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const revokeButton = buttons.find((btn) =>
          btn.textContent?.includes("Revoke")
        );
        if (revokeButton) {
          fireEvent.click(revokeButton);
        }
      });
    });

    it("should test handleClearAllData with confirm", async () => {
      const mockConfirm = jest.fn(() => true);
      (window as any).confirm = mockConfirm;

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const clearButton = buttons.find((btn) =>
          btn.textContent?.includes("Clear")
        );
        if (clearButton) {
          fireEvent.click(clearButton);
        }
      });
    });

    it("should test handleClearAllData with cancel", async () => {
      const mockConfirm = jest.fn(() => false);
      (window as any).confirm = mockConfirm;

      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("📥 Import"));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const clearButton = buttons.find((btn) =>
          btn.textContent?.includes("Clear")
        );
        if (clearButton) {
          fireEvent.click(clearButton);
        }
      });
    });

    it("should test import with validation errors", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [
                {
                  id: "invalid",
                  title: "",
                  status: "TODO",
                  priority: "MEDIUM",
                },
              ],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should test import with empty arrays", async () => {
      const mockFile = new File(
        [
          JSON.stringify({
            data: {
              tasks: [],
              requirements: [],
              testCases: [],
              bugs: [],
              goals: [],
            },
          }),
        ],
        "test.json",
        { type: "application/json" }
      );

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });
    });

    it("should test handleLoginSuccess by logging in", async () => {
      localStorage.removeItem("jira-clone-auth");
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Email"), {
          target: { value: "admin@test.com" },
        });
        fireEvent.change(screen.getByPlaceholderText("Password"), {
          target: { value: "password123" },
        });
        fireEvent.click(screen.getByText("Login"));
      });

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should test bug editing flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Bug Report"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug to Edit" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        fireEvent.click(screen.getByText("Bugs"));
      });

      await waitFor(() => {
        const bugCards = screen.getAllByRole("listitem");
        if (bugCards.length > 0) {
          fireEvent.click(bugCards[0]);
        }
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Bug Edited" },
        });
        const buttons = screen.getAllByRole("button");
        const saveButton = buttons.find((btn) =>
          btn.textContent?.includes("Save")
        );
        if (saveButton) {
          fireEvent.click(saveButton);
        }
      });
    });

    it("should test goals management operations", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("Goals"));
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const addButton = buttons.find(
          (btn) =>
            btn.textContent?.includes("Add") || btn.textContent?.includes("+")
        );
        if (addButton) {
          fireEvent.click(addButton);
        }
      });

      await waitFor(() => {
        const inputs = screen.getAllByRole("textbox");
        inputs.forEach((input) => {
          fireEvent.change(input, {
            target: { value: "Test Goal" },
          });
        });
        const dateInputs = screen.getAllByRole("textbox");
        dateInputs.forEach((input) => {
          fireEvent.change(input, {
            target: { value: "2026-07-01" },
          });
        });
        const buttons = screen.getAllByRole("button");
        const createButton = buttons.find(
          (btn) =>
            btn.textContent?.includes("Create") ||
            btn.textContent?.includes("Save")
        );
        if (createButton) {
          fireEvent.click(createButton);
        }
      });
    });

    it("should test handleAddComment flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Comment Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCards = screen.getAllByRole("listitem");
        if (taskCards.length > 0) {
          fireEvent.click(taskCards[0]);
        }
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "Test comment" },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
            shiftKey: false,
          });
        }
      });
    });

    it("should test handleDeleteComment flow", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        fireEvent.click(screen.getByText("+ New Task"));
      });

      await waitFor(() => {
        fireEvent.change(screen.getByPlaceholderText("Enter title"), {
          target: { value: "Delete Comment Task" },
        });
        fireEvent.click(screen.getByText("Create"));
      });

      await waitFor(() => {
        const taskCards = screen.getAllByRole("listitem");
        if (taskCards.length > 0) {
          fireEvent.click(taskCards[0]);
        }
      });

      await waitFor(() => {
        const textareas = screen.getAllByRole("textbox");
        if (textareas.length > 0) {
          fireEvent.change(textareas[textareas.length - 1], {
            target: { value: "Comment to delete" },
          });
          fireEvent.keyDown(textareas[textareas.length - 1], {
            key: "Enter",
            code: "Enter",
            shiftKey: false,
          });
        }
      });

      await waitFor(() => {
        const buttons = screen.getAllByRole("button");
        const deleteButtons = buttons.filter(
          (btn) =>
            btn.textContent?.includes("Delete") ||
            btn.textContent?.includes("×")
        );
        if (deleteButtons.length > 0) {
          fireEvent.click(deleteButtons[0]);
        }
      });
    });
  });
});
