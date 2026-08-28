"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "es-hub:settings:v1";

type StoredHubSettingsV2 = {
  version: 2;
  networkActivity: boolean;
};

type StoredHubSettings = {
  version?: number;
  signalFlow?: unknown;
  networkActivity?: unknown;
};

function readStoredPreference(): boolean | null {
  try {
    const rawSettings = window.localStorage.getItem(STORAGE_KEY);
    if (!rawSettings) return null;

    const settings = JSON.parse(rawSettings) as StoredHubSettings;
    if (
      settings.version === 2 &&
      typeof settings.networkActivity === "boolean"
    ) {
      return settings.networkActivity;
    }
    if (settings.version === 1 && typeof settings.signalFlow === "boolean") {
      return settings.signalFlow;
    }
    return null;
  } catch {
    return null;
  }
}

export function useNetworkActivityPreference() {
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    const storedPreference = readStoredPreference();
    const initialPreference =
      storedPreference ??
      (!window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
        !window.matchMedia("(max-width: 760px)").matches);
    const frame = window.requestAnimationFrame(() => {
      setEnabled(initialPreference);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updatePreference = useCallback((nextEnabled: boolean) => {
    setEnabled(nextEnabled);
    try {
      const settings: StoredHubSettingsV2 = {
        version: 2,
        networkActivity: nextEnabled,
      };
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    } catch {
      // The in-memory preference still works when storage is unavailable.
    }
  }, []);

  return [enabled, updatePreference] as const;
}
