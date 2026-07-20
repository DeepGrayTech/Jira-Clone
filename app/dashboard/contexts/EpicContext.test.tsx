"use client";

import { render, screen, act, waitFor } from "@testing-library/react";
import React from "react";
import { EpicProvider, useEpics } from "./EpicContext";
import type { Epic } from "../types";

const initialEpics: Epic[] = [
  {
    id: "epic1",
    title: "Test Epic 1",
    description: "Description for test epic 1",
    color: "#3b82f6",
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    updatedAt: "2026-01-01T00:00:00Z",
  },
  {
    id: "epic2",
    title: "Test Epic 2",
    description: "Description for test epic 2",
    color: "#f472b6",
    status: "ACTIVE",
    createdAt: "2026-01-02T00:00:00Z",
    updatedAt: "2026-01-02T00:00:00Z",
  },
];

function TestComponent() {
  const { epics, currentEpicId, addEpic, updateEpic, deleteEpic, getEpicById, setCurrentEpic } = useEpics();

  return (
    <div>
      <div data-testid="epics-count">{epics.length}</div>
      <div data-testid="current-epic-id">{currentEpicId || "null"}</div>
      <button
        data-testid="add-epic"
        onClick={() =>
          addEpic({
            id: "epic3",
            title: "Test Epic 3",
            description: "Description for test epic 3",
            color: "#ef4444",
            status: "ACTIVE",
            createdAt: "2026-01-03T00:00:00Z",
            updatedAt: "2026-01-03T00:00:00Z",
          })
        }
      >
        Add Epic
      </button>
      <button
        data-testid="update-epic"
        onClick={() => updateEpic("epic1", { title: "Updated Epic 1" })}
      >
        Update Epic
      </button>
      <button
        data-testid="delete-epic"
        onClick={() => deleteEpic("epic1")}
      >
        Delete Epic
      </button>
      <button
        data-testid="set-current-epic"
        onClick={() => setCurrentEpic("epic2")}
      >
        Set Current Epic
      </button>
      <button
        data-testid="clear-current-epic"
        onClick={() => setCurrentEpic(null)}
      >
        Clear Current Epic
      </button>
      <div data-testid="get-epic-1">{getEpicById("epic1")?.title || "not found"}</div>
      <div data-testid="get-epic-nonexistent">{getEpicById("nonexistent")?.title || "not found"}</div>
    </div>
  );
}

function Wrapper({ children }: { children: React.ReactNode }) {
  return <EpicProvider initialEpics={initialEpics}>{children}</EpicProvider>;
}

describe("EpicContext", () => {
  it("should provide initial epics", () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("epics-count").textContent).toBe("2");
    expect(screen.getByTestId("current-epic-id").textContent).toBe("null");
  });

  it("should add a new epic", async () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("epics-count").textContent).toBe("2");
    
    act(() => {
      screen.getByTestId("add-epic").click();
    });
    
    expect(screen.getByTestId("epics-count").textContent).toBe("3");
  });

  it("should update an existing epic", async () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("get-epic-1").textContent).toBe("Test Epic 1");
    
    act(() => {
      screen.getByTestId("update-epic").click();
    });
    
    expect(screen.getByTestId("get-epic-1").textContent).toBe("Updated Epic 1");
  });

  it("should delete an epic", async () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("epics-count").textContent).toBe("2");
    
    act(() => {
      screen.getByTestId("delete-epic").click();
    });
    
    expect(screen.getByTestId("epics-count").textContent).toBe("1");
    expect(screen.getByTestId("get-epic-1").textContent).toBe("not found");
  });

  it("should get epic by id", () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("get-epic-1").textContent).toBe("Test Epic 1");
    expect(screen.getByTestId("get-epic-nonexistent").textContent).toBe("not found");
  });

  it("should set and clear current epic", async () => {
    render(<TestComponent />, { wrapper: Wrapper });
    expect(screen.getByTestId("current-epic-id").textContent).toBe("null");
    
    act(() => {
      screen.getByTestId("set-current-epic").click();
    });
    
    expect(screen.getByTestId("current-epic-id").textContent).toBe("epic2");
    
    act(() => {
      screen.getByTestId("clear-current-epic").click();
    });
    
    expect(screen.getByTestId("current-epic-id").textContent).toBe("null");
  });

  it("should clear current epic when deleted", async () => {
    function TestComponentWithDeleteCurrent() {
      const { epics, currentEpicId, addEpic, updateEpic, deleteEpic, getEpicById, setCurrentEpic } = useEpics();

      return (
        <div>
          <div data-testid="epics-count">{epics.length}</div>
          <div data-testid="current-epic-id">{currentEpicId || "null"}</div>
          <button
            data-testid="set-current-epic-1"
            onClick={() => setCurrentEpic("epic1")}
          >
            Set Current Epic 1
          </button>
          <button
            data-testid="delete-current-epic"
            onClick={() => currentEpicId && deleteEpic(currentEpicId)}
          >
            Delete Current Epic
          </button>
          <div data-testid="get-epic-1">{getEpicById("epic1")?.title || "not found"}</div>
        </div>
      );
    }
    
    render(<TestComponentWithDeleteCurrent />, { wrapper: Wrapper });
    
    act(() => {
      screen.getByTestId("set-current-epic-1").click();
    });
    
    expect(screen.getByTestId("current-epic-id").textContent).toBe("epic1");
    
    act(() => {
      screen.getByTestId("delete-current-epic").click();
    });
    
    expect(screen.getByTestId("current-epic-id").textContent).toBe("null");
    expect(screen.getByTestId("get-epic-1").textContent).toBe("not found");
  });

  it("should work with empty initial epics", () => {
    function EmptyWrapper({ children }: { children: React.ReactNode }) {
      return <EpicProvider initialEpics={[]}>{children}</EpicProvider>;
    }
    
    render(<TestComponent />, { wrapper: EmptyWrapper });
    expect(screen.getByTestId("epics-count").textContent).toBe("0");
  });
});