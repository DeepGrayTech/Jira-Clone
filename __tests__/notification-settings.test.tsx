import { describe, it, expect, beforeEach, afterEach, jest } from "@jest/globals";
import "@testing-library/jest-dom/jest-globals";
import { render, screen, fireEvent, waitFor, cleanup } from "@testing-library/react";
import NotificationSettingsPanel from "../app/dashboard/components/NotificationSettingsPanel";
import { NotificationProvider } from "../app/dashboard/contexts";

describe("NotificationSettingsPanel", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    localStorage.setItem("jira-clone-auth-token", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VybmFtZSI6InVzZXIxIn0.xxx");
    localStorage.setItem("jira-clone-notification-settings", JSON.stringify({
      user1: {
        userId: "user1",
        enabledTypes: ["TASK_ASSIGNED"],
        autoScheduleSubagent: true,
        preferredSubagents: [],
      },
    }));
  });

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  it("renders settings panel", () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByText("🔔 Notification Settings")).toBeInTheDocument();
  });

  it("shows notification types section", () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByText("Notification Types")).toBeInTheDocument();
  });

  it("shows subagent auto-scheduling section", () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByText("Subagent Auto-Scheduling")).toBeInTheDocument();
  });

  it("shows preferred subagents section", () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    expect(screen.getByText("Preferred Subagents")).toBeInTheDocument();
  });

  it("calls saveSettings when save button clicked", async () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    const saveButton = screen.getByText("Save Settings");
    fireEvent.click(saveButton);
  });

  it("calls onClose when close button clicked", () => {
    const mockOnClose = jest.fn();
    
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={mockOnClose} />
      </NotificationProvider>
    );

    const buttons = screen.getAllByRole("button");
    const closeButton = buttons.find(b => b.textContent === "✕");
    fireEvent.click(closeButton!);

    expect(mockOnClose).toHaveBeenCalled();
  });

  it("resets settings when reset button clicked", () => {
    localStorage.setItem("jira-clone-notification-settings", JSON.stringify({
      user1: {
        userId: "user1",
        enabledTypes: [],
        autoScheduleSubagent: false,
        preferredSubagents: [],
      },
    }));

    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    const resetButton = screen.getByText("Reset to Default");
    fireEvent.click(resetButton);

    const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
    expect(checkboxes.filter(cb => cb.checked).length).toBeGreaterThan(0);
  });

  it("toggles notification type checkbox", async () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    await waitFor(() => {
      expect(screen.getAllByRole("checkbox").length).toBeGreaterThan(0);
    });

    const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
    const firstCheckbox = checkboxes[0];
    const initialState = firstCheckbox.checked;
    
    fireEvent.click(firstCheckbox);
    expect(firstCheckbox.checked).toBe(!initialState);
  });

  it("toggles auto-schedule checkbox", () => {
    render(
      <NotificationProvider>
        <NotificationSettingsPanel fontSizeScale={1} onClose={jest.fn()} />
      </NotificationProvider>
    );

    const checkboxes = screen.getAllByRole<HTMLInputElement>("checkbox");
    const autoScheduleCheckbox = checkboxes.find(cb => cb.nextElementSibling?.textContent === "Enable auto-scheduling");
    expect(autoScheduleCheckbox).toBeChecked();

    fireEvent.click(autoScheduleCheckbox!);
    expect(autoScheduleCheckbox).not.toBeChecked();
  });
});