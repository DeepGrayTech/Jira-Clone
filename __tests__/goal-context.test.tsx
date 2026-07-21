import { render, screen, act, waitFor } from "@testing-library/react";
import { GoalProvider, useGoals } from "../app/dashboard/contexts/GoalContext";
import type { Goal, Milestone, KeyResult } from "../app/dashboard/types";

jest.mock("../app/dashboard/services/api", () => ({
  createGoalApi: jest.fn(async (goal: Goal) => goal),
  updateGoalApi: jest.fn(async (_id: string, updates: Partial<Goal>) => ({ id: _id, ...updates })),
  deleteGoalApi: jest.fn(async () => undefined),
  createMilestoneApi: jest.fn(async (payload: { title: string; dueDate: string; status: string; goalId: string }) => ({
    id: "m1",
    goalId: payload.goalId,
    title: payload.title,
    dueDate: payload.dueDate,
    completed: payload.status === "COMPLETED",
  })),
  updateMilestoneApi: jest.fn(async (_id: string, updates: Partial<Milestone>) => ({ id: _id, ...updates })),
  deleteMilestoneApi: jest.fn(async () => undefined),
  createKeyResultApi: jest.fn(async (payload: { title: string; target: number; current: number; status: string; goalId: string }) => ({
    id: "kr1",
    goalId: payload.goalId,
    title: payload.title,
    targetValue: payload.target,
    currentValue: payload.current,
    status: payload.status,
    unit: "%",
  })),
  updateKeyResultApi: jest.fn(async (_id: string, updates: Partial<KeyResult>) => ({ id: _id, ...updates })),
  deleteKeyResultApi: jest.fn(async () => undefined),
}));

