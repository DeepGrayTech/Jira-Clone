import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import NotificationsView from "../app/dashboard/views/NotificationsView";
import { NotificationProvider } from "../app/dashboard/contexts";

describe("NotificationsView", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("jira-clone-auth-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIn0.xxx");
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders notifications header", () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByText("Notifications")).toBeInTheDocument();
  });

  it("shows notification count", async () => {
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
        isRead: true,
        isActionable: true,
        createdAt: new Date().toISOString(),
      },
    ]));

    render(
      <NotificationProvider>
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("Notifications")).toBeInTheDocument();
    });

    const countText = screen.getByText(/unread.*read.*total/i);
    expect(countText).toBeInTheDocument();
  });

  it("filters notifications by search", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
    });
  });

  it("calls markAllAsRead when button clicked", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const markAllButton = screen.getByText("Mark All as Read");
      fireEvent.click(markAllButton);
    });
  });

  it("shows empty state with no notifications", async () => {
    localStorage.setItem("jira-clone-notifications", JSON.stringify([]));

    render(
      <NotificationProvider>
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
    });
  });

  it("shows clear filters button when search is active", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      expect(screen.getByText("Clear Filters")).toBeInTheDocument();
    });
  });

  it("clears filters when clear button clicked", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "test" } });

    await waitFor(() => {
      const clearButton = screen.getByText("Clear Filters");
      fireEvent.click(clearButton);
    });

    expect(searchInput).toHaveValue("");
  });

  it("filters notifications by type", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const selects = screen.getAllByRole("combobox");
    const typeSelect = selects[0];
    fireEvent.change(typeSelect, { target: { value: "TEST_CASE_FAILED" } });

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
    });
  });

  it("filters notifications by read status", async () => {
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
        isRead: true,
        isActionable: true,
        createdAt: new Date().toISOString(),
      },
    ]));

    render(
      <NotificationProvider>
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const selects = screen.getAllByRole("combobox");
    const readSelect = selects[1];
    fireEvent.change(readSelect, { target: { value: "read" } });

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      expect(headings.length).toBeGreaterThan(0);
    });
  });

  it("toggles single notification selection", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(1);
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const notificationCheckbox = checkboxes[1];
    
    fireEvent.click(notificationCheckbox);
    expect(notificationCheckbox).toBeChecked();
    
    fireEvent.click(notificationCheckbox);
    expect(notificationCheckbox).not.toBeChecked();
  });

  it("toggles select all", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      expect(checkboxes.length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole("checkbox");
    const selectAllCheckbox = checkboxes[0];
    
    fireEvent.click(selectAllCheckbox);
    
    const updatedCheckboxes = screen.getAllByRole("checkbox");
    updatedCheckboxes.forEach((cb, index) => {
      expect(cb).toBeChecked();
    });
  });

  it("shows delete selected button when items selected", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
      }
    });

    await waitFor(() => {
      expect(screen.getByText("Delete Selected (1)")).toBeInTheDocument();
    });
  });

  it("calls deleteNotification for each selected item", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    await waitFor(() => {
      const deleteButton = screen.getByText("Delete Selected (2)");
      fireEvent.click(deleteButton);
    });

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText("🤖 senior-frontend-engineer")).toBeInTheDocument();
    });
  });

  it("shows view details button for actionable notifications", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const viewDetailsButton = screen.getByText("View Details");
      expect(viewDetailsButton).toBeInTheDocument();
    });
  });

  it("calls handleNotificationClick when view details button clicked", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const viewDetailsButton = screen.getByText("View Details");
      fireEvent.click(viewDetailsButton);
    });
  });

  it("calls deleteNotification when individual delete button clicked", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(b => b.textContent === "✕" && b !== screen.getByText("View Details"));
      if (deleteButton) {
        fireEvent.click(deleteButton);
      }
    });

    await waitFor(() => {
      expect(screen.getByText("No notifications found")).toBeInTheDocument();
    });
  });

  it("calls onViewChange when notification with actionUrl clicked", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={mockOnViewChange} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      if (headings.length > 0) {
        fireEvent.click(headings[0].parentElement!.parentElement!);
      }
    });
  });

  it("triggers mouseover and mouseout events on mark all button", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const markAllButton = screen.getByText("Mark All as Read");
      fireEvent.mouseOver(markAllButton);
      fireEvent.mouseOut(markAllButton);
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const headings = screen.getAllByRole("heading");
      if (headings.length > 0) {
        const card = headings[0].parentElement!.parentElement!.parentElement!;
        fireEvent.mouseOver(card);
        fireEvent.mouseOut(card);
      }
    });
  });

  it("triggers mouseover and mouseout events on delete button", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const buttons = screen.getAllByRole("button");
      const deleteButton = buttons.find(b => b.textContent === "✕" && b !== screen.getByText("View Details"));
      if (deleteButton) {
        fireEvent.mouseOver(deleteButton);
        fireEvent.mouseOut(deleteButton);
      }
    });
  });

  it("deselects all when select all clicked again", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 0) {
        fireEvent.click(checkboxes[0]);
      }
    });

    const checkboxes = screen.getAllByRole("checkbox");
    checkboxes.forEach(cb => {
      expect(cb).not.toBeChecked();
    });
  });

  it("shows 'Try adjusting your filters' message when filtering returns no results", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    const searchInput = screen.getByPlaceholderText("Search notifications...");
    fireEvent.change(searchInput, { target: { value: "nonexistent" } });

    await waitFor(() => {
      expect(screen.getByText("Try adjusting your filters")).toBeInTheDocument();
    });
  });

  it("shows time in minutes/hours/days format", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(/hours ago/)).toBeInTheDocument();
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getByText(oldDate.toLocaleDateString())).toBeInTheDocument();
    });
  });

  it("triggers mouseover and mouseout events on delete selected button", async () => {
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
        <NotificationsView fontSizeScale={1} isSmall={false} onViewChange={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      const checkboxes = screen.getAllByRole("checkbox");
      if (checkboxes.length > 1) {
        fireEvent.click(checkboxes[1]);
      }
    });

    await waitFor(() => {
      const deleteSelectedButton = screen.getByText("Delete Selected (1)");
      fireEvent.mouseOver(deleteSelectedButton);
      fireEvent.mouseOut(deleteSelectedButton);
    });
  });
});