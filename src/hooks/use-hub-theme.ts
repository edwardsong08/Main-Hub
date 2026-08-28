"use client";

import { useCallback, useEffect, useState } from "react";
import {
  defaultHubTheme,
  HUB_THEME_STORAGE_KEY,
  isHubTheme,
  type HubTheme,
} from "@/lib/hub-theme";

function readThemePreference(): HubTheme {
  try {
    const documentTheme = document.documentElement.dataset.theme;
    if (isHubTheme(documentTheme)) return documentTheme;

    const storedTheme = window.localStorage.getItem(HUB_THEME_STORAGE_KEY);
    return isHubTheme(storedTheme) ? storedTheme : defaultHubTheme;
  } catch {
    return defaultHubTheme;
  }
}

function applyTheme(theme: HubTheme) {
  document.documentElement.dataset.theme = theme;
}

export function useHubTheme() {
  const [theme, setTheme] = useState<HubTheme>(defaultHubTheme);

  useEffect(() => {
    const preferredTheme = readThemePreference();
    applyTheme(preferredTheme);
    const frame = window.requestAnimationFrame(() => setTheme(preferredTheme));
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const updateTheme = useCallback((nextTheme: HubTheme) => {
    setTheme(nextTheme);
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(HUB_THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The in-memory theme still works when storage is unavailable.
    }
  }, []);

  return [theme, updateTheme] as const;
}
