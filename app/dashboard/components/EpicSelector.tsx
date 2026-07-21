"use client";

import { useState, useEffect, useRef, useCallback, useMemo, memo } from "react";
import { COLORS, NO_EPIC_FILTER } from "../constants";
import type { Epic } from "../types";

interface EpicSelectorProps {
  epics: Epic[];
  currentEpicId: string | null;
  onEpicChange: (epicId: string | null) => void;
  onNewEpic: () => void;
  onEditEpic: (epic: Epic) => void;
  onDeleteEpic: (epicId: string) => void;
  fontSizeScale: number;
}

interface EpicListItemProps {
  epic: Epic;
  isCurrent: boolean;
  fontSizeScale: number;
  onSelect: (id: string) => void;
  onEdit: (epic: Epic) => void;
  onDelete: (id: string) => void;
}

const EpicListItem = memo(function EpicListItem({
  epic,
  isCurrent,
  fontSizeScale,
  onSelect,
  onEdit,
  onDelete,
}: EpicListItemProps) {
  const buttonStyle = useMemo(() => ({
    flex: 1,
    padding: `${10 * fontSizeScale}px ${16 * fontSizeScale}px`,
    textAlign: "left" as const,
    background: isCurrent ? COLORS.buttonPrimary : "transparent",
    color: isCurrent ? "#ffffff" : COLORS.text,
    border: "none",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: `${8 * fontSizeScale}px`,
  }), [fontSizeScale, isCurrent]);

  const actionButtonStyle = useMemo(() => ({
    padding: `${8 * fontSizeScale}px`,
    background: "transparent",
    border: "none",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    display: "flex" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    width: `${32 * fontSizeScale}px`,
    height: `${32 * fontSizeScale}px`,
  }), [fontSizeScale]);

  const dotStyle = useMemo(() => ({
    width: `${10 * fontSizeScale}px`,
    height: `${10 * fontSizeScale}px`,
    borderRadius: "50%",
    backgroundColor: epic.color,
    display: "inline-block" as const,
  }), [fontSizeScale, epic.color]);

  const handleSelect = useCallback(() => {
    onSelect(epic.id);
  }, [onSelect, epic.id]);

  const handleEdit = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onEdit(epic);
  }, [onEdit, epic]);

  const handleDelete = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onDelete(epic.id);
  }, [onDelete, epic.id]);

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        width: "100%",
      }}
    >
      <button onClick={handleSelect} style={buttonStyle}>
        <span style={dotStyle} />
        {epic.title}
      </button>
      <button onClick={handleEdit} style={{ ...actionButtonStyle, color: "#3b82f6" }} title="Edit Epic">
        ✏️
      </button>
      <button onClick={handleDelete} style={{ ...actionButtonStyle, color: "#ef4444" }} title="Delete Epic">
        ×
      </button>
    </div>
  );
});

