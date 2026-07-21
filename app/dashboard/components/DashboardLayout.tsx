"use client";

import { NotificationProvider } from "../contexts/NotificationContext";
import { EpicProvider } from "../contexts/EpicContext";
import { TaskProvider } from "../contexts/TaskContext";
import { RequirementProvider } from "../contexts/RequirementContext";
import { BugProvider } from "../contexts/BugContext";
import { GoalProvider } from "../contexts/GoalContext";
import { AuditProvider } from "../contexts/AuditContext";
import { TestCaseProvider } from "../contexts/TestCaseContext";
import { SharedProvider } from "../contexts/SharedContext";
import DashboardShell from "./DashboardShell";

export default function DashboardLayout() {
  return (
    <NotificationProvider>
      <EpicProvider>
        <TaskProvider>
          <RequirementProvider>
            <BugProvider>
              <GoalProvider>
                <AuditProvider>
                  <TestCaseProvider>
                    <SharedProvider>
                      <DashboardShell />
                    </SharedProvider>
                  </TestCaseProvider>
                </AuditProvider>
              </GoalProvider>
            </BugProvider>
          </RequirementProvider>
        </TaskProvider>
      </EpicProvider>
    </NotificationProvider>
  );
}
