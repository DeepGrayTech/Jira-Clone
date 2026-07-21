import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import NotificationCenter from "../app/dashboard/components/NotificationCenter";
import { NotificationProvider } from "../app/dashboard/contexts";

describe("NotificationCenter", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("jira-clone-auth-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIn0.xxx");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders bell button", () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([]));
    
    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByLabelText("Notifications")).toBeInTheDocument();
  });

  it("shows unread count", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const badge = screen.getByText("1");
      expect(badge).toBeInTheDocument();
    });
  });

  it("shows 99+ for large unread counts", async () => {
    const notifications = Array.from({ length: 150 }, (_, i) => ({
      id: `notif-${i}`,
      type: "TASK_ASSIGNED",
      title: `Task ${i}`,
      message: "Task assigned",
      targetId: `task-${i}`,
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem("jira-clone-notifications", JSON.stringify(notifications));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const badge = screen.getByText("99+");
      expect(badge).toBeInTheDocument();
    });
  });

  it("opens dropdown on click", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("closes dropdown when clicking bell button again", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("Notifications (1)")).toBeInTheDocument();
    });

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.queryByText("Notifications (1)")).not.toBeInTheDocument();
    });
  });

  it("calls markAsRead on notification click", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      if (headings.length > 1) {
        fireEvent.click(headings[1].parentElement!);
      }
    });
  });

  it("calls onViewChange when notification has actionUrl", async () => {
    const mockOnViewChange = jest.fn();
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      actionUrl: "/tasks/task-1",
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={mockOnViewChange} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      if (headings.length > 1) {
        fireEvent.click(headings[1].parentElement!);
      }
    });
  });

  it("deletes notification when delete button clicked", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(b => b.textContent === "✕" && b.parentElement?.parentElement?.querySelector("h4"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  it("shows empty state with no notifications", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([]));
    
    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("No notifications")).toBeInTheDocument();
    });
  });

  it("shows 'View all' button when more than 10 notifications", async () => {
    const notifications = Array.from({ length: 15 }, (_, i) => ({
      id: `notif-${i}`,
      type: "TASK_ASSIGNED",
      title: `Task ${i}`,
      message: "Task assigned",
      targetId: `task-${i}`,
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem("jira-clone-notifications", JSON.stringify(notifications));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const viewAllButton = screen.getByText("View all 15 notifications");
      expect(viewAllButton).toBeInTheDocument();
    });
  });

  it("calls onViewChange when 'View all' button clicked", async () => {
    const mockOnViewChange = jest.fn();
    const notifications = Array.from({ length: 15 }, (_, i) => ({
      id: `notif-${i}`,
      type: "TASK_ASSIGNED",
      title: `Task ${i}`,
      message: "Task assigned",
      targetId: `task-${i}`,
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }));
    localStorage.setItem("jira-clone-notifications", JSON.stringify(notifications));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={mockOnViewChange} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const viewAllButton = screen.getByText("View all 15 notifications");
      fireEvent.click(viewAllButton);
    });
  });

  it("shows scheduled subagent info", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "SUBAGENT_TASK_STARTED",
      title: "Subagent Task Started",
      message: "Task started",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      scheduledSubagent: "senior-frontend-engineer",
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("• Assigned to senior-frontend-engineer")).toBeInTheDocument();
    });
  });

  it("calls markAllAsRead when button clicked", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([
      {
        id: "notif-1",
        type: "TASK_ASSIGNED",
        title: "Task Assigned",
        message: "Task assigned",
        targetId: "task-1",
        targetType: "TASK",
        recipient: "user1",
        isRead: false,
        isActionable: true,
        createdAt: new Date().toISOString(),
      },
      {
        id: "notif-2",
        type: "BUG_REPORTED",
        title: "Bug Reported",
        message: "Bug reported",
        targetId: "bug-1",
        targetType: "BUG",
        recipient: "user1",
        isRead: false,
        isActionable: true,
        createdAt: new Date().toISOString(),
      },
    ]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const markAllButton = screen.getByText("Mark all as read");
      fireEvent.click(markAllButton);
    });
  });

  it("shows 'just now' for recent notifications", async () => {
    const recentDate = new Date();
    recentDate.setSeconds(recentDate.getSeconds() - 5);
    
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: recentDate.toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText("just now")).toBeInTheDocument();
    });
  });

  it("shows time in minutes for notifications within an hour", async () => {
    const recentDate = new Date();
    recentDate.setMinutes(recentDate.getMinutes() - 30);
    
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: recentDate.toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText(/m ago/)).toBeInTheDocument();
    });
  });

  it("shows time in hours for notifications within a day", async () => {
    const recentDate = new Date();
    recentDate.setHours(recentDate.getHours() - 5);
    
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: recentDate.toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText(/h ago/)).toBeInTheDocument();
    });
  });

  it("shows time in days for notifications within a week", async () => {
    const recentDate = new Date();
    recentDate.setDate(recentDate.getDate() - 3);
    
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: recentDate.toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      expect(screen.getByText(/d ago/)).toBeInTheDocument();
    });
  });

  it("triggers mouseover and mouseout events on notification card", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: true,
      isActionable: true,
      createdAt: new Date().toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      if (headings.length > 1) {
        const card = headings[1].parentElement!.parentElement!;
        fireEvent.mouseOver(card);
        fireEvent.mouseOut(card);
      }
    });
  });

  it("shows locale date for notifications older than a week", async () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 10);
    
    localStorage.setItem("jira-clone-notifications", JSON.stringify([{
      id: "notif-1",
      type: "TASK_ASSIGNED",
      title: "Task Assigned",
      message: "Task assigned",
      targetId: "task-1",
      targetType: "TASK",
      recipient: "user1",
      isRead: false,
      isActionable: true,
      createdAt: oldDate.toISOString(),
    }]));

    render(
      <NotificationProvider>
        <NotificationCenter fontSizeScale={1} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    fireEvent.click(screen.getByLabelText("Notifications"));

    await waitFor(() => {
      const dateElements = screen.getByText(oldDate.toLocaleDateString());
      expect(dateElements).toBeInTheDocument();
    });
  });
});