function EpicSelector({
  epics,
  currentEpicId,
  onEpicChange,
  onNewEpic,
  onEditEpic,
  onDeleteEpic,
  fontSizeScale,
}: EpicSelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const currentEpic = epics.find((e) => e.id === currentEpicId);

  const activeEpics = useMemo(() => {
    return epics.filter((e) => e.status === "ACTIVE");
  }, [epics]);

  const handleSelectEpic = useCallback((id: string) => {
    onEpicChange(id);
    setIsOpen(false);
  }, [onEpicChange]);

  const handleEditEpicItem = useCallback((epic: Epic) => {
    onEditEpic(epic);
    setIsOpen(false);
  }, [onEditEpic]);

  const handleDeleteEpicItem = useCallback((id: string) => {
    onDeleteEpic(id);
  }, [onDeleteEpic]);

  const toggleButtonStyle = useMemo(() => ({
    padding: `${8 * fontSizeScale}px ${16 * fontSizeScale}px`,
    background: COLORS.buttonSecondary,
    color: COLORS.text,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    fontWeight: 600,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: `${8 * fontSizeScale}px`,
    minWidth: `${180 * fontSizeScale}px`,
    justifyContent: "space-between" as const,
  }), [fontSizeScale]);

  const dropdownStyle = useMemo(() => ({
    position: "absolute" as const,
    top: "100%",
    left: 0,
    right: 0,
    marginTop: "4px",
    background: COLORS.cardBackground,
    border: `1px solid ${COLORS.border}`,
    borderRadius: "6px",
    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    zIndex: 1000,
    maxHeight: `${300 * fontSizeScale}px`,
    overflowY: "auto" as const,
  }), [fontSizeScale]);

  const allEpicsButtonStyle = useMemo(() => ({
    width: "100%",
    padding: `${10 * fontSizeScale}px ${16 * fontSizeScale}px`,
    textAlign: "left" as const,
    background: currentEpicId === null ? COLORS.buttonPrimary : "transparent",
    color: currentEpicId === null ? "#ffffff" : COLORS.text,
    border: "none",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: `${8 * fontSizeScale}px`,
  }), [fontSizeScale, currentEpicId]);

  const noEpicButtonStyle = useMemo(() => ({
    width: "100%",
    padding: `${10 * fontSizeScale}px ${16 * fontSizeScale}px`,
    textAlign: "left" as const,
    background: currentEpicId === NO_EPIC_FILTER ? COLORS.buttonPrimary : "transparent",
    color: currentEpicId === NO_EPIC_FILTER ? "#ffffff" : COLORS.text,
    border: "none",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: `${8 * fontSizeScale}px`,
  }), [fontSizeScale, currentEpicId]);

  const newEpicButtonStyle = useMemo(() => ({
    width: "100%",
    padding: `${10 * fontSizeScale}px ${16 * fontSizeScale}px`,
    textAlign: "left" as const,
    background: "transparent",
    color: COLORS.buttonPrimary,
    border: "none",
    cursor: "pointer" as const,
    fontSize: `${14 * fontSizeScale}px`,
    fontWeight: 600,
    display: "flex" as const,
    alignItems: "center" as const,
    gap: `${8 * fontSizeScale}px`,
  }), [fontSizeScale]);

  const handleAllEpicsClick = useCallback(() => {
    onEpicChange(null);
    setIsOpen(false);
  }, [onEpicChange]);

  const handleNoEpicClick = useCallback(() => {
    onEpicChange(NO_EPIC_FILTER);
    setIsOpen(false);
  }, [onEpicChange]);

  const handleNewEpicClick = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
    e.stopPropagation();
    onNewEpic();
    setIsOpen(false);
  }, [onNewEpic]);

  return (
    <div ref={dropdownRef} style={{ position: "relative", display: "inline-block" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Select Epic"
        aria-haspopup="true"
        aria-expanded={isOpen}
        style={toggleButtonStyle}
      >
        {currentEpicId === NO_EPIC_FILTER ? (
          <>
            <span
              style={{
                width: `${12 * fontSizeScale}px`,
                height: `${12 * fontSizeScale}px`,
                borderRadius: "50%",
                border: "1px dashed #9ca3af",
                display: "inline-block",
                boxSizing: "border-box",
              }}
            />
            <span style={{ flex: 1, textAlign: "left" }}>No Epic</span>
          </>
        ) : currentEpic ? (
          <>
            <span
              style={{
                width: `${12 * fontSizeScale}px`,
                height: `${12 * fontSizeScale}px`,
                borderRadius: "50%",
                backgroundColor: currentEpic.color,
                display: "inline-block",
              }}
            />
            <span style={{ flex: 1, textAlign: "left" }}>{currentEpic.title}</span>
          </>
        ) : (
          <span>All Epics</span>
        )}
        <span style={{ fontSize: `${16 * fontSizeScale}px` }}>{isOpen ? "▲" : "▼"}</span>
      </button>

      {isOpen && (
        <div style={dropdownStyle}>
          <button onClick={handleAllEpicsClick} style={allEpicsButtonStyle}>
            <span
              style={{
                width: `${10 * fontSizeScale}px`,
                height: `${10 * fontSizeScale}px`,
                borderRadius: "50%",
                backgroundColor: "#6b7280",
                display: "inline-block",
              }}
            />
            All Epics
          </button>

          <button onClick={handleNoEpicClick} style={noEpicButtonStyle}>
            <span
              style={{
                width: `${10 * fontSizeScale}px`,
                height: `${10 * fontSizeScale}px`,
                borderRadius: "50%",
                border: "1px dashed #9ca3af",
                display: "inline-block",
                boxSizing: "border-box",
              }}
            />
            No Epic
          </button>

          <div style={{ borderTop: `1px solid ${COLORS.border}` }} />

          {activeEpics.length === 0 ? (
            <div
              style={{
                padding: `${16 * fontSizeScale}px`,
                textAlign: "center",
                color: COLORS.textSecondary,
                fontSize: `${14 * fontSizeScale}px`,
              }}
            >
              No epics available
            </div>
          ) : (
            activeEpics.map((epic) => (
              <EpicListItem
                key={epic.id}
                epic={epic}
                isCurrent={currentEpicId === epic.id}
                fontSizeScale={fontSizeScale}
                onSelect={handleSelectEpic}
                onEdit={handleEditEpicItem}
                onDelete={handleDeleteEpicItem}
              />
            ))
          )}

          <div style={{ borderTop: `1px solid ${COLORS.border}` }} />

          <button onClick={handleNewEpicClick} style={newEpicButtonStyle}>
            <span style={{ fontSize: `${16 * fontSizeScale}px` }}>+</span>
            New Epic
          </button>
        </div>
      )}
    </div>
  );
}

export default memo(EpicSelector);