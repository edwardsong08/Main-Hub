"use client";

import { useEffect, useState } from "react";
import type { HubLiveStatusSnapshot } from "@/lib/live-status";

const REFRESH_INTERVAL_MS = 60_000;

export function useLiveHubStatus() {
  const [snapshot, setSnapshot] = useState<HubLiveStatusSnapshot | null>(null);

  useEffect(() => {
    let active = true;
    let controller: AbortController | null = null;

    async function refresh() {
      controller?.abort();
      controller = new AbortController();

      try {
        const response = await fetch("/api/status", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) return;

        const nextSnapshot = (await response.json()) as HubLiveStatusSnapshot;
        if (active) setSnapshot(nextSnapshot);
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    function refreshWhenVisible() {
      if (document.visibilityState === "visible") void refresh();
    }

    void refresh();
    const interval = window.setInterval(refresh, REFRESH_INTERVAL_MS);
    document.addEventListener("visibilitychange", refreshWhenVisible);

    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshWhenVisible);
    };
  }, []);

  return snapshot;
}

