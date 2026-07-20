import { render, screen, act } from "@testing-library/react";
import { RequirementProvider, useRequirements } from "../app/dashboard/contexts/RequirementContext";
import type { Requirement } from "../app/dashboard/types";

const TestComponent = ({
  onRender,
}: {
  onRender: (context: ReturnType<typeof useRequirements>) => void;
}) => {
  const context = useRequirements();
  if (onRender) onRender(context);
  return (
    <div>
      <div data-testid="req-count">{context.requirements.length}</div>
      {context.requirements.map((req) => (
        <div key={req.id} data-testid={`req-${req.id}`}>
          <span data-testid={`req-${req.id}-title`}>{req.title}</span>
          <span data-testid={`req-${req.id}-status`}>{req.status}</span>
        </div>
      ))}
    </div>
  );
};

const testRequirement: Requirement = {
  id: "req-1",
  title: "Test Requirement",
  description: "Test description",
  status: "DRAFT",
  priority: "MEDIUM",
  acceptanceCriteria: ["Criteria 1", "Criteria 2"],
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  requester: "testuser",
  executor: "testexecutor",
};

describe("RequirementContext", () => {
  it("should initialize with empty requirements", () => {
    render(
      <RequirementProvider>
        <TestComponent />
      </RequirementProvider>
    );

    expect(screen.getByTestId("req-count").textContent).toBe("0");
  });

  it("should add a requirement", () => {
    let addRequirement: (req: Requirement) => void;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { addRequirement = ctx.addRequirement; }} />
      </RequirementProvider>
    );

    act(() => {
      addRequirement(testRequirement);
    });

    expect(screen.getByTestId("req-count").textContent).toBe("1");
    expect(screen.getByTestId("req-req-1-title").textContent).toBe("Test Requirement");
  });

  it("should update a requirement", () => {
    let addRequirement: (req: Requirement) => void;
    let updateRequirement: (id: string, updates: Partial<Requirement>) => void;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { addRequirement = ctx.addRequirement; updateRequirement = ctx.updateRequirement; }} />
      </RequirementProvider>
    );

    act(() => {
      addRequirement(testRequirement);
    });

    expect(screen.getByTestId("req-req-1-status").textContent).toBe("DRAFT");

    act(() => {
      updateRequirement("req-1", { status: "IN_PROGRESS", priority: "HIGH" });
    });

    expect(screen.getByTestId("req-req-1-status").textContent).toBe("IN_PROGRESS");
  });

  it("should delete a requirement", () => {
    let addRequirement: (req: Requirement) => void;
    let deleteRequirement: (id: string) => void;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { addRequirement = ctx.addRequirement; deleteRequirement = ctx.deleteRequirement; }} />
      </RequirementProvider>
    );

    act(() => {
      addRequirement(testRequirement);
    });

    expect(screen.getByTestId("req-count").textContent).toBe("1");

    act(() => {
      deleteRequirement("req-1");
    });

    expect(screen.getByTestId("req-count").textContent).toBe("0");
    expect(screen.queryByTestId("req-req-1")).not.toBeInTheDocument();
  });

  it("should get requirement by id", () => {
    let addRequirement: (req: Requirement) => void;
    let getRequirementById: (id: string) => Requirement | undefined;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { addRequirement = ctx.addRequirement; getRequirementById = ctx.getRequirementById; }} />
      </RequirementProvider>
    );

    act(() => {
      addRequirement(testRequirement);
    });

    const found = getRequirementById("req-1");
    expect(found).toBeDefined();
    expect(found?.title).toBe("Test Requirement");
  });

  it("should return undefined for non-existent requirement", () => {
    let getRequirementById: (id: string) => Requirement | undefined;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { getRequirementById = ctx.getRequirementById; }} />
      </RequirementProvider>
    );

    const found = getRequirementById("non-existent");
    expect(found).toBeUndefined();
  });

  it("should allow manual state updates via setRequirements", () => {
    let setRequirements: React.Dispatch<React.SetStateAction<Requirement[]>>;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { setRequirements = ctx.setRequirements; }} />
      </RequirementProvider>
    );

    act(() => {
      setRequirements([testRequirement]);
    });

    expect(screen.getByTestId("req-count").textContent).toBe("1");
  });

  it("should throw error when useRequirements is used outside RequirementProvider", () => {
    expect(() => {
      render(<TestComponent />);
    }).toThrow("useRequirements must be used within RequirementProvider");
  });

  it("should handle multiple requirements", () => {
    let addRequirement: (req: Requirement) => void;

    render(
      <RequirementProvider>
        <TestComponent onRender={(ctx) => { addRequirement = ctx.addRequirement; }} />
      </RequirementProvider>
    );

    act(() => {
      addRequirement(testRequirement);
      addRequirement({
        ...testRequirement,
        id: "req-2",
        title: "Second Requirement",
      });
    });

    expect(screen.getByTestId("req-count").textContent).toBe("2");
    expect(screen.getByTestId("req-req-2-title").textContent).toBe("Second Requirement");
  });
});