"use client";

import { COLORS } from "../constants";
import type { ViewMode } from "../types";

interface DashboardNavigationProps {
  currentView: ViewMode;
  onViewChange: (view: ViewMode) => void;
  fontSizeScale: number;
}

const navItems: { id: ViewMode; label: string; icon: string }[] = [
  { id: "TASKS", label: "Tasks", icon: "📋" },
  { id: "REQUIREMENTS", label: "Requirements", icon: "📝" },
  { id: "TESTING", label: "Testing", icon: "🧪" },
  { id: "BUGS", label: "Bugs", icon: "🐛" },
  { id: "GOALS", label: "Goals", icon: "🎯" },
  { id: "AUDIT", label: "Audit", icon: "🔍" },
];

export default function DashboardNavigation({
  currentView,
  onViewChange,
  fontSizeScale,
}: DashboardNavigationProps) {
  return (
    <nav
      style={{
        display: "flex",
        gap: "4px",
        padding: "16px 0",
        borderBottom: `2px solid ${COLORS.border}`,
        flexWrap: "wrap",
      }}
    >
      {navItems.map((item) => (
        <button
          key={item.id}
          onClick={() => onViewChange(item.id)}
          aria-label={`Navigate to ${item.label} view`}
          aria-current={currentView === item.id ? "page" : undefined}
          style={{
            padding: `${10 * fontSizeScale}px ${16 * fontSizeScale}px`,
            background:
              currentView === item.id
                ? COLORS.buttonPrimary
                : COLORS.buttonSecondary,
            color: currentView === item.id ? "#ffffff" : COLORS.text,
            border: "none",
            borderRadius: "6px",
            cursor: "pointer",
            fontSize: `${14 * fontSizeScale}px`,
            fontWeight: 600,
            transition: "all 0.2s",
            display: "flex",
            alignItems: "center",
            gap: `${8 * fontSizeScale}px`,
          }}
          onMouseOver={(e) => {
            if (currentView !== item.id) {
              e.currentTarget.style.background = "#e5e7eb";
            }
          }}
          onMouseOut={(e) => {
            if (currentView !== item.id) {
              e.currentTarget.style.background = COLORS.buttonSecondary;
            }
          }}
        >
          <span style={{ fontSize: `${16 * fontSizeScale}px` }}>{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  );
}