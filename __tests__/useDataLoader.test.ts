import { renderHook, act } from "@testing-library/react";
import { decryptData } from "../lib/encryption";
import { useDataLoader } from "../app/dashboard/hooks/useDataLoader";
import { STORAGE_KEYS } from "../app/dashboard/constants";


jest.mock("../lib/encryption", () => ({
  decryptData: jest.fn(),
}));

const mockDecryptData = decryptData as jest.MockedFunction<typeof decryptData>;

describe("useDataLoader", () => {
  const mockSetTasks = jest.fn();
  const mockSetRequirements = jest.fn();
  const mockSetTestCases = jest.fn();
  const mockSetBugs = jest.fn();
  const mockSetGoals = jest.fn();
  const mockSetMilestones = jest.fn();
  const mockSetKeyResults = jest.fn();
  const mockSetTagHistory = jest.fn();
  const mockSetComments = jest.fn();
  const mockSetAuditLogs = jest.fn();
  const mockSetIsInitialized = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();

    const store: Record<string, string> = {};
    const localStorageMock = {
      getItem: jest.fn((key: string) => store[key] || null),
      setItem: jest.fn((key: string, value: string) => {
        store[key] = value.toString();
      }),
      removeItem: jest.fn((key: string) => {
        delete store[key];
      }),
      clear: jest.fn(() => {
        Object.keys(store).forEach((key) => delete store[key]);
      }),
    };

    Object.defineProperty(window, "localStorage", {
      value: localStorageMock,
      writable: true,
    });

    global.console.log = jest.fn();
  });

  const renderDataLoaderHook = () => {
    return renderHook(() =>
      useDataLoader(
        mockSetTasks,
        mockSetRequirements,
        mockSetTestCases,
        mockSetBugs,
        mockSetGoals,
        mockSetMilestones,
        mockSetKeyResults,
        mockSetTagHistory,
        mockSetComments,
        mockSetAuditLogs,
        mockSetIsInitialized
      )
    );
  };

  describe("initialization without localStorage data", () => {
    it("should load default data when localStorage is empty", async () => {
      mockDecryptData.mockResolvedValue(null);

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTasks).toHaveBeenCalled();
      expect(mockSetRequirements).toHaveBeenCalled();
      expect(mockSetTestCases).toHaveBeenCalled();
      expect(mockSetBugs).toHaveBeenCalled();
      expect(mockSetGoals).toHaveBeenCalled();
      expect(mockSetMilestones).toHaveBeenCalled();
      expect(mockSetKeyResults).toHaveBeenCalled();
      expect(mockSetTagHistory).toHaveBeenCalled();
      expect(mockSetComments).toHaveBeenCalled();
      expect(mockSetAuditLogs).toHaveBeenCalled();
      expect(mockSetIsInitialized).toHaveBeenCalledWith(true);
    });
  });

  describe("tasks loading", () => {
    it("should load tasks from decrypted localStorage data", async () => {
      const mockTasks = [
        { id: "t1", title: "Test Task", status: "TODO", priority: "MEDIUM" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockTasks);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return "encrypted-tasks";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-tasks");
      expect(mockSetTasks).toHaveBeenCalled();
    });

    it("should fall back to JSON parsing when decryption fails", async () => {
      const mockTasks = [{ id: "t1", title: "Test Task" } as any];
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return JSON.stringify(mockTasks);
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTasks).toHaveBeenCalled();
    });

    it("should use empty array when JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTasks).toHaveBeenCalled();
    });

    it("should merge existing tasks with default tasks", async () => {
      const existingTasks = [{ id: "t1", title: "Existing Task" } as any];
      mockDecryptData.mockResolvedValue(existingTasks);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return "encrypted-tasks";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      const setTasksCall = mockSetTasks.mock.calls[0][0];
      const mergedIds = new Set(setTasksCall.map((t: any) => t.id));

      expect(mergedIds.has("t1")).toBe(true);
      expect(setTasksCall.length).toBeGreaterThan(1);
    });
  });

  describe("requirements loading", () => {
    it("should load requirements from decrypted localStorage data", async () => {
      const mockRequirements = [
        { id: "r1", title: "Test Requirement", priority: "HIGH", status: "DRAFT" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockRequirements);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.REQUIREMENTS) return "encrypted-requirements";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-requirements");
      expect(mockSetRequirements).toHaveBeenCalled();
    });

    it("should add source field to existing requirements from defaults", async () => {
      const existingRequirements = [
        { id: "r1", title: "Existing Requirement", source: undefined } as any,
      ];
      mockDecryptData.mockResolvedValue(existingRequirements);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.REQUIREMENTS) return "encrypted-requirements";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      const setRequirementsCall = mockSetRequirements.mock.calls[0][0];
      const existingReq = setRequirementsCall.find((r: any) => r.id === "r1");
      expect(existingReq).toBeDefined();
    });
  });

  describe("test cases loading", () => {
    it("should load test cases from decrypted localStorage data", async () => {
      const mockTestCases = [
        { id: "tc1", title: "Test Case", status: "PENDING" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockTestCases);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TEST_CASES) return "encrypted-test-cases";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-test-cases");
      expect(mockSetTestCases).toHaveBeenCalled();
    });
  });

  describe("bugs loading", () => {
    it("should load bugs from decrypted localStorage data", async () => {
      const mockBugs = [
        { id: "b1", title: "Test Bug", status: "REPORTED", severity: "MEDIUM" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockBugs);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.BUGS) return "encrypted-bugs";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-bugs");
      expect(mockSetBugs).toHaveBeenCalled();
    });
  });

  describe("goals loading", () => {
    it("should load goals from decrypted localStorage data", async () => {
      const mockGoals = [
        { id: "g1", title: "Test Goal", status: "IN_PROGRESS" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockGoals);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.GOALS) return "encrypted-goals";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-goals");
      expect(mockSetGoals).toHaveBeenCalled();
    });
  });

  describe("milestones loading", () => {
    it("should load milestones from decrypted localStorage data", async () => {
      const mockMilestones = [{ id: "m1", title: "Test Milestone", completed: false } as any];
      mockDecryptData.mockResolvedValue(mockMilestones);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.MILESTONES) return "encrypted-milestones";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-milestones");
      expect(mockSetMilestones).toHaveBeenCalled();
    });
  });

  describe("key results loading", () => {
    it("should load key results from decrypted localStorage data", async () => {
      const mockKeyResults = [
        { id: "kr1", title: "Test Key Result", currentValue: 50, targetValue: 100 } as any,
      ];
      mockDecryptData.mockResolvedValue(mockKeyResults);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.KEY_RESULTS) return "encrypted-key-results";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-key-results");
      expect(mockSetKeyResults).toHaveBeenCalled();
    });
  });

  describe("tag history loading", () => {
    it("should load tag history from decrypted localStorage data", async () => {
      const mockTagHistory = ["tag1", "tag2", "tag3"];
      mockDecryptData.mockResolvedValue(mockTagHistory);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TAG_HISTORY) return "encrypted-tag-history";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-tag-history");
      expect(mockSetTagHistory).toHaveBeenCalledWith(mockTagHistory);
    });

    it("should use default tags when localStorage is empty", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockReturnValue(null);

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTagHistory).toHaveBeenCalled();
      const defaultTags = mockSetTagHistory.mock.calls[0][0];
      expect(Array.isArray(defaultTags)).toBe(true);
      expect(defaultTags.length).toBeGreaterThan(0);
    });
  });

  describe("comments loading", () => {
    it("should load comments from decrypted localStorage data", async () => {
      const mockComments = [
        { id: "c1", taskId: "t1", author: "Test User", content: "Test Comment" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockComments);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.COMMENTS) return "encrypted-comments";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-comments");
      expect(mockSetComments).toHaveBeenCalled();
    });
  });

  describe("audit logs loading", () => {
    it("should load audit logs from decrypted localStorage data", async () => {
      const mockAuditLogs = [
        { id: "al1", action: "CREATE", target: "TASK", targetId: "t1" } as any,
      ];
      mockDecryptData.mockResolvedValue(mockAuditLogs);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.AUDIT_LOGS) return "encrypted-audit-logs";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockDecryptData).toHaveBeenCalledWith("encrypted-audit-logs");
      expect(mockSetAuditLogs).toHaveBeenCalled();
    });

    it("should limit audit logs to MAX_AUDIT_LOG_ENTRIES", async () => {
      const mockAuditLogs = Array.from({ length: 1500 }, (_, i) => ({
        id: `al${i}`,
        action: "CREATE",
        target: "TASK",
      })) as any;
      mockDecryptData.mockResolvedValue(mockAuditLogs);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.AUDIT_LOGS) return "encrypted-audit-logs";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      const setAuditLogsCall = mockSetAuditLogs.mock.calls[0][0];
      expect(setAuditLogsCall.length).toBeLessThanOrEqual(1000);
    });
  });



  describe("JSON parsing fallback for all data types", () => {
    it("should use empty array when requirements JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.REQUIREMENTS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetRequirements).toHaveBeenCalled();
    });

    it("should use empty array when test cases JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TEST_CASES) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTestCases).toHaveBeenCalled();
    });

    it("should use default tags when tag history JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TAG_HISTORY) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetTagHistory).toHaveBeenCalled();
      const defaultTags = mockSetTagHistory.mock.calls[0][0];
      expect(Array.isArray(defaultTags)).toBe(true);
      expect(defaultTags.length).toBeGreaterThan(0);
    });

    it("should use default comments when comments JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.COMMENTS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetComments).toHaveBeenCalled();
    });

    it("should use empty array when bugs JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.BUGS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetBugs).toHaveBeenCalled();
    });

    it("should use empty array when goals JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.GOALS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetGoals).toHaveBeenCalled();
    });

    it("should use empty array when milestones JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.MILESTONES) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetMilestones).toHaveBeenCalled();
    });

    it("should use empty array when key results JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.KEY_RESULTS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetKeyResults).toHaveBeenCalled();
    });

    it("should use default audit logs when audit logs JSON parsing fails", async () => {
      mockDecryptData.mockResolvedValue(null);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.AUDIT_LOGS) return "invalid-json";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(mockSetAuditLogs).toHaveBeenCalled();
    });
  });

  describe("logging", () => {
    it("should log data loading completion message", async () => {
      mockDecryptData.mockResolvedValue(null);

      await act(async () => {
        renderDataLoaderHook();
      });

      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[useDataLoader] 已从"),
      );
    });
  });

  describe("data merging strategy", () => {
    it("should preserve existing data and add new default data", async () => {
      const existingTasks = [{ id: "custom-task", title: "Custom Task" } as any];
      mockDecryptData.mockImplementation(async (data: string) => {
        if (data.includes("tasks")) return existingTasks;
        return null;
      });

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return "encrypted-tasks";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      const setTasksCall = mockSetTasks.mock.calls[0][0];
      expect(setTasksCall.find((t: any) => t.id === "custom-task")).toBeDefined();
      expect(setTasksCall.find((t: any) => t.id === "t1")).toBeDefined();
    });

    it("should not overwrite existing data with default data", async () => {
      const existingTask = {
        id: "t1",
        title: "Modified Title",
        status: "IN_PROGRESS",
      } as any;
      mockDecryptData.mockResolvedValue([existingTask]);

      (localStorage.getItem as jest.Mock).mockImplementation((key: string) => {
        if (key === STORAGE_KEYS.TASKS) return "encrypted-tasks";
        return null;
      });

      await act(async () => {
        renderDataLoaderHook();
      });

      const setTasksCall = mockSetTasks.mock.calls[0][0];
      const task = setTasksCall.find((t: any) => t.id === "t1");
      expect(task.title).toBe("Modified Title");
      expect(task.status).toBe("IN_PROGRESS");
    });
  });
});
