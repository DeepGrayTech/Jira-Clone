import {
  TaskProvider,
  useTasks,
  RequirementProvider,
  useRequirements,
  BugProvider,
  useBugs,
  GoalProvider,
  useGoals,
  AuditProvider,
  useAuditLogs,
  TestCaseProvider,
  useTestCases,
  SharedProvider,
  useShared,
  NotificationProvider,
  useNotifications,
} from "../app/dashboard/contexts";

describe("contexts/index.ts exports", () => {
  it("should export TaskProvider", () => {
    expect(TaskProvider).toBeDefined();
    expect(typeof TaskProvider).toBe("function");
  });

  it("should export useTasks", () => {
    expect(useTasks).toBeDefined();
    expect(typeof useTasks).toBe("function");
  });

  it("should export RequirementProvider", () => {
    expect(RequirementProvider).toBeDefined();
    expect(typeof RequirementProvider).toBe("function");
  });

  it("should export useRequirements", () => {
    expect(useRequirements).toBeDefined();
    expect(typeof useRequirements).toBe("function");
  });

  it("should export BugProvider", () => {
    expect(BugProvider).toBeDefined();
    expect(typeof BugProvider).toBe("function");
  });

  it("should export useBugs", () => {
    expect(useBugs).toBeDefined();
    expect(typeof useBugs).toBe("function");
  });

  it("should export GoalProvider", () => {
    expect(GoalProvider).toBeDefined();
    expect(typeof GoalProvider).toBe("function");
  });

  it("should export useGoals", () => {
    expect(useGoals).toBeDefined();
    expect(typeof useGoals).toBe("function");
  });

  it("should export AuditProvider", () => {
    expect(AuditProvider).toBeDefined();
    expect(typeof AuditProvider).toBe("function");
  });

  it("should export useAuditLogs", () => {
    expect(useAuditLogs).toBeDefined();
    expect(typeof useAuditLogs).toBe("function");
  });

  it("should export TestCaseProvider", () => {
    expect(TestCaseProvider).toBeDefined();
    expect(typeof TestCaseProvider).toBe("function");
  });

  it("should export useTestCases", () => {
    expect(useTestCases).toBeDefined();
    expect(typeof useTestCases).toBe("function");
  });

  it("should export SharedProvider", () => {
    expect(SharedProvider).toBeDefined();
    expect(typeof SharedProvider).toBe("function");
  });

  it("should export useShared", () => {
    expect(useShared).toBeDefined();
    expect(typeof useShared).toBe("function");
  });

  it("should export NotificationProvider", () => {
    expect(NotificationProvider).toBeDefined();
    expect(typeof NotificationProvider).toBe("function");
  });

  it("should export useNotifications", () => {
    expect(useNotifications).toBeDefined();
    expect(typeof useNotifications).toBe("function");
  });
});
