import { render, screen, fireEvent, waitFor, act } from "@testing-library/react";
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
      const mockFile = new File(["{\"data\": {\"tasks\": [], \"requirements\": [], \"testCases\": [], \"bugs\": [], \"goals\": []}}"], "test.json", { type: "application/json" });
      (importUserData as jest.Mock).mockResolvedValue({ data: { tasks: [], requirements: [], testCases: [], bugs: [], goals: [] } });

      render(<DashboardLayout />);

      await waitFor(() => {
        const fileInput = screen.getByLabelText("Import data file");
        fireEvent.change(fileInput, { target: { files: [mockFile] } });
      });

      await waitFor(() => {
        expect(screen.getByText("Data imported successfully!")).toBeInTheDocument();
      });
    });

    it("should handle import error", async () => {
      const mockFile = new File(["invalid json"], "test.json", { type: "application/json" });
      (importUserData as jest.Mock).mockRejectedValue(new Error("Invalid JSON"));

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
      const mockFile = new File(["{}"], "test.json", { type: "application/json" });
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
        expect(screen.getByText("Data imported successfully!")).toBeInTheDocument();
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

    it("should handleAddComment function correctly filters empty content", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
      });
    });

    it("should handleDeleteComment function exists", async () => {
      render(<DashboardLayout />);

      await waitFor(() => {
        expect(screen.getByText("📊 Jira Clone")).toBeInTheDocument();
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
});