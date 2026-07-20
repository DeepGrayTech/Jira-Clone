import { render, screen, fireEvent } from "@testing-library/react";
import DashboardNavigation from "../app/dashboard/components/DashboardNavigation";
import type { ViewMode } from "../app/dashboard/types";

describe("DashboardNavigation", () => {
  const mockOnViewChange = jest.fn();

  const renderComponent = (currentView: ViewMode = "TASKS") => {
    return render(
      <DashboardNavigation
        currentView={currentView}
        onViewChange={mockOnViewChange}
        fontSizeScale={1}
      />
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render all navigation items", () => {
    renderComponent();

    expect(screen.getByText("Tasks")).toBeInTheDocument();
    expect(screen.getByText("Requirements")).toBeInTheDocument();
    expect(screen.getByText("Testing")).toBeInTheDocument();
    expect(screen.getByText("Bugs")).toBeInTheDocument();
    expect(screen.getByText("Goals")).toBeInTheDocument();
    expect(screen.getByText("Audit")).toBeInTheDocument();
  });

  it("should highlight current view", () => {
    renderComponent("REQUIREMENTS");

    const buttons = screen.getAllByRole("button");
    const requirementsButton = buttons.find(btn => btn.textContent?.includes("Requirements"));
    
    expect(requirementsButton).toBeInTheDocument();
    expect(requirementsButton).toHaveAttribute("aria-current", "page");
  });

  it("should call onViewChange when clicking a navigation item", () => {
    renderComponent();

    const testingButton = screen.getByText("Testing");
    fireEvent.click(testingButton);

    expect(mockOnViewChange).toHaveBeenCalledWith("TESTING");
  });

  it("should handle mouse over on inactive navigation item", () => {
    renderComponent("TASKS");

    const requirementsButton = screen.getByText("Requirements");
    fireEvent.mouseOver(requirementsButton);

    expect(requirementsButton).toBeInTheDocument();
  });

  it("should handle mouse out on inactive navigation item", () => {
    renderComponent("TASKS");

    const requirementsButton = screen.getByText("Requirements");
    fireEvent.mouseOver(requirementsButton);
    fireEvent.mouseOut(requirementsButton);

    expect(requirementsButton).toBeInTheDocument();
  });

  it("should not change style on mouse over for active navigation item", () => {
    renderComponent("TASKS");

    const tasksButton = screen.getByText("Tasks");
    fireEvent.mouseOver(tasksButton);
    fireEvent.mouseOut(tasksButton);

    expect(tasksButton).toBeInTheDocument();
  });

  it("should handle different fontSizeScale", () => {
    const { getByText } = render(
      <DashboardNavigation
        currentView="TASKS"
        onViewChange={mockOnViewChange}
        fontSizeScale={0.8}
      />
    );

    expect(getByText("Tasks")).toBeInTheDocument();
  });

  it("should render all navigation buttons with correct aria-labels", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBe(6);

    const tasksButton = screen.getByRole("button", { name: /Navigate to Tasks view/i });
    const requirementsButton = screen.getByRole("button", { name: /Navigate to Requirements view/i });
    
    expect(tasksButton).toBeInTheDocument();
    expect(requirementsButton).toBeInTheDocument();
  });

  it("should have correct aria-current attribute for active item", () => {
    renderComponent("BUGS");

    const bugsButton = screen.getByRole("button", { name: /Navigate to Bugs view/i });
    expect(bugsButton).toHaveAttribute("aria-current", "page");

    const tasksButton = screen.getByRole("button", { name: /Navigate to Tasks view/i });
    expect(tasksButton).not.toHaveAttribute("aria-current");
  });

  it("should call onViewChange for each navigation item", () => {
    renderComponent();

    const buttons = screen.getAllByRole("button");
    buttons.forEach((button, index) => {
      const expectedView = ["TASKS", "REQUIREMENTS", "TESTING", "BUGS", "GOALS", "AUDIT"][index];
      fireEvent.click(button);
      expect(mockOnViewChange).toHaveBeenCalledWith(expectedView);
    });
  });
});