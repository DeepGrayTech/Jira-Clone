"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ViewMode } from "../types";

const VALID_VIEW_MODES: ViewMode[] = [
  "TASKS",
  "REQUIREMENTS",
  "TESTING",
  "BUGS",
  "GOALS",
  "AUDIT",
  "NOTIFICATIONS",
];

export function useViewMode() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialViewMode = (searchParams.get("view") as ViewMode) || "TASKS";
  const [viewMode, setViewMode] = useState<ViewMode>(
    VALID_VIEW_MODES.includes(initialViewMode) ? initialViewMode : "TASKS"
  );

  useEffect(() => {
    const urlView = searchParams.get("view") as ViewMode;
    if (urlView && VALID_VIEW_MODES.includes(urlView) && urlView !== viewMode) {
      setViewMode(urlView);
    }
  }, [searchParams]);

  const handleViewModeChange = useCallback(
    (newViewAction: React.SetStateAction<ViewMode>) => {
      const newView =
        typeof newViewAction === "function"
          ? newViewAction(viewMode)
          : newViewAction;
      console.log(
        `[Router] handleViewModeChange | START | newView=${newView} | currentView=${viewMode}`
      );
      console.log(
        `[Router] handleViewModeChange | searchParams before=${searchParams.toString()}`
      );

      setViewMode(newView);

      const params = new URLSearchParams(searchParams);
      const prevView = params.get("view");
      params.set("view", newView);
      const newUrl = `/dashboard?${params.toString()}`;

      console.log(
        `[Router] handleViewModeChange | transitioning | from=${prevView} | to=${newView} | url=${newUrl}`
      );

      router.push(newUrl, { scroll: false });

      console.log(
        `[Router] handleViewModeChange | COMPLETE | viewMode state updated to=${newView}`
      );
    },
    [router, searchParams, viewMode]
  );

  return {
    viewMode,
    setViewMode: handleViewModeChange,
    VALID_VIEW_MODES,
  };
}