describe("GoalContext", () => {
  const mockGoal: Goal = {
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
  };

  const mockMilestone: Milestone = {
    id: "m1",
    goalId: "g1",
    title: "Test Milestone",
    description: "Test Description",
    dueDate: "2024-06-30",
    completed: false,
  };

  const mockKeyResult: KeyResult = {
    id: "kr1",
    goalId: "g1",
    title: "Test Key Result",
    targetValue: 100,
    currentValue: 50,
    unit: "%",
    status: "ON_TRACK",
  };

  const TestComponent = ({ onRender }: { onRender?: (context: ReturnType<typeof useGoals>) => void }) => {
    const context = useGoals();
    if (onRender) onRender(context);
    return (
      <div>
        <div data-testid="goals-count">{context.goals.length}</div>
        <div data-testid="milestones-count">{context.milestones.length}</div>
        <div data-testid="keyresults-count">{context.keyResults.length}</div>
      </div>
    );
  };

  const renderWithProvider = (onRender?: (context: ReturnType<typeof useGoals>) => void) => {
    return render(
      <GoalProvider>
        <TestComponent onRender={onRender} />
      </GoalProvider>
    );
  };

  it("should initialize with empty state", () => {
    renderWithProvider();

    expect(screen.getByTestId("goals-count").textContent).toBe("0");
    expect(screen.getByTestId("milestones-count").textContent).toBe("0");
    expect(screen.getByTestId("keyresults-count").textContent).toBe("0");
  });

  it("should add a goal", async () => {
    let addGoal: (goal: Goal) => Promise<void>;
    renderWithProvider((ctx) => { addGoal = ctx.addGoal; });

    await act(async () => {
      await addGoal(mockGoal);
    });

    expect(screen.getByTestId("goals-count").textContent).toBe("1");
  });

  it("should update a goal", async () => {
    let addGoal: (goal: Goal) => Promise<void>;
    let updateGoal: (id: string, updates: Partial<Goal>) => Promise<void>;
    renderWithProvider((ctx) => { addGoal = ctx.addGoal; updateGoal = ctx.updateGoal; });

    await act(async () => {
      await addGoal(mockGoal);
    });

    await act(async () => {
      await updateGoal("g1", { title: "Updated Goal" });
    });

    expect(screen.getByTestId("goals-count").textContent).toBe("1");
  });

  it("should delete a goal", async () => {
    let addGoal: (goal: Goal) => Promise<void>;
    let deleteGoal: (id: string) => Promise<void>;
    renderWithProvider((ctx) => { addGoal = ctx.addGoal; deleteGoal = ctx.deleteGoal; });

    await act(async () => {
      await addGoal(mockGoal);
    });

    expect(screen.getByTestId("goals-count").textContent).toBe("1");

    await act(async () => {
      await deleteGoal("g1");
    });

    expect(screen.getByTestId("goals-count").textContent).toBe("0");
  });

  it("should delete associated milestones when deleting a goal", async () => {
    let addGoal: (goal: Goal) => Promise<void>;
    let addMilestone: (milestone: Milestone) => Promise<void>;
    let deleteGoal: (id: string) => Promise<void>;
    renderWithProvider((ctx) => {
      addGoal = ctx.addGoal;
      addMilestone = ctx.addMilestone;
      deleteGoal = ctx.deleteGoal;
    });

    await act(async () => {
      await addGoal(mockGoal);
      await addMilestone(mockMilestone);
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("1");
    });

    await act(async () => {
      await deleteGoal("g1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("0");
    });
  });

  it("should delete associated key results when deleting a goal", async () => {
    let addGoal: (goal: Goal) => Promise<void>;
    let addKeyResult: (keyResult: KeyResult) => Promise<void>;
    let deleteGoal: (id: string) => Promise<void>;
    renderWithProvider((ctx) => {
      addGoal = ctx.addGoal;
      addKeyResult = ctx.addKeyResult;
      deleteGoal = ctx.deleteGoal;
    });

    await act(async () => {
      await addGoal(mockGoal);
      await addKeyResult(mockKeyResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("1");
    });

    await act(async () => {
      await deleteGoal("g1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("0");
    });
  });

  it("should add a milestone", async () => {
    let addMilestone: (milestone: Milestone) => Promise<void>;
    renderWithProvider((ctx) => { addMilestone = ctx.addMilestone; });

    await act(async () => {
      await addMilestone(mockMilestone);
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("1");
    });
  });

  it("should update a milestone", async () => {
    let addMilestone: (milestone: Milestone) => Promise<void>;
    let updateMilestone: (id: string, updates: Partial<Milestone>) => Promise<void>;
    renderWithProvider((ctx) => { addMilestone = ctx.addMilestone; updateMilestone = ctx.updateMilestone; });

    await act(async () => {
      await addMilestone(mockMilestone);
    });

    await act(async () => {
      await updateMilestone("m1", { completed: true });
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("1");
    });
  });

  it("should delete a milestone", async () => {
    let addMilestone: (milestone: Milestone) => Promise<void>;
    let deleteMilestone: (id: string) => Promise<void>;
    renderWithProvider((ctx) => { addMilestone = ctx.addMilestone; deleteMilestone = ctx.deleteMilestone; });

    await act(async () => {
      await addMilestone(mockMilestone);
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("1");
    });

    await act(async () => {
      await deleteMilestone("m1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("milestones-count").textContent).toBe("0");
    });
  });

  it("should add a key result", async () => {
    let addKeyResult: (keyResult: KeyResult) => Promise<void>;
    renderWithProvider((ctx) => { addKeyResult = ctx.addKeyResult; });

    await act(async () => {
      await addKeyResult(mockKeyResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("1");
    });
  });

  it("should update a key result", async () => {
    let addKeyResult: (keyResult: KeyResult) => Promise<void>;
    let updateKeyResult: (id: string, updates: Partial<KeyResult>) => Promise<void>;
    renderWithProvider((ctx) => { addKeyResult = ctx.addKeyResult; updateKeyResult = ctx.updateKeyResult; });

    await act(async () => {
      await addKeyResult(mockKeyResult);
    });

    await act(async () => {
      await updateKeyResult("kr1", { currentValue: 75 });
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("1");
    });
  });

  it("should delete a key result", async () => {
    let addKeyResult: (keyResult: KeyResult) => Promise<void>;
    let deleteKeyResult: (id: string) => Promise<void>;
    renderWithProvider((ctx) => { addKeyResult = ctx.addKeyResult; deleteKeyResult = ctx.deleteKeyResult; });

    await act(async () => {
      await addKeyResult(mockKeyResult);
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("1");
    });

    await act(async () => {
      await deleteKeyResult("kr1");
    });

    await waitFor(() => {
      expect(screen.getByTestId("keyresults-count").textContent).toBe("0");
    });
  });

  it("should set goals directly", () => {
    let setGoals: React.Dispatch<React.SetStateAction<Goal[]>>;
    renderWithProvider((ctx) => { setGoals = ctx.setGoals; });

    act(() => {
      setGoals([mockGoal]);
    });

    expect(screen.getByTestId("goals-count").textContent).toBe("1");
  });

  it("should set milestones directly", () => {
    let setMilestones: React.Dispatch<React.SetStateAction<Milestone[]>>;
    renderWithProvider((ctx) => { setMilestones = ctx.setMilestones; });

    act(() => {
      setMilestones([mockMilestone]);
    });

    expect(screen.getByTestId("milestones-count").textContent).toBe("1");
  });

  it("should set key results directly", () => {
    let setKeyResults: React.Dispatch<React.SetStateAction<KeyResult[]>>;
    renderWithProvider((ctx) => { setKeyResults = ctx.setKeyResults; });

    act(() => {
      setKeyResults([mockKeyResult]);
    });

    expect(screen.getByTestId("keyresults-count").textContent).toBe("1");
  });

  it("should throw error when useGoals is used outside GoalProvider", () => {
    const TestComponentOutside = () => {
      useGoals();
      return <div />;
    };

    expect(() => {
      render(<TestComponentOutside />);
    }).toThrow("useGoals must be used within GoalProvider");
  });
});
