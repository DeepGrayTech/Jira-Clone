"use client";

import { useEpicsOptional } from "../contexts/EpicContext";

interface EpicBadgeProps {
  epicId?: string;
  fontSizeScale?: number;
}

/**
 * Small colored badge showing which epic a card belongs to.
 * Renders nothing when the card has no epic, the epic is unknown,
 * or no EpicProvider is present (e.g. provider-less unit tests).
 */
export default function EpicBadge({ epicId, fontSizeScale = 1 }: EpicBadgeProps) {
  const epicsContext = useEpicsOptional();
  if (!epicId || !epicsContext) return null;
  const epic = epicsContext.epics.find((e) => e.id === epicId);
  if (!epic) return null;

  return (
    <span
      data-testid={`epic-badge-${epic.id}`}
      title={`Epic: ${epic.title}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: `${4 * fontSizeScale}px`,
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: `${9 * fontSizeScale}px`,
        fontWeight: 600,
        color: epic.color,
        background: `${epic.color}15`,
        maxWidth: "100%",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      <span
        style={{
          width: `${6 * fontSizeScale}px`,
          height: `${6 * fontSizeScale}px`,
          borderRadius: "50%",
          background: epic.color,
          flexShrink: 0,
        }}
      />
      {epic.title}
    </span>
  );
}
