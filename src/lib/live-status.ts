import type { HubNodeHealth } from "@/lib/hub-graph";

export type HubLiveNodeStatus = {
  sourceId: string;
  sourceLabel: string;
  pageUrl: string;
  monitorId: number;
  monitorName: string;
  health: HubNodeHealth;
  checkedAt: string | null;
  message: string | null;
  ping: number | null;
  uptime24h: number | null;
};

export type HubLiveStatusSource = {
  id: string;
  label: string;
  available: boolean;
  pageUrl: string;
};

export type HubLiveStatusSnapshot = {
  source: "uptime-kuma";
  available: boolean;
  updatedAt: string;
  pageUrl: string;
  sources: HubLiveStatusSource[];
  nodes: Record<string, HubLiveNodeStatus>;
};
