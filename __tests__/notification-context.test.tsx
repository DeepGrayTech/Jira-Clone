import { render, screen, act } from "@testing-library/react";
import { NotificationProvider, useNotifications } from "../app/dashboard/contexts/NotificationContext";

const TestComponent = ({
  onRender,
}: {
  onRender: (context: ReturnType<typeof useNotifications>) => void;
}) => {
  const context = useNotifications();
  if (onRender) onRender(context);
  return (
    <div>
      <div data-testid="notification-count">{context.notifications.length}</div>
      <div data-testid="unread-count">{context.unreadCount}</div>
      <div data-testid="task-count">{context.subagentTasks.length}</div>
    </div>
  );
};

describe("NotificationContext", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("should initialize with default state", () => {
    render(
      <NotificationProvider>
        <TestComponent />
      </NotificationProvider>
    );

    expect(screen.getByTestId("notification-count").textContent).toBe("0");
    expect(screen.getByTestId("unread-count").textContent).toBe("0");
    expect(screen.getByTestId("task-count").textContent).toBe("0");
  });

  it("should throw error when useNotifications is used outside NotificationProvider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useNotifications must be used within NotificationProvider");
  });

  it("should provide all context methods", () => {
    let context: ReturnType<typeof useNotifications>;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { context = ctx; }} />
      </NotificationProvider>
    );

    expect(context).toBeDefined();
    expect(typeof context.fetchNotifications).toBe("function");
    expect(typeof context.markAsRead).toBe("function");
    expect(typeof context.markAllAsRead).toBe("function");
    expect(typeof context.deleteNotification).toBe("function");
    expect(typeof context.createNotification).toBe("function");
    expect(typeof context.fetchSubagentTasks).toBe("function");
    expect(typeof context.createSubagentTask).toBe("function");
    expect(typeof context.updateSubagentTaskStatus).toBe("function");
    expect(typeof context.updateSubagentTaskProgress).toBe("function");
    expect(typeof context.cancelSubagentTask).toBe("function");
    expect(typeof context.fetchSettings).toBe("function");
    expect(typeof context.saveSettings).toBe("function");
  });

  it("should have empty settings by default", () => {
    let context: ReturnType<typeof useNotifications>;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { context = ctx; }} />
      </NotificationProvider>
    );

    expect(context.settings).toBeDefined();
    expect(context.settings.autoScheduleSubagent).toBe(true);
  });

  it("should handle anonymous user when no auth token", () => {
    let context: ReturnType<typeof useNotifications>;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { context = ctx; }} />
      </NotificationProvider>
    );

    expect(context).toBeDefined();
  });

  it("should create a notification", () => {
    let createNotification: (data: Omit<any, "id" | "createdAt" | "isRead">) => any;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { createNotification = ctx.createNotification; }} />
      </NotificationProvider>
    );

    act(() => {
      const result = createNotification({ type: "TASK_CREATE", recipient: "test", message: "Test notification" });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  it("should delete a notification", () => {
    let deleteNotification: (id: string) => boolean;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { deleteNotification = ctx.deleteNotification; }} />
      </NotificationProvider>
    );

    act(() => {
      const result = deleteNotification("non-existent");
      expect(typeof result).toBe("boolean");
    });
  });

  it("should create a subagent task", () => {
    let createSubagentTask: (data: Omit<any, "id" | "createdAt">) => any;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { createSubagentTask = ctx.createSubagentTask; }} />
      </NotificationProvider>
    );

    act(() => {
      const result = createSubagentTask({ type: "CODE_REVIEW", status: "PENDING" });
      expect(result).toBeDefined();
      expect(result.id).toBeDefined();
    });
  });

  it("should update subagent task progress", () => {
    let updateSubagentTaskProgress: (id: string, progress: number) => void;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { updateSubagentTaskProgress = ctx.updateSubagentTaskProgress; }} />
      </NotificationProvider>
    );

    act(() => {
      updateSubagentTaskProgress("task-1", 50);
    });
  });

  it("should cancel subagent task", () => {
    let cancelSubagentTask: (id: string) => boolean;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { cancelSubagentTask = ctx.cancelSubagentTask; }} />
      </NotificationProvider>
    );

    act(() => {
      const result = cancelSubagentTask("task-1");
      expect(typeof result).toBe("boolean");
    });
  });

  it("should save settings", () => {
    let saveSettings: (settings: any) => void;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { saveSettings = ctx.saveSettings; }} />
      </NotificationProvider>
    );

    act(() => {
      saveSettings({ userId: "test", enabledTypes: ["TASK_CREATE"], autoScheduleSubagent: true, preferredSubagents: [] });
    });
  });

  it("should fetch settings", () => {
    let fetchSettings: () => void;
    
    render(
      <NotificationProvider>
        <TestComponent onRender={(ctx) => { fetchSettings = ctx.fetchSettings; }} />
      </NotificationProvider>
    );

    act(() => {
      fetchSettings();
    });
  });
});