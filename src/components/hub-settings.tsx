"use client";

import { useEffect, useId, useRef, useState } from "react";
import type { HubStatusVisibility } from "@/lib/hub-status-visibility";
import { hubThemes, isHubTheme, type HubTheme } from "@/lib/hub-theme";

export function HubSettings({
  networkActivityEnabled,
  statusVisibility,
  theme,
  onNetworkActivityChange,
  onStatusVisibilityChange,
  onThemeChange,
}: {
  networkActivityEnabled: boolean;
  statusVisibility: HubStatusVisibility;
  theme: HubTheme;
  onNetworkActivityChange: (enabled: boolean) => void;
  onStatusVisibilityChange: (visibility: HubStatusVisibility) => void;
  onThemeChange: (theme: HubTheme) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  const themeSelectId = useId();
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div className="hub-settings" ref={containerRef}>
      <button
        type="button"
        className="settings-trigger"
        aria-label="Map settings"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((current) => !current)}
      >
        <span aria-hidden="true">⚙</span>
      </button>
      {open ? (
        <div className="settings-popover" id={menuId} aria-label="Map settings">
          <div className="settings-row">
            <div className="settings-copy">
              <strong>Network activity</strong>
              <span>Directed traffic paths</span>
            </div>
            <button
              type="button"
              className="settings-switch"
              role="switch"
              aria-checked={networkActivityEnabled}
              aria-label="Network activity"
              onClick={() => onNetworkActivityChange(!networkActivityEnabled)}
            >
              <i aria-hidden="true" />
            </button>
          </div>
          <div className="settings-theme-row">
            <div className="settings-copy">
              <strong>Status signals</strong>
              <span>Uptime and catalog states</span>
            </div>
            <button
              type="button"
              className="settings-switch"
              role="switch"
              aria-checked={statusVisibility === "show"}
              aria-label="Status signals"
              onClick={() =>
                onStatusVisibilityChange(
                  statusVisibility === "show" ? "hide" : "show",
                )
              }
            >
              <i aria-hidden="true" />
            </button>
          </div>
          <div className="settings-theme-row">
            <label className="settings-copy" htmlFor={themeSelectId}>
              <strong>Theme</strong>
              <span>Map atmosphere and palette</span>
            </label>
            <div className="settings-select-control theme-select-control">
              <span className={`theme-swatch theme-swatch-${theme}`} aria-hidden="true">
                <i />
                <i />
                <i />
              </span>
              <select
                id={themeSelectId}
                aria-label="Theme"
                value={theme}
                onChange={(event) => {
                  if (isHubTheme(event.target.value)) {
                    onThemeChange(event.target.value);
                  }
                }}
              >
                {hubThemes.map((themeOption) => (
                  <option key={themeOption.id} value={themeOption.id}>
                    {themeOption.label}
                  </option>
                ))}
              </select>
              <span className="theme-select-chevron" aria-hidden="true">⌄</span>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
