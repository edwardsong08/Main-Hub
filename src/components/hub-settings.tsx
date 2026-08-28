"use client";

import { useEffect, useId, useRef, useState } from "react";

export function HubSettings({
  networkActivityEnabled,
  onNetworkActivityChange,
}: {
  networkActivityEnabled: boolean;
  onNetworkActivityChange: (enabled: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
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
          <div>
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
      ) : null}
    </div>
  );
}
