"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultHubStatusVisibility,
  HUB_STATUS_VISIBILITY_STORAGE_KEY,
  isHubStatusVisibility,
  type HubStatusVisibility,
} from "@/lib/hub-status-visibility";

function readStatusVisibilityPreference(): HubStatusVisibility {
  try {
    const documentPreference =
      document.documentElement.dataset.statusVisibility;
    if (isHubStatusVisibility(documentPreference)) return documentPreference;

    const storedPreference = window.localStorage.getItem(
      HUB_STATUS_VISIBILITY_STORAGE_KEY,
    );
    return isHubStatusVisibility(storedPreference)
      ? storedPreference
      : defaultHubStatusVisibility;
  } catch {
    return defaultHubStatusVisibility;
  }
}

function applyStatusVisibility(preference: HubStatusVisibility) {
  document.documentElement.dataset.statusVisibility = preference;
}

export function useStatusVisibilityPreference() {
  const [statusVisibility, setStatusVisibility] = useState<HubStatusVisibility>(
    defaultHubStatusVisibility,
  );

  useEffect(() => {
    const preferredVisibility = readStatusVisibilityPreference();
    applyStatusVisibility(preferredVisibility);
    const frame = window.requestAnimationFrame(() =>
      setStatusVisibility(preferredVisibility),
    );
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateStatusVisibility = useCallback(
    (nextVisibility: HubStatusVisibility) => {
      setStatusVisibility(nextVisibility);
      applyStatusVisibility(nextVisibility);
      try {
        window.localStorage.setItem(
          HUB_STATUS_VISIBILITY_STORAGE_KEY,
          nextVisibility,
        );
      } catch {
        // The in-memory preference still works when storage is unavailable.
      }
    },
    [],
  );

  return [statusVisibility, updateStatusVisibility] as const;
}
