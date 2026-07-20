import { render, screen, fireEvent } from "@testing-library/react";
import RequirementCard from "../app/dashboard/components/RequirementCard";
import type { Requirement } from "../app/dashboard/types";

const mockRequirement: Requirement = {
  id: "req-1",
  title: "Test Requirement",
  description: "Test description",
  status: "DRAFT",
  priority: "MEDIUM",
  tags: ["tag1", "tag2"],
  acceptanceCriteria: ["Criteria 1", "Criteria 2"],
  createdAt: "2024-01-01",
  updatedAt: "2024-01-02",
  source: "ISO 9001",
  requester: "John",
  executor: "Jane",
};

describe("RequirementCard", () => {
  const mockOnEdit = jest.fn();
  const mockOnDelete = jest.fn();
  const mockOnAddTest = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render requirement card", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.getByText("Test Requirement")).toBeInTheDocument();
    expect(screen.getByText("Test description")).toBeInTheDocument();
    expect(screen.getByText("MEDIUM")).toBeInTheDocument();
    expect(screen.getByText("📅 2024-01-02")).toBeInTheDocument();
    expect(screen.getByText("📥 John")).toBeInTheDocument();
    expect(screen.getByText("📤 Jane")).toBeInTheDocument();
  });

  it("should render acceptance criteria", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.getByText("Acceptance Criteria:")).toBeInTheDocument();
    expect(screen.getByText("Criteria 1")).toBeInTheDocument();
    expect(screen.getByText("Criteria 2")).toBeInTheDocument();
  });

  it("should render source info", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.getByText("标准出处：ISO 9001")).toBeInTheDocument();
  });

  it("should call onEdit when card is clicked", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    fireEvent.click(screen.getByRole("button", { name: /Requirement: Test Requirement/ }));

    expect(mockOnEdit).toHaveBeenCalledWith(mockRequirement);
  });

  it("should call onEdit when Enter key is pressed", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    const card = screen.getByRole("button", { name: /Requirement: Test Requirement/ });
    fireEvent.keyDown(card, { key: "Enter", code: "Enter" });

    expect(mockOnEdit).toHaveBeenCalledWith(mockRequirement);
  });

  it("should call onEdit when Space key is pressed", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    const card = screen.getByRole("button", { name: /Requirement: Test Requirement/ });
    fireEvent.keyDown(card, { key: " ", code: "Space" });

    expect(mockOnEdit).toHaveBeenCalledWith(mockRequirement);
  });

  it("should call onAddTest when Add Test button is clicked", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    fireEvent.click(screen.getByText("+ Add Test"));

    expect(mockOnAddTest).toHaveBeenCalledWith("req-1");
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("should call onDelete when Delete button is clicked", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    fireEvent.click(screen.getByText("Delete"));

    expect(mockOnDelete).toHaveBeenCalledWith("req-1");
    expect(mockOnEdit).not.toHaveBeenCalled();
  });

  it("should handle different status styles", () => {
    const statuses: Requirement["status"][] = ["DRAFT", "REVIEW", "APPROVED", "IMPLEMENTED"];
    
    statuses.forEach((status) => {
      const { unmount } = render(
        <RequirementCard
          requirement={{ ...mockRequirement, status }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddTest={mockOnAddTest}
        />
      );
      expect(screen.getByText("Test Requirement")).toBeInTheDocument();
      unmount();
    });
  });

  it("should handle different priority styles", () => {
    const priorities: Requirement["priority"][] = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    
    priorities.forEach((priority) => {
      const { unmount } = render(
        <RequirementCard
          requirement={{ ...mockRequirement, priority }}
          onEdit={mockOnEdit}
          onDelete={mockOnDelete}
          onAddTest={mockOnAddTest}
        />
      );
      expect(screen.getByText(priority)).toBeInTheDocument();
      unmount();
    });
  });

  it("should render in small mode", () => {
    render(
      <RequirementCard
        requirement={mockRequirement}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
        isSmall={true}
      />
    );

    expect(screen.getByText("Test Requirement")).toBeInTheDocument();
  });

  it("should handle requirement without description", () => {
    render(
      <RequirementCard
        requirement={{ ...mockRequirement, description: "" }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.queryByText("Test description")).not.toBeInTheDocument();
    expect(screen.getByText("Test Requirement")).toBeInTheDocument();
  });

  it("should handle requirement without source", () => {
    render(
      <RequirementCard
        requirement={{ ...mockRequirement, source: undefined }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.queryByText("标准出处")).not.toBeInTheDocument();
  });

  it("should handle requirement without acceptance criteria", () => {
    render(
      <RequirementCard
        requirement={{ ...mockRequirement, acceptanceCriteria: [] }}
        onEdit={mockOnEdit}
        onDelete={mockOnDelete}
        onAddTest={mockOnAddTest}
      />
    );

    expect(screen.queryByText("Acceptance Criteria:")).not.toBeInTheDocument();
  });
});