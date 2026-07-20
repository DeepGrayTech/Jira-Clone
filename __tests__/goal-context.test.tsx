import { render, act } from "@testing-library/react";
import { GoalProvider, useGoals } from "../app/dashboard/contexts/GoalContext";
import type { Goal, Milestone, KeyResult } from "../app/dashboard/types";

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

  const TestComponent = () => {
    const {
      goals,
      milestones,
      keyResults,
      addGoal,
      updateGoal,
      deleteGoal,
      addMilestone,
      updateMilestone,
      deleteMilestone,
      addKeyResult,
      updateKeyResult,
      deleteKeyResult,
      setGoals,
      setMilestones,
      setKeyResults,
    } = useGoals();

    return (
      <div>
        <div data-testid="goals-count">{goals.length}</div>
        <div data-testid="milestones-count">{milestones.length}</div>
        <div data-testid="keyresults-count">{keyResults.length}</div>
        <button
          data-testid="add-goal"
          onClick={() => addGoal(mockGoal)}
        />
        <button
          data-testid="update-goal"
          onClick={() => updateGoal("g1", { title: "Updated Goal" })}
        />
        <button
          data-testid="delete-goal"
          onClick={() => deleteGoal("g1")}
        />
        <button
          data-testid="add-milestone"
          onClick={() => addMilestone(mockMilestone)}
        />
        <button
          data-testid="update-milestone"
          onClick={() => updateMilestone("m1", { completed: true })}
        />
        <button
          data-testid="delete-milestone"
          onClick={() => deleteMilestone("m1")}
        />
        <button
          data-testid="add-keyresult"
          onClick={() => addKeyResult(mockKeyResult)}
        />
        <button
          data-testid="update-keyresult"
          onClick={() => updateKeyResult("kr1", { currentValue: 75 })}
        />
        <button
          data-testid="delete-keyresult"
          onClick={() => deleteKeyResult("kr1")}
        />
        <button
          data-testid="set-goals"
          onClick={() => setGoals([mockGoal])}
        />
        <button
          data-testid="set-milestones"
          onClick={() => setMilestones([mockMilestone])}
        />
        <button
          data-testid="set-keyresults"
          onClick={() => setKeyResults([mockKeyResult])}
        />
      </div>
    );
  };

  const renderWithProvider = () => {
    return render(
      <GoalProvider>
        <TestComponent />
      </GoalProvider>
    );
  };

  it("should initialize with empty state", () => {
    const { getByTestId } = renderWithProvider();

    expect(getByTestId("goals-count").textContent).toBe("0");
    expect(getByTestId("milestones-count").textContent).toBe("0");
    expect(getByTestId("keyresults-count").textContent).toBe("0");
  });

  it("should add a goal", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-goal").click();
    });

    expect(getByTestId("goals-count").textContent).toBe("1");
  });

  it("should update a goal", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-goal").click();
    });

    act(() => {
      getByTestId("update-goal").click();
    });

    expect(getByTestId("goals-count").textContent).toBe("1");
  });

  it("should delete a goal", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-goal").click();
    });

    expect(getByTestId("goals-count").textContent).toBe("1");

    act(() => {
      getByTestId("delete-goal").click();
    });

    expect(getByTestId("goals-count").textContent).toBe("0");
  });

  it("should delete associated milestones when deleting a goal", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-goal").click();
    });

    act(() => {
      getByTestId("add-milestone").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("1");

    act(() => {
      getByTestId("delete-goal").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("0");
  });

  it("should delete associated key results when deleting a goal", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-goal").click();
    });

    act(() => {
      getByTestId("add-keyresult").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("1");

    act(() => {
      getByTestId("delete-goal").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("0");
  });

  it("should add a milestone", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-milestone").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("1");
  });

  it("should update a milestone", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-milestone").click();
    });

    act(() => {
      getByTestId("update-milestone").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("1");
  });

  it("should delete a milestone", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-milestone").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("1");

    act(() => {
      getByTestId("delete-milestone").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("0");
  });

  it("should add a key result", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-keyresult").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("1");
  });

  it("should update a key result", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-keyresult").click();
    });

    act(() => {
      getByTestId("update-keyresult").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("1");
  });

  it("should delete a key result", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("add-keyresult").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("1");

    act(() => {
      getByTestId("delete-keyresult").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("0");
  });

  it("should set goals directly", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("set-goals").click();
    });

    expect(getByTestId("goals-count").textContent).toBe("1");
  });

  it("should set milestones directly", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("set-milestones").click();
    });

    expect(getByTestId("milestones-count").textContent).toBe("1");
  });

  it("should set key results directly", () => {
    const { getByTestId } = renderWithProvider();

    act(() => {
      getByTestId("set-keyresults").click();
    });

    expect(getByTestId("keyresults-count").textContent).toBe("1");
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
