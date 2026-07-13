import { renderHook, act } from "@testing-library/react";
import { encryptData } from "../lib/encryption";
import { usePersistence } from "../app/dashboard/hooks/usePersistence";
import { STORAGE_KEYS } from "../app/dashboard/constants";

jest.mock("../lib/encryption", () => ({
  encryptData: jest.fn(),
}));

const mockEncryptData = encryptData as jest.MockedFunction<typeof encryptData>;

describe("usePersistence", () => {
  const mockTasks = [
    {
      id: "t1",
      title: "Test Task",
      description: "Test Description",
      status: "TODO",
      priority: "MEDIUM",
      dueDate: "2024-12-31",
      tags: ["test"],
      assignee: "Test User",
      createdAt: "2024-01-01",
      comments: [],
    },
  ];

  const mockRequirements = [
    {
      id: "r1",
      title: "Test Requirement",
      description: "Test Description",
      priority: "HIGH",
      status: "DRAFT",
      acceptanceCriteria: ["Criteria 1"],
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      requester: "Test User",
      executor: "Test User",
    },
  ];

  const mockTestCases = [
    {
      id: "tc1",
      requirementId: "r1",
      title: "Test Case",
      description: "Test Description",
      steps: ["Step 1"],
      expectedResult: "Expected Result",
      status: "PENDING",
    },
  ];

  const mockBugs = [
    {
      id: "b1",
      title: "Test Bug",
      description: "Test Description",
      stepsToReproduce: ["Step 1"],
      expectedBehavior: "Expected",
      actualBehavior: "Actual",
      severity: "MEDIUM",
      priority: "HIGH",
      status: "REPORTED",
      reporter: "Test User",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      comments: [],
    },
  ];

  const mockGoals = [
    {
      id: "g1",
      title: "Test Goal",
      description: "Test Description",
      type: "OKR",
      status: "IN_PROGRESS",
      target: "100",
      currentProgress: 50,
      startDate: "2024-01-01",
      endDate: "2024-12-31",
      owner: "Test User",
      createdAt: "2024-01-01",
      updatedAt: "2024-01-01",
      color: "#2563eb",
    },
  ];

  const mockMilestones = [
    {
      id: "m1",
      goalId: "g1",
      title: "Test Milestone",
      description: "Test Description",
      dueDate: "2024-06-30",
      completed: false,
    },
  ];

  const mockKeyResults = [
    {
      id: "kr1",
      goalId: "g1",
      title: "Test Key Result",
      targetValue: 100,
      currentValue: 50,
      unit: "%",
      status: "ON_TRACK",
    },
  ];

  const mockTagHistory = ["tag1", "tag2"];

  const mockComments = [
    {
      id: "c1",
      taskId: "t1",
      author: "Test User",
      content: "Test Comment",
      createdAt: "2024-01-01",
    },
  ];

  const mockAuditLogs = [
    {
      id: "al1",
      timestamp: "2024-01-01T00:00:00Z",
      action: "CREATE",
      target: "TASK",
      targetId: "t1",
      details: "Created task",
      username: "Test User",
    },
  ];

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
    global.console.warn = jest.fn();
    global.console.error = jest.fn();
  });

  describe("saveWithLog", () => {
    it("should log start message before saving", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      const logCalls = (console.log as jest.Mock).mock.calls;
      const startLogCalls = logCalls.filter((call: [string, unknown]) =>
        call[0].includes("开始保存")
      );
      const successLogCalls = logCalls.filter((call: [string, unknown]) =>
        call[0].includes("保存成功")
      );

      expect(startLogCalls.length).toBeGreaterThan(0);
      expect(successLogCalls.length).toBeGreaterThan(0);
    });

    it("should log success message when encryption succeeds", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      expect(mockEncryptData).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[usePersistence]"),
        expect.objectContaining({
          itemCount: expect.any(Number),
          storageKey: expect.any(String),
        })
      );
    });

    it("should store encrypted string in localStorage", async () => {
      const expectedEncryptedValue = "expected-encrypted-value";
      mockEncryptData.mockResolvedValue(expectedEncryptedValue);

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
      const tasksSetItemCall = setItemCalls.find(
        (call: [string, string]) => call[0] === STORAGE_KEYS.TASKS
      );

      expect(tasksSetItemCall).toBeDefined();
      expect(tasksSetItemCall![1]).toBe(expectedEncryptedValue);
    });

    it("should handle empty arrays gracefully", async () => {
      mockEncryptData.mockResolvedValue("encrypted-empty-data");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            [],
            true,
            jest.fn()
          )
        );
      });

      expect(mockEncryptData).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
      expect(console.log).toHaveBeenCalledWith(
        expect.stringContaining("[usePersistence]"),
        expect.objectContaining({
          itemCount: 0,
        })
      );
    });

    it("should log warning when encryption returns null", async () => {
      mockEncryptData.mockResolvedValue(null);

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      expect(mockEncryptData).toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(console.warn).toHaveBeenCalledWith(
        expect.stringContaining("加密失败，跳过保存"),
        expect.objectContaining({
          itemCount: expect.any(Number),
          storageKey: expect.any(String),
        })
      );
    });

    it("should log error when encryption throws", async () => {
      mockEncryptData.mockRejectedValue(new Error("Encryption failed"));

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      expect(mockEncryptData).toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
      expect(console.error).toHaveBeenCalledWith(
        expect.stringContaining("保存异常"),
        expect.objectContaining({
          error: "Encryption failed",
        })
      );
    });

    it("should format time correctly in Chinese locale", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      const logCalls = (console.log as jest.Mock).mock.calls;
      const persistenceLogCalls = logCalls.filter((call: [string, unknown]) =>
        call[0].includes("[usePersistence]")
      );

      expect(persistenceLogCalls.length).toBeGreaterThan(0);

      const firstLog = persistenceLogCalls[0];
      expect(firstLog[1]).toEqual(
        expect.objectContaining({
          timestamp: expect.stringMatching(/^\d{4}\/\d{2}\/\d{2} \d{2}:\d{2}:\d{2}$/),
        })
      );
    });
  });

  describe("isInitialized guard", () => {
    it("should not save when isInitialized is false", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            false,
            jest.fn()
          )
        );
      });

      expect(mockEncryptData).not.toHaveBeenCalled();
      expect(localStorage.setItem).not.toHaveBeenCalled();
    });

    it("should save when isInitialized changes to true", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      const { rerender } = renderHook(
        ({ isInitialized }) =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            isInitialized,
            jest.fn()
          ),
        {
          initialProps: { isInitialized: false },
        }
      );

      expect(mockEncryptData).not.toHaveBeenCalled();

      await act(async () => {
        rerender({ isInitialized: true });
      });

      expect(mockEncryptData).toHaveBeenCalled();
      expect(localStorage.setItem).toHaveBeenCalled();
    });
  });

  describe("data change detection", () => {
    it("should save when tasks change", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      const { rerender } = renderHook(
        ({ tasks }) =>
          usePersistence(
            tasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          ),
        {
          initialProps: { tasks: mockTasks },
        }
      );

      const initialCallCount = mockEncryptData.mock.calls.length;

      const newTasks = [
        ...mockTasks,
        {
          id: "t2",
          title: "New Task",
          description: "New Description",
          status: "TODO",
          priority: "LOW",
          dueDate: "2024-12-31",
          tags: ["new"],
          assignee: "Test User",
          createdAt: "2024-01-02",
          comments: [],
        },
      ];

      await act(async () => {
        rerender({ tasks: newTasks });
      });

      expect(mockEncryptData.mock.calls.length).toBeGreaterThan(initialCallCount);
    });

    it("should save when requirements change", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      const { rerender } = renderHook(
        ({ requirements }) =>
          usePersistence(
            mockTasks,
            requirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          ),
        {
          initialProps: { requirements: mockRequirements },
        }
      );

      const initialCallCount = mockEncryptData.mock.calls.length;

      const newRequirements = [
        ...mockRequirements,
        {
          id: "r2",
          title: "New Requirement",
          description: "New Description",
          priority: "MEDIUM",
          status: "DRAFT",
          acceptanceCriteria: ["Criteria 1"],
          createdAt: "2024-01-02",
          updatedAt: "2024-01-02",
          requester: "Test User",
          executor: "Test User",
        },
      ];

      await act(async () => {
        rerender({ requirements: newRequirements });
      });

      expect(mockEncryptData.mock.calls.length).toBeGreaterThan(initialCallCount);
    });
  });

  describe("tag history collection", () => {
    it("should collect unique tags from tasks", async () => {
      const setTagHistory = jest.fn();

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            [],
            mockComments,
            mockAuditLogs,
            true,
            setTagHistory
          )
        );
      });

      expect(setTagHistory).toHaveBeenCalled();
    });

    it("should call setTagHistory with callback that returns prev unchanged when no new tags", async () => {
      const setTagHistory = jest.fn();

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            ["test"],
            mockComments,
            mockAuditLogs,
            true,
            setTagHistory
          )
        );
      });

      expect(setTagHistory).toHaveBeenCalled();

      const callback = setTagHistory.mock.calls[0][0];
      const prevState = ["test"];
      const result = callback(prevState);

      expect(result).toBe(prevState);
    });
  });

  describe("storage keys", () => {
    it("should use correct storage keys for each data type", async () => {
      mockEncryptData.mockResolvedValue("encrypted-data-string");

      await act(async () => {
        renderHook(() =>
          usePersistence(
            mockTasks,
            mockRequirements,
            mockTestCases,
            mockBugs,
            mockGoals,
            mockMilestones,
            mockKeyResults,
            mockTagHistory,
            mockComments,
            mockAuditLogs,
            true,
            jest.fn()
          )
        );
      });

      const setItemCalls = (localStorage.setItem as jest.Mock).mock.calls;
      const storageKeysUsed = setItemCalls.map((call: [string, string]) => call[0]);

      expect(storageKeysUsed).toContain(STORAGE_KEYS.TASKS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.REQUIREMENTS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.TEST_CASES);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.BUGS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.GOALS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.MILESTONES);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.KEY_RESULTS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.TAG_HISTORY);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.COMMENTS);
      expect(storageKeysUsed).toContain(STORAGE_KEYS.AUDIT_LOGS);
    });
  });
});